import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { LoginUserDto } from "./DTO/LoginUser.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Token, User } from "@prisma/client";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
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

    async saveToken(userId: number, accessToken: string, refreshToken: string): Promise<Token> {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        const decodedAccess = this.jwtService.decode(accessToken) as any;
        const decodedRefresh = this.jwtService.decode(refreshToken) as any;

        return this.prismaService.token.create({
            data: {
                userId: userId,
                accessToken,
                refreshToken: hashedRefreshToken,
                accessExpiresAt: new Date(decodedAccess.exp * 1000),
                refreshExpiresAt: new Date(decodedRefresh.exp * 1000),
            },
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
}