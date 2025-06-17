import { Injectable } from '@nestjs/common';
import { SendMessageDto } from './DTO/SendMessage.dto';
import { MongoPrismaService } from 'src/prisma/mongo-prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: MongoPrismaService) { }

    /**
     * Lưu tin nhắn mới vào MongoDB.
     * - Tạo conversationId từ fromUser & toUser.
     * - Ghi nhận nội dung, thời gian gửi, trạng thái đọc (read = false).
     */
    async saveMessage(dto: SendMessageDto) {
        const conversationId = this.generateConversationId(dto.fromUserId, dto.toUserId);

        return this.prisma.message.create({
            data: {
                fromUser: dto.fromUserId,
                toUser: dto.toUserId,
                content: dto.content,
                conversationId,
                read: false,
                timestamp: new Date(),
            },
        });
    }

    /**
     * Sinh conversationId duy nhất từ 2 user (ví dụ: "2_5").
     * Đảm bảo ID luôn giống nhau dù đổi vị trí user.
     */
    generateConversationId(userA: number, userB: number): string {
        return [userA, userB].sort((a, b) => a - b).join('_');
    }

    /**
     * Lấy danh sách tin nhắn giữa 2 người dùng theo conversationId.
     * Có hỗ trợ phân trang (mặc định 20 tin/trang).
     */
    async getConversationMessages(userA: number, userB: number, page = 1, limit = 20) {
        const conversationId = this.generateConversationId(userA, userB);
        const skip = (page - 1) * limit;

        const [messages, totalMessages] = await Promise.all([
            this.prisma.message.findMany({
                where: { conversationId },
                orderBy: { timestamp: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.message.count({ where: { conversationId } }),
        ]);

        return {
            page,
            limit,
            totalMessages,
            totalPages: Math.ceil(totalMessages / limit),
            messages,
        };
    }
}
