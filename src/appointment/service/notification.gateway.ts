import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { NotificationService } from './notification.service';

@Injectable()
@WebSocketGateway({ namespace: '/notification',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
 })
export class NotificationGateway  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('NotificationGateway');
  constructor(
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,

  ) {}

  afterInit(server: Server) {
    this.logger.log('Notification Gateway initialized');
  }

  
  // sendToUser(userId: any, payload: any) {
  //   this.server.to(`user:${userId}`).emit('notification', payload);
  // }
  sendToUser(userId: any, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Notification sent to user: ${userId}`);
  }

  // Method to broadcast notification to all connected users
  broadcastToAll(notification: any) {
    // Only send broadcastNotification event to avoid duplicate
    this.server.emit('broadcastNotification', notification);
    this.logger.log(`Notification broadcasted to all users: ${notification.title}`);
  }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`user:${userId}`);

      const userID = Number(userId);
      const unreadCount = await this.notificationService.getUnreadCount(userID);
      // Send unread notifications count
      client.emit('unreadCount', unreadCount);
    }


  }

  handleDisconnect(client: Socket) {
    // Optionally log or handle disconnect logic here
    const userId = client.handshake.query.userId as string;
    this.logger.log(`Notification client disconnected: ${client.id}, userId: ${userId}`);
  }

  @SubscribeMessage('getNotifications')
  async handleGetNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { limit?: number; offset?: number }
  ) {
    try {
      const userId = Number(client.handshake.query.userId);
      const limit = data.limit || 20;
      const offset = data.offset || 0;
  
      // Tính page từ offset và limit
      const page = Math.floor(offset / limit) + 1;
  
      const notifications = await this.notificationService.findByUser(userId, page, limit);
      console.log("notifications",notifications)
      client.emit("notificationList", {
        notifications: notifications,
        hasMore: notifications.meta.page < notifications.meta.totalPages,
      }); 
  
    } catch (error) {
      this.logger.error('Error getting notifications:', error);
      client.emit('error', { message: 'Failed to get notifications' });
    }
  }
  

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: number }
  ){
    const userId = Number(client.handshake.query.userId);
    const notificationId = Number(data.notificationId);

    try {
      await this.notificationService.markAsRead(userId, notificationId);
      const unreadCount = await this.notificationService.getUnreadCount(userId);

      client.emit('unreadCount', unreadCount);
      client.emit('notificationRead', { notificationId });
    } catch (error) {
      this.logger.error('Error marking notification as read:', error);
      client.emit('error', { message: 'Failed to mark notification as read' });
    }
  }



}
