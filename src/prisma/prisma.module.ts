import { Global, Module } from '@nestjs/common';
import { MongoPrismaService } from './mongo-prisma.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [MongoPrismaService,PrismaService],
  exports: [MongoPrismaService,PrismaService],
})
export class PrismaModule { }
