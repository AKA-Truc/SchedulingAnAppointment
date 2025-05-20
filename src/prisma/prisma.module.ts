import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],  // phải export mới dùng được ở module khác
})
export class PrismaModule { }
