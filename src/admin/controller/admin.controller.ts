import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { hasRoles } from './../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from './../../auth/guards/jwt-guard';
import { AdminService } from '../service/admin.service';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { UserIsUserGuard } from './../../auth/guards/UserIsUser.guard';
import { UserRole } from './../../user/models/user.dto';
import { ResponseType } from '../../utilities/responseType';

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
}
