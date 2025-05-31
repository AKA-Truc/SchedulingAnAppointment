import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/signaling', cors: true })
export class SignalingGateway {
  @WebSocketServer()
  server: Server;

  // Khi client join room
  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: { room: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
    client.data.userId = data.userId;
    this.server.to(data.room).emit('user-joined', { userId: data.userId });
  }

  // Client A gửi offer cho room
  @SubscribeMessage('offer')
  handleOffer(@MessageBody() data: { room: string; sdp: any; userId: string }) {
    this.server.to(data.room).emit('offer', {
      sdp: data.sdp,
      userId: data.userId,
    });
  }

  // Client B trả lời bằng answer
  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() data: { room: string; sdp: any; userId: string }) {
    this.server.to(data.room).emit('answer', {
      sdp: data.sdp,
      userId: data.userId,
    });
  }

  // Trao đổi ICE candidate
  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody() data: { room: string; candidate: any; userId: string },
  ) {
    this.server.to(data.room).emit('ice-candidate', {
      candidate: data.candidate,
      userId: data.userId,
    });
  }

  // (Tuỳ chọn) Rời phòng
  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @MessageBody() data: { room: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.room);
    this.server.to(data.room).emit('user-left', { userId: data.userId });
  }

  // Mất kết nối
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    const rooms = [...client.rooms].filter(r => r !== client.id);
    rooms.forEach((room) => {
      this.server.to(room).emit('user-disconnected', { userId });
    });
  }
}
