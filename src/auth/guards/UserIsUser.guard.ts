import { Inject } from '@nestjs/common';
import { forwardRef } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/user/models/user.entity';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class UserIsUserGuard implements CanActivate{

    constructor(
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const params = request.params;
        const user: UserEntity = request.user;

        const savedUser: UserEntity = await this.userService.findOne(user.id);
        let hasPermission = false;

        if (savedUser.id === Number(params.id)) {
            hasPermission = true;
        }
        return user && hasPermission;
    }
}
