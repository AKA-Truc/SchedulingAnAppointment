import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private reflector: Reflector, private prismaService: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        // Log chi tiết network
        console.log('AuthGuard - IP:', request.ip);
        console.log('AuthGuard - Method:', request.method);
        console.log('AuthGuard - URL:', request.originalUrl || request.url);
        console.log('AuthGuard - Authorization Header:', request.headers.authorization ? request.headers.authorization.slice(0, 20) + '...' : undefined);
        const token = this.extractTokenFromHeader(request);
        console.log('AuthGuard - Token:', token ? token.slice(0, 10) + '...' : undefined);
        if (!token) {
            console.error('AuthGuard - No token found');
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: process.env.JWT_ACCESS_TOKEN_SECRET
                }
            );
            console.log('AuthGuard - Payload:', payload);
            
            // CRITICAL FIX: Kiểm tra token có tồn tại trong database không
            // Điều này đảm bảo rằng token đã logout sẽ không thể sử dụng
            const tokenRecord = await this.prismaService.token.findFirst({
                where: { 
                    accessToken: token, // Kiểm tra exact token
                    accessExpiresAt: { gt: new Date() } // Token chưa hết hạn
                },
                include: { user: true }
            });

            if (!tokenRecord) {
                console.error('AuthGuard - Token not found in database or expired');
                throw new UnauthorizedException('Token has been revoked or expired');
            }

            // Kiểm tra user có còn active không
            // if (!tokenRecord.user.isActive) {
            //     console.error('AuthGuard - User account is inactive');
            //     throw new UnauthorizedException('User account is inactive');
            // }

            console.log('AuthGuard - Token validated successfully');
            request['user'] = payload;
        } catch (error) {
            console.error('AuthGuard - Verify error:', error);
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);