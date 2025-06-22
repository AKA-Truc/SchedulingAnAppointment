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

@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private onlineUsers = new Map<number, string>();

    constructor(private chatService: ChatService) { }

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
        } catch (err) {
            console.error('❌ Lỗi kết nối client:', err.message);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        for (const [userId, socketId] of this.onlineUsers.entries()) {
            if (socketId === client.id) {
                this.onlineUsers.delete(userId);
                console.log(`🔌 User ${userId} ngắt kết nối`);
                this.server.emit('userOffline', userId);
                break;
            }
        }
    }

    @SubscribeMessage('privateMessage')
    async handlePrivateMessage(
        @MessageBody() dto: SendMessageDto,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            console.log(`📨 Nhận tin nhắn từ ${dto.fromUserId} đến ${dto.toUserId}: ${dto.content}`);
            const savedMessage = await this.chatService.saveMessage(dto);

            this.server.to(dto.fromUserId.toString()).emit('privateMessage', savedMessage);
            this.server.to(dto.toUserId.toString()).emit('privateMessage', savedMessage);
        } catch (err) {
            console.error('❗ Lỗi khi gửi tin nhắn:', err.message);
            client.emit('error', { message: 'Không gửi được tin nhắn' });
        }
    }
}
