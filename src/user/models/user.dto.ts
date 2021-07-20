import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum UserRole {
    ADMIN = 'ADMIN',
    BUYER = 'BUYER',
    SELLER = 'SELLER',
}
export class RoleDto {
    public id?: number;
    @IsString()
    @IsNotEmpty()
    @IsEnum(UserRole)
    public roleName: UserRole;
}

export class AddressDto {
    public id?: number;
    @IsNotEmpty()
    @IsString()
    public addressLineOne: string;
    @IsNotEmpty()
    @IsString()
    public city: string;
    @IsNotEmpty()
    @IsString()
    public state: string;
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(5)
    public zipCode: string;
    @IsNotEmpty()
    @IsString()
    public country: string;
}
export class UserDto {
    public id?: string;
    public userGuid?: string;
    @IsNotEmpty()
    @IsString()
    public firstName: string;
    @IsNotEmpty()
    @IsString()
    public lastName: string;
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    public email: string;
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    public password: string;
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    public verifyPassword: string;
    @IsNotEmpty()
    @IsString()
    public companyName: string;
    @IsNotEmpty()
    @IsObject()
    @ValidateNested()
    @Type(() => AddressDto)
    public address: AddressDto;
    @IsNotEmpty()
    @IsBoolean()
    public isMailDeliveryAcceptable: boolean;
    @IsNotEmpty()
    @IsString()
    @MaxLength(10)
    public phoneNumber: string;
    @IsOptional()
    public faxNumber: string;
    @IsNotEmpty()
    @IsString()
    public deliveryRadious: string;
    @IsNotEmpty()
    @IsObject()
    @ValidateNested()
    @Type(() => RoleDto)
    public role?: RoleDto;
}

export const userRoleMapper = new Map<string, number>([
    [UserRole.ADMIN, 1],
    [UserRole.BUYER, 2],
    [UserRole.SELLER, 3],
]);
