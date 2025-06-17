import { Controller, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @ApiOperation({ summary: 'Lấy lịch sử trò chuyện giữa 2 người dùng (phân trang)' })
    @ApiQuery({ name: 'userA', required: true, type: Number })
    @ApiQuery({ name: 'userB', required: true, type: Number })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Trang hiện tại (mặc định 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số tin nhắn/trang (mặc định 20)' })
    @Get('history')
    async getHistory(
        @Query('userA') userA: string,
        @Query('userB') userB: string,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        const userAId = Number(userA);
        const userBId = Number(userB);
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        return this.chatService.getConversationMessages(userAId, userBId, pageNumber, limitNumber);
    }
}
