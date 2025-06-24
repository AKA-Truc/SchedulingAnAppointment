import { Controller, Get, Query, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Headers } from '@nestjs/common';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }
    @ApiOperation({ summary: '📜 Lấy lịch sử tin nhắn theo conversationId (có phân trang)' })
    @ApiQuery({ name: 'conversationId', required: true, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Trang hiện tại (mặc định 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số tin nhắn/trang (mặc định 20)' })
    @Get('messages')
    async getMessages(
        @Query('conversationId') conversationId: string,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        if (!conversationId) {
            throw new BadRequestException('Thiếu conversationId');
        }

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        return this.chatService.getConversationMessagesById(conversationId, pageNumber, limitNumber);
    }

    @ApiOperation({ summary: '📁 Lấy danh sách cuộc trò chuyện của người dùng' })
    @ApiBearerAuth() // để hiển thị ô nhập Bearer token trên Swagger
    @Get('conversations')
    async getUserConversations(@Headers('authorization') authHeader: string) {
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            throw new UnauthorizedException('Token is missing');
        }

        return this.chatService.getUserConversations(token);
    }
}
