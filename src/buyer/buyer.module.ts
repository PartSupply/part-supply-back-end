import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './../user/user.module';
import { AuthModule } from './../auth/auth.module';
import { BuyerController } from './controller/buyer.controller';
import { PartRequsetEntity } from './models/part.entity';
import { BuyerService } from './service/buyer.service';
import { PartBidRequestEntity } from '../seller/models/partBidRequest.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PartRequsetEntity, PartBidRequestEntity]), AuthModule, UserModule],
    providers: [BuyerService],
    controllers: [BuyerController],
    exports: [BuyerService],
})
export class BuyerModule {}
