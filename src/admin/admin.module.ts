import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './../user/service/user.service';
import { AuthModule } from './../auth/auth.module';
import { AddressEntity } from './../user/models/address.entity';
import { RoleEntity } from './../user/models/role.entity';
import { UserSessionEntity } from './../user/models/user-session.entity';
import { UserEntity } from './../user/models/user.entity';
import { AdminController } from './controller/admin.controller';
import { AdminService } from './service/admin.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, AddressEntity, UserSessionEntity]), AuthModule],
    providers: [AdminService, UserService],
    controllers: [AdminController],
    exports: [AdminService],
})
export class AdminModule {}
