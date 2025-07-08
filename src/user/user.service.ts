import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './DTO';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'
import { use } from 'passport';
import { UpdatePasswordDto } from './DTO/UpdatePassword';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    //create
    async createUser(data: CreateUserDto): Promise<User> {
        // Kiểm tra email trùng trước
        const existingEmailUser = await this.prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingEmailUser) {
            if (existingEmailUser.isActive) {
                throw new BadRequestException('Email này đã được đăng ký và đang hoạt động. Vui lòng sử dụng email khác hoặc đăng nhập.');
            } else {
                // Nếu email chưa active, xóa user cũ
                try {
                    await this.deleteUser(existingEmailUser.userId);
                } catch (deleteError) {
                    console.error('Error deleting inactive user with email:', deleteError);
                    throw new BadRequestException('Email này đã từng được đăng ký nhưng chưa xác thực. Vui lòng sử dụng email khác hoặc liên hệ hỗ trợ.');
                }
            }
        }

        // Kiểm tra phone trùng
        const existingPhoneUser = await this.prisma.user.findFirst({
            where: { phone: data.phone }
        });

        if (existingPhoneUser) {
            if (existingPhoneUser.isActive) {
                throw new BadRequestException('Số điện thoại này đã được sử dụng bởi tài khoản khác. Vui lòng sử dụng số điện thoại khác.');
            } else {
                // Nếu phone chưa active, xóa user cũ
                try {
                    await this.deleteUser(existingPhoneUser.userId);
                } catch (deleteError) {
                    console.error('Error deleting inactive user with phone:', deleteError);
                    throw new BadRequestException('Số điện thoại này đã từng được đăng ký nhưng chưa xác thực. Vui lòng sử dụng số điện thoại khác hoặc liên hệ hỗ trợ.');
                }
            }
        }

        try {
            const hashedPassword = await bcrypt.hash(data.password, 10);

            const user = await this.prisma.user.create({
                data: {
                    fullName: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    password: hashedPassword,
                    address: data.address,
                    dateOfBirth: data.dateOfBirth,
                    nationalId: data.nationalId,
                    ethnicity: data.ethnicity,
                    gender: data.gender,
                    role: data.role,
                    isActive: false
                },
            });

            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            
            // Handle Prisma unique constraint errors
            if (error.code === 'P2002') {
                const field = error.meta?.target?.[0];
                if (field === 'email') {
                    throw new BadRequestException('Email này đã được đăng ký. Vui lòng sử dụng email khác.');
                } else if (field === 'phone') {
                    throw new BadRequestException('Số điện thoại này đã được sử dụng. Vui lòng sử dụng số khác.');
                }
                throw new BadRequestException('Thông tin đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.');
            }
            
            throw new BadRequestException('Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại.');
        }
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

    //update password
    async updatePassword(email: string, updatePassword: UpdatePasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: email },
            select: {
                userId: true,
                password: true,
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${email} not found`);
        }

        // Kiểm tra mật khẩu hiện tại
        const isPasswordValid = await bcrypt.compare(updatePassword.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Mã hóa mật khẩu mới
        const hashedNewPassword = await bcrypt.hash(updatePassword.newPassword, 10);

        return this.prisma.user.update({
            where: { email: email },
            data: { password: hashedNewPassword },
        });
    }

    //forgot password
    async forgotPassword(email: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        // Mã hóa mật khẩu mới
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        return this.prisma.user.update({
            where: { email: email },
            data: { password: hashedNewPassword },
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

        // Sử dụng transaction để đảm bảo tính nhất quán
        return await this.prisma.$transaction(async (prisma) => {
            // Xóa tất cả related data trước khi xóa user
            await prisma.token.deleteMany({
                where: { userId: id },
            });

            // Xóa patient profile nếu có
            await prisma.patientProfile.deleteMany({
                where: { userId: id },
            });

            // Xóa appointments nếu có
            await prisma.appointment.deleteMany({
                where: { userId: id },
            });

            // Xóa doctor profile nếu có
            await prisma.doctor.deleteMany({
                where: { userId: id },
            });

            // Cuối cùng xóa user
            return await prisma.user.delete({
                where: { userId: id },
            });
        });
    }

    getUserCount() {
        return this.prisma.user.count();
    }
}