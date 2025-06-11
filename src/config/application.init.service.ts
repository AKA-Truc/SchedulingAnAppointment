import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcrypt";

@Injectable()
export class ApplicationInitService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        const admin = await this.prisma.user.findFirst({
            where: { role: 'ADMIN' },
        });

        if (!admin) {
            await this.prisma.user.create({
                data: {
                    fullName: 'Admin',
                    email: 'admin@gmail.com',
                    password: await bcrypt.hash('adminadmin', 10),
                    role: 'ADMIN',
                    gender: 'Female',
                    phone: '0912345678',
                },
            });
            console.log('Admin account created. Default password is : adminadmin. Please change it soon!');
        }
    }
}