import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { UserEntity } from './../../user/models/user.entity';

export class PartTypeDto {
    @IsNotEmpty()
    @IsBoolean()
    public new: boolean;
    @IsNotEmpty()
    @IsBoolean()
    public used: boolean;
    @IsNotEmpty()
    @IsBoolean()
    public reManufactured: boolean;
}

export enum OfferStatus {
    ACCEPTED = 'ACCEPTED',
    OPEN = 'OPEN',
}

export class PartRequestIdDto {
    @IsNotEmpty()
    @IsString()
    public id: number;

    @IsNotEmpty()
    @IsString()
    public bidRequestId: number;
}

export class PostAnswerDto {
    @IsNotEmpty()
    @IsNumber()
    public id: string;

    @IsString()
    @IsNotEmpty()
    public answer: string;
}

export class PartRequestDto {
    public id?: number;

    @IsNotEmpty()
    @IsString()
    public year: string;

    @IsNotEmpty()
    @IsString()
    public make: string;

    @IsNotEmpty()
    @IsString()
    public model: string;

    @IsNotEmpty()
    @IsString()
    public vinNumber: string;

    @IsNotEmpty()
    @IsString()
    public partName: string;

    @IsNotEmpty()
    @IsObject()
    @ValidateNested()
    @Type(() => PartTypeDto)
    public partType: PartTypeDto;

    @IsNotEmpty()
    @IsNumber()
    public numberOfOffers: number;

    @IsString()
    @IsNotEmpty()
    @IsEnum(OfferStatus)
    public offerStatus: OfferStatus;

    public user: UserEntity;
}

export class PostQuestionDto {
    public id?: number;

    @IsNotEmpty()
    @IsString()
    public question: string;

    @IsNotEmpty()
    @IsNumber()
    public sellerId: number;

    @IsNotEmpty()
    @IsNumber()
    public partRequestId: number;

    public partBidRequestId?: number;

    @IsNotEmpty()
    @IsBoolean()
    public isAnswered: boolean;
}

export class GetQuestionDto {
    @IsNotEmpty()
    @IsNumber()
    public sellerId: number;

    public partBidId?: number;

    public partRequestId?: number;
}

export class GetQuestionBuyerDto {
    @IsNotEmpty()
    @IsNumber()
    public sellerId: number;

    @IsNotEmpty()
    @IsNumber()
    public partRequestId: number;
}
