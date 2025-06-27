import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./DTO/LoginUser.dto";
import { AuthGuard as JwtAuthGuard, Public } from './guard/auth.guard';
// import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';


import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { console } from "inspector";
import { LogoutDto } from "./DTO/Logout.dto";
import { RefreshTokenDto } from "src/user/DTO/RefreshToken.dto";
import { RegisterDTO } from "./DTO/Register.dto";
import { GoogleAuthGuard } from "./guard/google-auth.guard";
import { CreateUserDto } from "src/user/DTO";


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
    async register(@Body() data: CreateUserDto) {
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

    @Public()
    @Post('refresh-token')
    async refreshToken(@Body() body: RefreshTokenDto) {
        return this.authService.refreshToken(body.refreshToken);
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

    // @Get('google/login')
    // // @UseGuards(PassportAuthGuard('google'))
    // @UseGuards(GoogleAuthGuard)
    // async googleAuth(@Req() req) {
    //     // redirect to Google OAuth
    // }

    @Public()
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    googleLogin() {
        // This will redirect to Google OAuth
    }

    @Public()
    @UseGuards(GoogleAuthGuard)
    @Get('google/redirect')
    async googleAuthRedirect(@Req() req, @Res() res) {
        try {
            const response = await this.authService.googleLogin(req.user);
            
            // Redirect to frontend callback page with tokens
            const callbackUrl = `http://localhost:4000/auth/google-callback?token=${response.accessToken}&refreshToken=${response.refreshToken}`;
            res.redirect(callbackUrl);
        } catch (error) {
            // Redirect to login page with error
            const errorUrl = `http://localhost:4000/auth/login?error=${encodeURIComponent(error.message || 'Google login failed')}`;
            res.redirect(errorUrl);
        }
    }

    // @Get('google/redirect')
    // // @UseGuards(PassportAuthGuard('google'))
    // async googleAuthRedirect(@Req() req) {
    //     return this.authService.googleLogin(req.user);
    // }
}