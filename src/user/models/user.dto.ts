export class UserDto {
    public id?: string;
    public userGuid?: string;
    public firstName: string;
    public lastName: string;
    public email: string;
    public password: string;
    public verifyPassword: string;
    public companyName: string;
    public address: AddressDto;
    public isMailDeliveryAcceptable: boolean;
    public phoneNumber: string;
    public faxNumber: string;
    public role?: RoleDto;
}

export interface RoleDto {
    id?: number;
    roleName: UserRole;
}

export interface AddressDto {
    id?: number;
    addressLineOne: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export enum UserRole {
    ADMIN = 'ADMIN',
    BUYER = 'BUYER',
    SELLER = 'SELLER',
}

export const userRoleMapper = new Map<string, number>([
    [UserRole.ADMIN, 1],
    [UserRole.BUYER, 2],
    [UserRole.SELLER, 3],
]);
