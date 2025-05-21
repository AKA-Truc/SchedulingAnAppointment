import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { User, Token } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    // Tạo access + refresh token
    async generateTokens(user: User) {
        const payload = { sub: user.userId, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        return { accessToken, refreshToken };
    }

    // Lưu token vào DB (hash refresh token để bảo mật)
    async saveTokens(userId: number, accessToken: string, refreshToken: string) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        const decodedAccess = this.jwtService.decode(accessToken) as any;
        const decodedRefresh = this.jwtService.decode(refreshToken) as any;

        return this.prisma.token.create({
            data: {
                userId: userId,
                accessToken,
                refreshToken: hashedRefreshToken,
                accessExpiresAt: new Date(decodedAccess.exp * 1000),
                refreshExpiresAt: new Date(decodedRefresh.exp * 1000),
            },
        });
    }

    // Validate user login
    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return null;

        return user;
    }

    // Đăng nhập: trả về token + lưu token
    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const { accessToken, refreshToken } = await this.generateTokens(user);
        await this.saveTokens(user.userId, accessToken, refreshToken);

        return { accessToken, refreshToken };
    }

    // Refresh token
    async refreshTokens(userId: number, refreshToken: string) {
        const tokens = await this.prisma.token.findMany({ where: { userId } });
        for (const tokenRecord of tokens) {
            const isMatch = await bcrypt.compare(refreshToken, tokenRecord.refreshToken);
            if (isMatch) {
                if (tokenRecord.refreshExpiresAt < new Date()) {
                    throw new UnauthorizedException('Refresh token expired');
                }

                const user = await this.prisma.user.findUnique({ where: { userId } });
                if (!user) throw new UnauthorizedException('User not found');

                const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user);
                await this.prisma.token.delete({ where: { tokenId: tokenRecord.tokenId } });
                await this.saveTokens(userId, accessToken, newRefreshToken);

                return { accessToken, refreshToken: newRefreshToken };
            }
        }
        throw new UnauthorizedException('Invalid refresh token');
    }

    // Logout (xoá refresh token)
    async logout(userId: number, refreshToken: string) {
        const tokens = await this.prisma.token.findMany({ where: { userId } });
        for (const tokenRecord of tokens) {
            const isMatch = await bcrypt.compare(refreshToken, tokenRecord.refreshToken);
            if (isMatch) {
                await this.prisma.token.delete({ where: { tokenId: tokenRecord.tokenId } });
                return;
            }
        }
    }
}
