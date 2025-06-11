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

    // Map userId -> socket.id
    private onlineUsers = new Map<number, string>();

    constructor(
        private chatService: ChatService,
        private jwtService: JwtService,
    ) { }

    // Khi client kết nối
    async handleConnection(client: Socket) {
        try {
            // Lấy token từ handshake
            const token =
                client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.split(' ')[1];

            if (!token) throw new UnauthorizedException('No token provided');

            // Giải mã token lấy userId
            const payload = await this.jwtService.verifyAsync(token);
            const userId = payload.sub;

            // Tham gia phòng userId để dễ gửi message theo user
            client.join(userId.toString());
            this.onlineUsers.set(userId, client.id);

            console.log(`User ${userId} connected with socket ID: ${client.id}`);

            // Thông báo user online cho tất cả client
            this.server.emit('userOnline', userId);
        } catch (err) {
            console.error('Connection error:', err.message);
            client.disconnect();
        }
    }

    // Khi client ngắt kết nối
    handleDisconnect(client: Socket) {
        for (const [userId, socketId] of this.onlineUsers.entries()) {
            if (socketId === client.id) {
                this.onlineUsers.delete(userId);
                console.log(`User ${userId} disconnected`);
                this.server.emit('userOffline', userId);
                break;
            }
        }
    }

    // Client join phòng thủ công (nếu cần)
    @SubscribeMessage('join')
    handleJoin(
        @MessageBody() userId: number,
        @ConnectedSocket() client: Socket,
    ) {
        client.join(userId.toString());
        console.log(`User ${userId} manually joined room`);
    }

    // Xử lý gửi tin nhắn riêng tư
    @SubscribeMessage('privateMessage')
    async handlePrivateMessage(
        @MessageBody() dto: SendMessageDto,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            // Lưu tin nhắn vào DB, trong saveMessage đã tạo conversationId
            const savedMessage = await this.chatService.saveMessage(dto);

            // Gửi tin nhắn đến người gửi và người nhận qua các room userId
            this.server.to(dto.fromUserId.toString()).emit('privateMessage', savedMessage);
            this.server.to(dto.toUserId.toString()).emit('privateMessage', savedMessage);
        } catch (err) {
            console.error('Error sending message:', err.message);
            client.emit('error', { message: 'Gửi tin nhắn thất bại' });
        }
    }
}
