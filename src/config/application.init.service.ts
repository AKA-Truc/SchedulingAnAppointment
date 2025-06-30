import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcrypt";

@Injectable()
export class ApplicationInitService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        try {
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
                        isActive: true,
                    },
                });
                console.log('✅ Admin account created. Default password is: adminadmin. Please change it soon!');
            } else {
                console.log('✅ Admin account already exists');
            }
        } catch (error) {
            console.error('⚠️ Failed to initialize admin account (Database tables might not exist yet):', error.message);
            console.log('🔄 This is normal during first deployment. Admin will be created after migrations complete.');
        }
    }
}