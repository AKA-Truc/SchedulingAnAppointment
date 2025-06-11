import { Controller, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService) { }

    @ApiOperation({ summary: 'Get Histories of chat with pagination' })
    @Get('history')
    async getHistory(
        @Query('userA') userA: number,
        @Query('userB') userB: number,
        @Query('page') page = 1,        // default page 1
        @Query('limit') limit = 20      // default 20 messages per page
    ) {
        // Ép kiểu sang number nếu truyền dưới dạng string
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        return this.chatService.getConversationMessages(userA, userB, pageNumber, limitNumber);
    }
}
