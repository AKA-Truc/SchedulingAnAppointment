import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SendMessageDto } from './DTO/SendMessage.dto';
import { MongoPrismaService } from 'src/prisma/mongo-prisma.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ChatService {
    constructor(private mongo: MongoPrismaService,
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async getOrCreateConversation(userA: number, userB: number) {
        const [user1, user2] = [userA, userB].sort((a, b) => a - b);

        let conversation = await this.mongo.conversation.findFirst({
            where: { user1, user2 },
        });

        if (!conversation) {
            conversation = await this.mongo.conversation.create({
                data: { user1, user2 },
            });
            console.log(`🆕 Tạo cuộc trò chuyện mới giữa ${user1} và ${user2}: ${conversation.id}`);
        } else {
            console.log(`✅ Đã tìm thấy cuộc trò chuyện: ${conversation.id}`);
        }

        return conversation;
    }

    async saveMessage(dto: SendMessageDto) {
        const conversation = await this.getOrCreateConversation(dto.fromUserId, dto.toUserId);

        const savedMessage = await this.mongo.message.create({
            data: {
                fromUser: dto.fromUserId,
                toUser: dto.toUserId,
                content: dto.content,
                read: false,
                timestamp: new Date(),
                conversation: {
                    connect: { id: conversation.id },
                },
            },
        });

        console.log(`💾 Đã lưu tin nhắn từ ${dto.fromUserId} đến ${dto.toUserId}:`, savedMessage);

        return {
            ...savedMessage,
            conversationId: conversation.id,
        };
    }


    async getConversationMessages(userA: number, userB: number, page = 1, limit = 20) {
        const [user1, user2] = [userA, userB].sort((a, b) => a - b);

        const conversation = await this.mongo.conversation.findFirst({
            where: { user1, user2 },
        });

        if (!conversation) {
            return {
                messages: [],
                page,
                limit,
                totalMessages: 0,
                totalPages: 0,
            };
        }

        return this.getConversationMessagesById(conversation.id, page, limit);
    }

    async getConversationMessagesById(conversationId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [messages, totalMessages] = await Promise.all([
            this.mongo.message.findMany({
                where: { conversationId },
                orderBy: { timestamp: 'asc' },
                skip,
                take: limit,
            }),
            this.mongo.message.count({ where: { conversationId } }),
        ]);

        return {
            messages,
            page,
            limit,
            totalMessages,
            totalPages: Math.ceil(totalMessages / limit),
        };
    }

    async getUserConversations(token: string) {
        let userId: number;

        // 1. Giải mã token để lấy userId
        try {
            const payload = this.jwtService.verify(token);
            userId = payload.sub;
            if (!userId) throw new Error();
        } catch (err) {
            throw new BadRequestException("Token không hợp lệ hoặc đã hết hạn");
        }

        // 2. Kiểm tra user có tồn tại không
        const user = await this.prisma.user.findUnique({
            where: { userId },
        });

        if (!user) {
            throw new NotFoundException("Không tìm thấy người dùng");
        }

        // 3. Lấy các cuộc trò chuyện từ MongoDB
        const conversations = await this.mongo.conversation.findMany({
            where: {
                OR: [{ user1: userId }, { user2: userId }],
            },
            orderBy: { updatedAt: "desc" },
            include: {
                messages: {
                    orderBy: { timestamp: "desc" },
                    take: 1,
                },
            },
        });

        if (!conversations.length) return [];

        const conversationIds = conversations.map((c) => c.id);

        // 4. Lấy số tin chưa đọc cho từng cuộc trò chuyện
        const unreadCounts = await this.mongo.message.groupBy({
            by: ['conversationId'],
            where: {
                conversationId: { in: conversationIds },
                toUser: userId,
                read: false,
            },
            _count: {
                _all: true,
            },
        });

        const unreadMap = new Map(unreadCounts.map((uc) => [uc.conversationId, uc._count._all]));

        // 5. Lấy userId của đối phương
        const otherUserIds = Array.from(
            new Set(conversations.map((c) => (c.user1 === userId ? c.user2 : c.user1)))
        );

        // 6. Lấy thông tin người dùng đối phương
        const users = await this.prisma.user.findMany({
            where: { userId: { in: otherUserIds } },
        });

        const userMap = new Map(users.map((u) => [u.userId, u]));

        // 7. Trả về danh sách cuộc trò chuyện
        return conversations.map((c) => {
            const otherUserId = c.user1 === userId ? c.user2 : c.user1;
            const otherUser = userMap.get(otherUserId);

            return {
                id: c.id,
                lastMessage: c.messages[0]?.content ?? "",
                lastTime: c.messages[0]?.timestamp ?? c.updatedAt,
                otherUser,
                unreadCount: unreadMap.get(c.id) ?? 0, // ✅ thêm unreadCount
            };
        });
    }


    async createConversation(userIdA: number, userIdB: number) {
        if (userIdA === userIdB) {
            throw new BadRequestException('Không thể tạo cuộc trò chuyện với chính mình');
        }

        const [user1, user2] = [userIdA, userIdB].sort((a, b) => a - b);

        // Kiểm tra người dùng tồn tại
        const users = await this.prisma.user.findMany({
            where: { userId: { in: [user1, user2] } },
        });

        if (users.length !== 2) {
            throw new NotFoundException('Một hoặc cả hai người dùng không tồn tại');
        }

        // Kiểm tra cuộc trò chuyện đã tồn tại
        const existing = await this.mongo.conversation.findFirst({
            where: { user1, user2 },
        });

        if (existing) {
            return {
                message: 'Cuộc trò chuyện đã tồn tại',
                conversationId: existing.id,
            };
        }

        // Tạo mới cuộc trò chuyện
        const conversation = await this.mongo.conversation.create({
            data: { user1, user2 },
        });

        return {
            message: 'Tạo cuộc trò chuyện thành công',
            conversationId: conversation.id,
        };
    }

    async markMessagesAsRead(conversationId: string, userId: number) {
        const result = await this.mongo.message.updateMany({
            where: {
                conversationId,
                toUser: userId,     // ✅ Chỉ tin gửi tới user đang đọc
                read: false,
            },
            data: {
                read: true,
                readAt: new Date(),
            },
        });

        console.log(`✅ Đánh dấu ${result.count} tin nhắn là đã đọc cho user ${userId} trong cuộc trò chuyện ${conversationId}`);
    }
}
