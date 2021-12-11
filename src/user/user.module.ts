import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './../auth/auth.module';
import { UserController } from './controller/user.controller';
import { AddressEntity } from './models/address.entity';
import { OtpEntity } from './models/otp.entity';
import { RoleEntity } from './models/role.entity';
import { UserSessionEntity } from './models/user-session.entity';
import { UserEntity } from './models/user.entity';
import { UserService } from './service/user.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, RoleEntity, AddressEntity, UserSessionEntity, OtpEntity]),
        AuthModule,
        HttpModule,
    ],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}
