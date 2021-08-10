import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './../user/user.module';
import { AuthModule } from './../auth/auth.module';
import { BuyerController } from './controller/buyer.controller';
import { PartRequsetEntity } from './models/part.entity';
import { BuyerService } from './service/buyer.service';

@Module({
    imports: [TypeOrmModule.forFeature([PartRequsetEntity]), AuthModule, UserModule],
    providers: [BuyerService],
    controllers: [BuyerController],
    exports: [BuyerService],
})
export class BuyerModule {}
