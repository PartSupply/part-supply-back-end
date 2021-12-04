import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './../user/user.module';
import { AuthModule } from './../auth/auth.module';
import { BuyerController } from './controller/buyer.controller';
import { PartRequsetEntity } from './models/part.entity';
import { BuyerService } from './service/buyer.service';
import { PartBidRequestEntity } from '../seller/models/partBidRequest.entity';
import { SellerService } from '../seller/service/seller.service';
import { QuestionAnswerEntity } from '../seller/models/questionAnswer.entity';
import { UserEntity } from './../user/models/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([PartRequsetEntity, PartBidRequestEntity, QuestionAnswerEntity, UserEntity]),
        AuthModule,
        UserModule,
        HttpModule,
    ],
    providers: [BuyerService, SellerService],
    controllers: [BuyerController],
    exports: [BuyerService],
})
export class BuyerModule {}
