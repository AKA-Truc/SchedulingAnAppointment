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
        return savedMessage;
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
            const payload = this.jwtService.verify(token)
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

        // 4. Lấy userId của đối phương
        const otherUserIds = Array.from(
            new Set(conversations.map((c) => (c.user1 === userId ? c.user2 : c.user1)))
        );

        // 5. Lấy thông tin người dùng đối phương
        const users = await this.prisma.user.findMany({
            where: { userId: { in: otherUserIds } },
        });

        const userMap = new Map(users.map((u) => [u.userId, u]));

        // 6. Kết hợp dữ liệu và trả về
        return conversations.map((c) => {
            const otherUserId = c.user1 === userId ? c.user2 : c.user1;
            const otherUser = userMap.get(otherUserId);

            return {
                id: c.id,
                lastMessage: c.messages[0]?.content ?? "",
                lastTime: c.messages[0]?.timestamp ?? c.updatedAt,
                otherUser,
            };
        });
    }

}
