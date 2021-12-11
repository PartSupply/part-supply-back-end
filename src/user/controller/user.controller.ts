import {
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Post,
    Put,
    Req,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { hasRoles } from './../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from './../../auth/guards/jwt-guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { ChangePasswordDto, ResetUserPasswordDto, UserDto, UserRole } from '../models/user.dto';
import { UserService } from '../service/user.service';
import { ResponseType } from '../../utilities/responseType';
import { UserEntity } from '../models/user.entity';
import { UserIsUserGuard } from './../../auth/guards/UserIsUser.guard';
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
        if (createdUser.password) {
            delete createdUser.password;
        }
        return {
            data: createdUser,
        };
    }

    @Put('userProfile')
    public async updateUserProfile(@Body(ValidationPipe) user: UserDto): Promise<ResponseType<any>> {
        try {
            await this.userService.updateUserProfile(user);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new InternalServerErrorException('Provided user email account already exist');
            }
        }
        return {
            data: 'user updated successfully',
        };
    }

    @Post('login')
    public async login(@Body() user: UserDto): Promise<any> {
        const jwtString: string = await this.userService.login(user);
        return {
            access_token: jwtString,
            scope: 'ReadWrite',
            expires_in: 3600,
            token_type: 'Bearer',
        };
    }

    @hasRoles(UserRole.BUYER, UserRole.SELLER, UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Get('userProfile')
    public async getUserProfile(@Req() request): Promise<ResponseType<UserEntity>> {
        const loggedInUserId = request.user.id;
        let savedUser: UserEntity = null;
        try {
            savedUser = await this.userService.findOne(loggedInUserId);
        } catch (error) {
            return error;
        }

        if (!savedUser) {
            throw new InternalServerErrorException('No such user exist');
        }

        return {
            data: savedUser,
        };
    }

    @hasRoles(UserRole.BUYER, UserRole.SELLER, UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Post('logout')
    public async doLogOut(@Req() request): Promise<ResponseType<any>> {
        const loggedInUserGuid = request.user.userGuid;
        const savedUserSession = await this.userService.findSavedUserSessionByUserGuid(loggedInUserGuid);
        savedUserSession.token = '';
        savedUserSession.dateTime = '';

        await this.userService.updateSavedUserSession(savedUserSession);

        return {
            data: 'User logged out succcessfully',
        };
    }

    @Post('sendOneTimeCode')
    public async sendOneTimeCode(@Req() request, @Body() user: ChangePasswordDto): Promise<ResponseType<any>> {
        let savedUser: UserEntity;
        try {
            savedUser = await this.userService.findUserByEmail(user.email);
        } catch (error) {
            throw new NotFoundException('Provided email address is not valid');
        }
        await this.userService.generateOneTimeCodeForPasswordReset(savedUser);
        return {
            data: 'one time passcode has been set',
        };
    }

    @Post('resetPassword')
    public async resetPassword(
        @Req() request,
        @Body() resetPasswordDto: ResetUserPasswordDto,
    ): Promise<ResponseType<any>> {
        let savedUser: UserEntity;
        try {
            savedUser = await this.userService.findUserByEmail(resetPasswordDto.email);
        } catch (error) {
            throw new NotFoundException('Provided email address is not valid');
        }
        await this.userService.resetPassword(savedUser, resetPasswordDto);
        return {
            data: 'password has been changed successfully',
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

    @Get('health')
    public health(): string {
        return 'ok';
    }
}
