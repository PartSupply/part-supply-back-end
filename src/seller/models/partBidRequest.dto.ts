import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PartRequsetEntity } from './../../buyer/models/part.entity';
import { UserEntity } from './../../user/models/user.entity';

export enum TypeOfPartEnum {
    NEW = 'NEW',
    USED = 'USED',
    RE_MANUFACTURED = 'RE_MANUFACTURED',
}

export enum BidStatusEnum {
    ACCEPTED = 'ACCEPTED',
    OPEN = 'OPEN',
    CANCELLED = 'CANCELLED',
}

export class PartBidRequestDto {
    public id?: number;

    @IsNotEmpty()
    @IsNumber()
    public bidAmount: number;

    @IsNotEmpty()
    @IsString()
    public bidWarranty: string;

    @IsNotEmpty()
    @IsString()
    public partBrand: string;

    @IsNotEmpty()
    @IsNumber()
    public estDeliveryTime: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(TypeOfPartEnum)
    public typeOfPart: TypeOfPartEnum;

    @IsString()
    @IsNotEmpty()
    @IsEnum(BidStatusEnum)
    public bidStatus: BidStatusEnum;

    public partRequest?: PartRequsetEntity;

    public user?: UserEntity;
}

export enum BidStandingStatusEnum {
    OUTBID = 'OUTBID',
    BEST_BID = 'BEST_BID',
    ACCEPTED = 'ACCEPTED',
}

export type SellerBidRequestStatus = {
    year: string;
    make: string;
    model: string;
    part: string;
    bid: number;
    warranty: string;
    brand: string;
    partRequestId: number;
    bidId: number;
    bidStandingStatus: BidStandingStatusEnum;
};
