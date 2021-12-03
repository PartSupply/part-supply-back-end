import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

export class GetReportDto {
    @IsNotEmpty()
    @IsString()
    public startDate: string;
    @IsNotEmpty()
    @IsString()
    public endDate: string;
}
