// src/chat/chat.gateway.ts

import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './DTO/SendMessage.dto';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private onlineUsers = new Map<number, string>();

    constructor(private chatService: ChatService,
        private userService: UserService
    ) { }

    async handleConnection(client: Socket) {
        try {
            const userId = client.handshake.query.userId;
            if (!userId) throw new Error('Thiếu userId');

            const userIdNum = parseInt(userId as string, 10);
            if (isNaN(userIdNum)) throw new Error('userId không hợp lệ');

            client.join(userIdNum.toString());
            this.onlineUsers.set(userIdNum, client.id);

            console.log(`✅ User ${userIdNum} kết nối, socketId: ${client.id}`);
            this.server.emit('userOnline', userIdNum);

            const onlineUserIds = Array.from(this.onlineUsers.keys());
            this.server.emit('onlineUsers', onlineUserIds);

            console.log(onlineUserIds);
        } catch (err) {
            console.error('❌ Lỗi kết nối client:', err.message);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        for (const [userId, socketId] of this.onlineUsers.entries()) {
            if (socketId === client.id) {
                this.onlineUsers.delete(userId);
                break;
            }
        }
        // ✅ emit lại danh sách sau khi đã xóa user offline
        const onlineUserIds = Array.from(this.onlineUsers.keys());
        this.server.emit('onlineUsers', onlineUserIds);
    }

    @SubscribeMessage("markAsRead")
    async handleMarkAsRead(
        @MessageBody() conversationId: string,
        @ConnectedSocket() client: Socket,
    ) {
        const userIdRaw = client.handshake.query.userId;
        const userId = parseInt(userIdRaw as string, 10);

        if (!conversationId || isNaN(userId)) return;

        try {
            await this.chatService.markMessagesAsRead(conversationId, userId);
            client.emit('messagesMarkedAsRead', conversationId);
        } catch (err) {
            console.error('❗ Lỗi khi đánh dấu đã đọc:', err.message);
        }
    }

    @SubscribeMessage('privateMessage')
    async handlePrivateMessage(
        @MessageBody() dto: SendMessageDto,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const savedMessage = await this.chatService.saveMessage(dto);

            const sender = await this.userService.getUserById(dto.fromUserId);

            // Gửi kèm thông tin người gửi
            const payload = {
                ...savedMessage,
                fromUserFullName: sender.fullName,
            };

            this.server.to(dto.fromUserId.toString()).emit('privateMessage', payload);
            this.server.to(dto.toUserId.toString()).emit('privateMessage', payload);
        } catch (err) {
            console.error('❗ Lỗi khi gửi tin nhắn:', err.message);
            client.emit('error', { message: 'Không gửi được tin nhắn' });
        }
    }
}