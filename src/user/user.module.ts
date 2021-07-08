import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './controller/user.controller';
import { AddressEntity } from './models/address.entity';
import { RoleEntity } from './models/role.entity';
import { UserEntity } from './models/user.entity';
import { UserService } from './service/user.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, AddressEntity]), AuthModule],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}
