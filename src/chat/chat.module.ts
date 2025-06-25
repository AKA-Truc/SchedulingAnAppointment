import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { UserModule } from 'src/user/user.module';


@Module({
    imports: [PrismaModule, UserModule],
    controllers: [ChatController],
    providers: [ChatGateway, ChatService],
})
export class ChatModule { }