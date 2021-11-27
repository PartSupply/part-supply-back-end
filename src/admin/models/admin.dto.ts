import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class AccountUpdateDto {
    @IsNotEmpty()
    @IsNumber()
    public userId: number;

    @IsNotEmpty()
    @IsBoolean()
    public isAccountApproved: boolean;

    @IsNotEmpty()
    @IsBoolean()
    public isAccountActive: boolean;
}
