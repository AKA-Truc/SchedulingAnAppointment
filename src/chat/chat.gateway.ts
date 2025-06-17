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
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { SendMessageDto } from './DTO/SendMessage.dto';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private onlineUsers = new Map<number, string>();

    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
    ) { }

    async handleConnection(client: Socket) {
        console.log("connect");

        const token =
            client.handshake.auth?.token ||
            client.handshake.headers?.authorization?.split(' ')[1];

        console.log("📦 Received token:", token);

        if (!token) {
            client.disconnect();
            throw new UnauthorizedException('Token không hợp lệ');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET, // ✅ thêm dòng này
            });

            const userId = payload.sub;

            client.data.userId = userId;
            client.join(userId.toString());
            this.onlineUsers.set(userId, client.id);

            console.log(`✅ User ${userId} connected`);
            this.server.emit('userOnline', userId);
        } catch (e) {
            console.error('❌ Invalid Token', e.message);
            client.disconnect();
        }
    }


    handleDisconnect(client: Socket) {
        const userId = client.data?.userId;

        if (userId && this.onlineUsers.get(userId) === client.id) {
            this.onlineUsers.delete(userId);
            this.server.emit('userOffline', userId);
            console.log(`🚪 User ${userId} disconnected`);
        }
    }

    @SubscribeMessage('privateMessage')
    async handlePrivateMessage(
        @MessageBody() dto: SendMessageDto,
        @ConnectedSocket() client: Socket,
    ) {
        console.log('📥 Nhận privateMessage từ client');
        console.log('➡️ Payload:', dto);
        console.log('🧩 Từ user:', client.data.userId);

        const { fromUserId, toUserId, content } = dto;

        if (
            typeof fromUserId !== 'number' ||
            typeof toUserId !== 'number' ||
            typeof content !== 'string' ||
            !content.trim()
        ) {
            client.emit('error', { message: 'Payload không hợp lệ' });
            return;
        }

        if (client.data.userId !== fromUserId) {
            throw new UnauthorizedException('Không đúng người gửi');
        }

        // Optional: lưu DB
        // const savedMessage = await this.chatService.saveMessage(dto);
        const savedMessage = { ...dto, createdAt: new Date().toISOString() };

        this.server.to(fromUserId.toString()).emit('privateMessage', savedMessage);
        this.server.to(toUserId.toString()).emit('privateMessage', savedMessage);
    }
}
