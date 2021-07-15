import { forwardRef } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserEntity } from './../../user/models/user.entity';
import { UserService } from './../../user/service/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: UserEntity = request.user;

        const savedUser: UserEntity = await this.userService.findOne(user.id);
        const hasRole = () => roles.indexOf(savedUser.role.roleName) > -1;
        let hasPermission = false;
        if (hasRole()) {
            hasPermission = true;
        }
        return user && hasPermission;
    }
}
