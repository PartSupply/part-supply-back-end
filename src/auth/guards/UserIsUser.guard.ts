import { HttpStatus, Inject, UnauthorizedException } from '@nestjs/common';
import { forwardRef } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { UserSessionEntity } from './../../user/models/user-session.entity';
import { UserEntity } from './../../user/models/user.entity';
import { UserService } from './../../user/service/user.service';

@Injectable()
export class UserIsUserGuard implements CanActivate {
    constructor(
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const params = request.params;
        const user: UserEntity = request.user;

        const savedUser: UserEntity = await this.userService.findOne(user.id);
        // Also check user has valid token in user session table
        const savedUserSession: UserSessionEntity = await this.userService.findSavedUserSessionByUserGuid(
            user.userGuid,
        );

        if (savedUserSession.token === '') {
            throw new UnauthorizedException('User token is invalid');
        }

        let hasPermission = false;

        if (savedUser.id === Number(params.id) || savedUser.id === request.user.id) {
            hasPermission = true;
        }
        return user && hasPermission;
    }
}
