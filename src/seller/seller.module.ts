import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './../user/user.module';
import { AuthModule } from './../auth/auth.module';
import { SellerController } from './controller/seller.controller';
import { SellerService } from './service/seller.service';
import { PartRequsetEntity } from './../buyer/models/part.entity';
import { PartBidRequestEntity } from './models/partBidRequest.entity';
import { QuestionAnswerEntity } from './models/questionAnswer.entity';
import { UserEntity } from './../user/models/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([PartRequsetEntity, PartBidRequestEntity, QuestionAnswerEntity, UserEntity]),
        AuthModule,
        UserModule,
        HttpModule,
    ],
    providers: [SellerService],
    controllers: [SellerController],
    exports: [SellerService],
})
export class SellerModule {}
