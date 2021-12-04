import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Post,
    Put,
    Req,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { hasRoles } from './../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from './../../auth/guards/jwt-guard';
import { AdminService } from '../service/admin.service';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { UserIsUserGuard } from './../../auth/guards/UserIsUser.guard';
import { UserRole } from './../../user/models/user.dto';
import { ResponseType } from '../../utilities/responseType';
import { AccountUpdateDto, DeletePartRequestDto, GetReportDto } from '../models/admin.dto';
import { UserService } from './../../user/service/user.service';

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService, private userService: UserService) {}

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
        let user;
        try {
            user = await this.userService.findUserByEmail(getReportDto.sellerEmail);
            if (user === undefined) {
                throw new NotFoundException('Provided user email address not found');
            }
        } catch (error) {
            throw new NotFoundException('Provided user email address not found');
        }
        const response: any[] = await this.adminService.getReport(getReportDto, user);
        let amount = 0;
        response.forEach((res: any) => {
            amount += res.BID_AMOUNT;
        });
        return {
            data: {
                acceptedOffers: response,
                amount: amount * (getReportDto.commissionPercentage / 100),
            },
        };
    }

    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Post('deletePartRequest')
    public async deletePartRequest(
        @Body(ValidationPipe) deletePartRequestDto: DeletePartRequestDto,
    ): Promise<ResponseType<any>> {
        await this.adminService.deletePartRequest(deletePartRequestDto.partRequestIds);
        return {
            data: 'Item deleted successfully',
        };
    }
}
