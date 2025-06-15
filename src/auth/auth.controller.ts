import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./DTO/LoginUser.dto";
import { AuthGuard as JwtAuthGuard, Public } from './guard/auth.guard';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { console } from "inspector";
import { LogoutDto } from "./DTO/Logout.dto";
import { RefreshTokenDto } from "src/user/DTO/RefreshToken.dto";
import { RegisterDTO } from "./DTO/Register.dto";


@Controller('auth')
// @UseGuards(ThrottlerGuard)
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @HttpCode(HttpStatus.OK)
    // @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('login')
    async login(@Body() data: LoginUserDto) {
        return this.authService.login(data)
    }

    @Public()
    @Post('register')
    async register(@Body() data: RegisterDTO) {
        return this.authService.register(data);
    }

    @Public()
    @Get('verify-email')
    async verifyEmail(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }


    @Post('logout')
    async logout(@Req() req, @Body() refreshToken: string) {
        return this.authService.logout(req.user, refreshToken);
    }


    @Get('profile')
    getProfile(@Req() req) {
        return this.authService.getMyProfile(req.user)
    }

    @Get('sessions')
    async getSessions() {
        return this.authService.findAllTokens();
    }

    @Delete('sessions/:tokenId')
    async deleteSession(@Param('tokenId', ParseIntPipe) tokenId: number) {
        return this.authService.deleteTokenById(tokenId);
    }

    @Get('google')
    @UseGuards(PassportAuthGuard('google'))
    async googleAuth(@Req() req) {
        // redirect to Google OAuth
    }

    // @Get('google/redirect')
    // @UseGuards(PassportAuthGuard('google'))
    // async googleAuthRedirect(@Req() req) {
    //     return this.authService.socialLogin(req.user);
    // }
}