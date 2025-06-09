import { Injectable } from '@nestjs/common';
import { SendMessageDto } from './DTO/SendMessage.dto';
import { MongoPrismaService } from 'src/prisma/mongo-prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: MongoPrismaService) { }

    /**
     * Lưu một tin nhắn mới vào cơ sở dữ liệu.
     * - Tạo conversationId dựa trên từ 2 userId (gửi và nhận).
     * - Ghi thông tin tin nhắn, bao gồm người gửi, người nhận, nội dung,
     *   conversationId, trạng thái đọc (mặc định chưa đọc), và thời gian gửi.
     * @param dto Dữ liệu tin nhắn (fromUserId, toUserId, content)
     * @returns Promise trả về object tin nhắn vừa lưu trong DB
     */
    async saveMessage(dto: SendMessageDto) {
        const conversationId = this.getConversationId(dto.fromUserId, dto.toUserId);
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
     * Tạo một ID cuộc trò chuyện duy nhất dựa trên 2 userId.
     * Hàm sắp xếp 2 userId theo thứ tự tăng dần và nối lại bằng dấu gạch dưới,
     * đảm bảo conversationId luôn giống nhau dù thứ tự userA và userB thay đổi.
     * @param userA userId thứ nhất
     * @param userB userId thứ hai
     * @returns conversationId dạng "smallerUserId_largerUserId"
     */
    getConversationId(userA: number, userB: number): string {
        return [userA, userB].sort((a, b) => a - b).join('_');
    }

    /**
     * Lấy danh sách tất cả tin nhắn trong một cuộc trò chuyện giữa 2 user.
     * - Tạo conversationId tương ứng dựa trên 2 userId.
     * - Truy vấn tin nhắn theo conversationId và sắp xếp theo thời gian gửi tăng dần.
     * @param userA userId thứ nhất
     * @param userB userId thứ hai
     * @returns Promise trả về mảng tin nhắn (message[]) của cuộc trò chuyện
     */
    async getConversationMessages(
        userA: number,
        userB: number,
        page = 1,
        limit = 20,
    ) {
        const conversationId = this.getConversationId(userA, userB);
        const skip = (page - 1) * limit;

        const messages = await this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { timestamp: 'asc' },
            skip,
            take: limit,
        });

        const totalMessages = await this.prisma.message.count({
            where: { conversationId },
        });

        return {
            page,
            limit,
            totalMessages,
            totalPages: Math.ceil(totalMessages / limit),
            messages,
        };
    }

}