import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { UserEntity } from 'src/user/models/user.entity';

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
