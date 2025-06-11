import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./DTO/LoginUser.dto";
import { Public } from "./guard/auth.guard";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { console } from "inspector";
import { LogoutDto } from "./DTO/Logout.dto";
import { RefreshTokenDto } from "src/user/DTO/RefreshToken.dto";
import { ApiBearerAuth } from "@nestjs/swagger";


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

    @Post('logout')
    async logout(@Req() req, @Body() refreshToken: string) {
        return this.authService.logout(req.user, refreshToken);
    }

    @Get('profile')
    getProfile(@Req() req) {
        return this.authService.getMyProfile(req.user)
    }
}