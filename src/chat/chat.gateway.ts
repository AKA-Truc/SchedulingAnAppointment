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
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private onlineUsers = new Map<number, string>();

    constructor(
        private chatService: ChatService,
        private jwtService: JwtService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token =
                client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.split(' ')[1];

            if (!token) throw new UnauthorizedException('Không có token');

            const payload = await this.jwtService.verifyAsync(token);
            const userId = payload.sub;

            client.join(userId.toString());
            this.onlineUsers.set(userId, client.id);

            console.log(`✅ User ${userId} kết nối, socketId: ${client.id}`);
            this.server.emit('userOnline', userId);
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
