import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './../user/user.module';
import { AuthModule } from './../auth/auth.module';
import { SellerController } from './controller/seller.controller';
import { SellerService } from './service/seller.service';
import { PartRequsetEntity } from './../buyer/models/part.entity';
import { PartBidRequestEntity } from './models/partBidRequest.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PartRequsetEntity, PartBidRequestEntity]), AuthModule, UserModule],
    providers: [SellerService],
    controllers: [SellerController],
    exports: [SellerService],
})
export class SellerModule {}
