import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { LoginUserDto } from "./DTO/LoginUser.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { GenderEnum, Token, User } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { RegisterDTO } from "./DTO/Register.dto";
import { UserService } from "src/user/user.service";
import { EmailService } from "src/email/email.service";
import { CreateUserDto } from "src/user/DTO";
import { use } from "passport";

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService
    ) { }

    async login(data: LoginUserDto): Promise<any> {
        const user = await this.validate(data);
        if (!user) {
            throw new UnauthorizedException();
        }

        const { accessToken, refreshToken } = await this.generateToken(user);
        await this.saveToken(user.userId, accessToken, refreshToken);

        return { accessToken, refreshToken };
    }

    async register(data: CreateUserDto) {
        const user = await this.userService.createUser(data);
        const { accessToken, refreshToken } = await this.generateToken(user);
        await this.saveToken(user.userId, accessToken, refreshToken);
        await this.emailService.sendVerificationEmail(user.email, user.fullName, accessToken);
        return {
            message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
        };
    }

    async verifyEmail(token: string) {
        const tokenRecord = await this.prismaService.token.findFirst({
            where: {
                accessToken: token,
                // accessExpiresAt: { gt: new Date() },
            },
            include: { user: true },
        });

        if (!tokenRecord) {
            throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
        }

        await this.prismaService.user.update({
            where: { userId: tokenRecord.userId },
            data: { isActive: true },
        });

        await this.prismaService.token.delete({
            where: { tokenId: tokenRecord.tokenId },
        });

        return { message: 'Tài khoản đã được xác thực thành công.' };
    }


    async logout(userReq: any, refreshToken: string) {
        const user = await this.getMyProfile(userReq);

        if (!refreshToken) {
            throw new BadRequestException('Refresh token is required');
        }

        const tokens = await this.prismaService.token.findMany({
            where: { userId: user.userId },
        });

        for (const tokenRecord of tokens) {
            const isMatch = await bcrypt.compare(refreshToken, tokenRecord.refreshToken);
            if (isMatch) {
                await this.prismaService.token.delete({
                    where: { tokenId: tokenRecord.tokenId },
                });
                return { message: 'Logout successful' };
            }
        }

        throw new UnauthorizedException('Invalid refresh token');
    }

    async getMyProfile(userReq: any): Promise<User> {
        const user = await this.prismaService.user.findUnique({
            where: { email: userReq.email }
        })

        if (!user) throw new UnauthorizedException('User not found')

        return user;
    }

    async validate(data: LoginUserDto): Promise<User> {
        const user = await this.prismaService.user.findUnique({
            where: { email: data.email }
        })

        if (!user) {
            throw new BadRequestException('User not found')
        }

        const isCorrectPassword = await bcrypt.compare(data.password, user.password)
        if (!isCorrectPassword) {
            throw new UnauthorizedException('Password not correct')
        }

        return user;
    }

    async saveToken(userId: number, accessToken: string, refreshToken?: string): Promise<Token> {
        const decodedAccess = this.jwtService.decode(accessToken) as any;

        const tokenData: any = {
            userId,
            accessToken,
            accessExpiresAt: new Date(decodedAccess.exp * 1000),
        };

        if (refreshToken) {
            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
            const decodedRefresh = this.jwtService.decode(refreshToken) as any;

            tokenData.refreshToken = hashedRefreshToken;
            tokenData.refreshExpiresAt = new Date(decodedRefresh.exp * 1000);
        }

        return this.prismaService.token.create({
            data: tokenData,
        });
    }


    async generateToken(user: User): Promise<any> {
        const payload = { sub: user.userId, email: user.email, role: user.role }
        const accessToken = await this.jwtService.signAsync(payload,
            { expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') });
        const refreshToken = await this.jwtService.signAsync(payload,
            { expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') });

        return { accessToken, refreshToken };
    }

    async findAllTokens(): Promise<Token[]> {
        return this.prismaService.token.findMany({
            include: { user: true },
        });
    }

    async deleteTokenById(id: number): Promise<{ message: string }> {
        const token = await this.prismaService.token.findUnique({
            where: { tokenId: id },
        });
        if (!token) throw new NotFoundException('Token not found');
        await this.prismaService.token.delete({ where: { tokenId: id } });
        return { message: 'Token deleted successfully' };
    }

    async googleLogin(user: any) {
        const existingUser = await this.prismaService.user.findUnique({
            where: { email: user.email },
        });

        if (existingUser) {
            const tokens = await this.generateToken(existingUser);
            await this.saveToken(existingUser.userId, tokens.accessToken, tokens.refreshToken);
            return {
                message: 'Login successful',
                user: existingUser,
                ...tokens,
            };
        }

        // Tạo mới user nếu chưa tồn tại
        const newUser = await this.prismaService.user.create({
            data: {
                fullName: user.fullName,
                email: user.email,
                // picture: user.picture,
                // provider: 'google',
                password: '',
                role: 'USER',
                gender: GenderEnum.Female,
                phone: '',
                isActive: true
            },
        });

        const tokens = await this.generateToken(newUser);
        await this.saveToken(newUser.userId, tokens.accessToken, tokens.refreshToken);

        return {
            message: 'User registered and logged in with Google',
            user: newUser,
            ...tokens,
        };
    }

    async refreshToken(refreshToken: string): Promise<any> {
        if (!refreshToken) {
            throw new BadRequestException('Refresh token is required');
        }

        // Tìm token record trong database
        const tokenRecords = await this.prismaService.token.findMany({
            where: {
                refreshExpiresAt: { gt: new Date() }, // Token chưa hết hạn
            },
            include: { user: true },
        });

        // Tìm token record phù hợp
        let validTokenRecord: (typeof tokenRecords)[0] | null = null;
        for (const tokenRecord of tokenRecords) {
            const isMatch = await bcrypt.compare(refreshToken, tokenRecord.refreshToken);
            if (isMatch) {
                validTokenRecord = tokenRecord;
                break;
            }
        }

        if (!validTokenRecord) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Kiểm tra user còn active không (bỏ qua check này tạm thời)
        // if (!validTokenRecord.user.isActive) {
        //     throw new UnauthorizedException('User account is inactive');
        // }

        // Tạo token mới
        const newTokens = await this.generateToken(validTokenRecord.user);

        // Xóa token cũ
        await this.prismaService.token.delete({
            where: { tokenId: validTokenRecord.tokenId },
        });

        // Lưu token mới
        await this.saveToken(validTokenRecord.userId, newTokens.accessToken, newTokens.refreshToken);

        return {
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
            user: {
                id: validTokenRecord.user.userId,
                email: validTokenRecord.user.email,
                name: validTokenRecord.user.fullName,
                role: validTokenRecord.user.role,
            }
        };
    }
}