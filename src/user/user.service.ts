import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './DTO';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'
import { use } from 'passport';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    //create
    async createUser(data: CreateUserDto): Promise<User> {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { phone: data.phone },
                    // { isActive: true },
                ],
            },
        });

        if (existingUser) {
            if (existingUser.isActive) {
                // Nếu user đã active, kiểm tra cụ thể email hay phone trùng
                if (existingUser.email === data.email) {
                    throw new BadRequestException('Email is already registered');
                }

                if (existingUser.phone === data.phone) {
                    throw new BadRequestException('Phone number is already used by an active account');
                }

                throw new BadRequestException('This account already active.');
            } else {
                // Nếu chưa active, xóa user cũ để tạo mới
                await this.deleteUser(existingUser.userId);
            }
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.prisma.user.create({
            data: {                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                password: hashedPassword,
                address: data.address,
                dateOfBirth: data.dateOfBirth,
                nationalId: data.nationalId,
                ethnicity: data.ethnicity,
                gender: data.gender,
                role: data.role,
                isActive: true
            },
        });

        return user;
    }

    async uploadAvatar(userId: number, fileUrl: string) {
        return this.prisma.user.update({
            where: { userId: userId },
            data: { avatar: fileUrl }
        })
    }

    //GetAll
    async getAllUsers(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                include: {
                    doctor: true,
                    appointments: true,
                },
            }),
            this.prisma.user.count(),
        ]);

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    //Get1
    async getUserById(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { userId: id },
            include: {
                doctor: true,
                appointments: true,
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    //update
    async updateUser(id: number, dto: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({
            where: { userId: id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Nếu cập nhật email thì check trùng
        if (dto.email && dto.email !== user.email) {
            const emailTaken = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (emailTaken) {
                throw new BadRequestException('email is already in use.');
            }
        }

        // Nếu cập nhật phone
        if (dto.phone && dto.phone !== user.phone) {
            const phoneTaken = await this.prisma.user.findFirst({
                where: { phone: dto.phone },
            });
            if (phoneTaken) {
                throw new BadRequestException('phone number is already registered.');
            }
        }

        return this.prisma.user.update({
            where: { userId: id },
            data: dto,
        });
    }

    //delete
    async deleteUser(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { userId: id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        await this.prisma.token.deleteMany({
            where: { userId: id },
        });

        return this.prisma.user.delete({
            where: { userId: id },
        });
    }
}