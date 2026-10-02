import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('create/pg')
    createPg(@Body() dto: { name: string; contactNumber?: string }) {
        return this.authService.CreatePg(dto)
    }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.registerPgAdmin(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @UseGuards(AuthGuard('jwt-refresh'))
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    refreshTokens(@Req() req: any) {
        return this.authService.refreshTokens(req.user.userId, req.user.refreshToken);
    }

    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    logout(@CurrentUser('userId') userId: string) {
        return this.authService.logout(userId);
    }
}