import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  sendToUser(userId: any, payload: any) {
    this.server.to(`user:${userId}`).emit('notification', payload);
  }

  handleConnection(socket: any) {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }
  }
}
