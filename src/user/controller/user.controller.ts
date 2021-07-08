import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserDto, UserRole } from '../models/user.dto';
import { UserService } from '../service/user.service';

@Controller()
export class UserController {
    constructor(private userService: UserService) {}

    @Post('signup')
    public async createUserAccount(@Body() user: UserDto): Promise<any> {
        return await this.userService.createUser(user);
    }

    @Post('login')
    public async login(@Body() user: UserDto): Promise<any> {
        const jwtString: string = await this.userService.login(user);
        return {
            access_token: jwtString,
        };
    }

    @hasRoles(UserRole.BUYER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('buyer')
    public buyer(): string {
        return 'buyer';
    }

    @hasRoles(UserRole.SELLER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('seller')
    public seller(): string {
        return 'seller';
    }
}
