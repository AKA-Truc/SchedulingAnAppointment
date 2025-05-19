import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],  // phải export mới dùng được ở module khác
})
export class PrismaModule { }
