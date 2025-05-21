import { Module } from '@nestjs/common';
import { CertificationController } from './certification.controller';
import { CertificationService } from './certification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CloudinaryModule, ConfigModule],
  controllers: [CertificationController],
  providers: [CertificationService, PrismaService],
})
export class CertificationModule { }
