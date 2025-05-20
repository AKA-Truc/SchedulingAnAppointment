import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './DTO';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    //create
    async createUser(data: CreateUserDto) {
        const emailExists = await this.prisma.user.findUnique({
            where: { Email: data.email },
        });

        if (emailExists) {
            throw new BadRequestException('Email is already exists')
        }

        const phoneExists = await this.prisma.user.findFirst({
            where: { Phone: data.phone },
        });

        if (phoneExists) {
            throw new BadRequestException('Phone number is already registered.');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.prisma.user.create({
            data: {
                Full_Name: data.fullName,
                Email: data.email,
                Phone: data.phone,
                Password: hashedPassword,
                Gender: data.gender,
                Role: data.role,
            },
        });

        return {
            message: 'User created successfully.',
            user: {
                userId: user.User_ID,
                email: user.Email,
                fullName: user.Full_Name,
                role: user.Role,
                createdAt: user.Created_at,
            },
        };
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
            where: { User_ID: id },
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
            where: { User_ID: id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Nếu cập nhật email thì check trùng
        if (dto.email && dto.email !== user.Email) {
            const emailTaken = await this.prisma.user.findUnique({
                where: { Email: dto.email },
            });
            if (emailTaken) {
                throw new BadRequestException('Email is already in use.');
            }
        }

        // Nếu cập nhật phone
        if (dto.phone && dto.phone !== user.Phone) {
            const phoneTaken = await this.prisma.user.findFirst({
                where: { Phone: dto.phone },
            });
            if (phoneTaken) {
                throw new BadRequestException('Phone number is already registered.');
            }
        }

        return this.prisma.user.update({
            where: { User_ID: id },
            data: dto,
        });
    }

    //delete
    async deleteUser(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { User_ID: id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return this.prisma.user.delete({
            where: { User_ID: id },
        });
    }
}