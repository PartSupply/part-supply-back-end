import { Body, Controller, Get, InternalServerErrorException, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { hasRoles } from './../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from './../../auth/guards/jwt-guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { UserDto, UserRole } from '../models/user.dto';
import { UserService } from '../service/user.service';
import { ResponseType } from '../../utilities/responseType';
import { UserEntity } from '../models/user.entity';
@Controller()
export class UserController {
    constructor(private userService: UserService) {}

    @Post('signup')
    public async createUserAccount(@Body(ValidationPipe) user: UserDto): Promise<ResponseType<any>> {
        let createdUser: UserEntity = null;
        try {
            createdUser = await this.userService.createUser(user);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new InternalServerErrorException('Provided user email account already exist');
            }
        }
        // Befor sending back remove the password
        delete createdUser.password;
        return {
            data: createdUser,
        };
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
