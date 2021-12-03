import { Body, Controller, Get, Post, Put, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { hasRoles } from './../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from './../../auth/guards/jwt-guard';
import { AdminService } from '../service/admin.service';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { UserIsUserGuard } from './../../auth/guards/UserIsUser.guard';
import { UserRole } from './../../user/models/user.dto';
import { ResponseType } from '../../utilities/responseType';
import { AccountUpdateDto, GetReportDto } from '../models/admin.dto';

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService) {}

    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Get('accountsCreateRequest')
    public async submitPartRequest(@Req() request): Promise<ResponseType<any>> {
        const response = await this.adminService.getAllUsersAccountDetails();
        return {
            data: response,
        };
    }

    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Put('updateAccountStatus')
    public async updateUserAccountStatus(
        @Req() request,
        @Body(ValidationPipe) accountUpdateDto: AccountUpdateDto,
    ): Promise<ResponseType<any>> {
        await this.adminService.updateUserAccountDetails(accountUpdateDto);
        return {
            data: 'account update successfully',
        };
    }

    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Get('allBuyerPartRequest')
    public async getAllBuyerRequest(@Req() request): Promise<ResponseType<any>> {
        const response = await this.adminService.getAllBuyerRequest();
        return {
            data: response,
        };
    }

    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Get('allSellerOfferRequest')
    public async getAllSellerOfferRequest(@Req() request): Promise<ResponseType<any>> {
        const response = await this.adminService.getAllSellerPartOfferRequest();
        return {
            data: response,
        };
    }

    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Post('getReport')
    public async getReport(@Body(ValidationPipe) getReportDto: GetReportDto): Promise<ResponseType<any>> {
        const response = await this.adminService.getReport(getReportDto);
        return {
            data: response,
        };
    }
}
