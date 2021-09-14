import { Get, Post, UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { hasRoles } from './../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from './../../auth/guards/jwt-guard';
import { UserRole } from './../../user/models/user.dto';
import { UserIsUserGuard } from './../../auth/guards/UserIsUser.guard';
import { ResponseType } from '../../utilities/responseType';
import { SellerService } from '../service/seller.service';
import { PartRequsetEntity } from './../../buyer/models/part.entity';
import { PartRequestDto } from './../../buyer/models/part.dto';
import { Req } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { PartBidRequestDto, SellerBidRequestStatus } from '../models/partBidRequest.dto';

@Controller('seller')
export class SellerController {
    constructor(private sellerService: SellerService) {}

    @hasRoles(UserRole.SELLER, UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Get('partsRequest')
    public async returnPartsRequest(): Promise<ResponseType<any>> {
        const partRequest: PartRequsetEntity[] = await this.sellerService.returnPartRequstList();
        return {
            data: this.transformPartsRequestToDto(partRequest),
        };
    }

    @hasRoles(UserRole.SELLER, UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Post('partBidRequest')
    public async submitRequest(
        @Req() request,
        @Body(ValidationPipe) partBidRequest: PartBidRequestDto,
    ): Promise<ResponseType<any>> {
        partBidRequest.user = request.user;
        const savedPartBidRequest = await this.sellerService.savePartBidRequest(partBidRequest);
        delete savedPartBidRequest.user;

        return {
            data: savedPartBidRequest,
        };
    }

    @hasRoles(UserRole.SELLER, UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Get('partBidsRequest')
    public async returnPartBidsRequest(@Req() request): Promise<ResponseType<any>> {
        const result: SellerBidRequestStatus[] = await this.sellerService.getListOfBidStatus(request.user.id);
        return {
            data: result,
        };
    }

    private trasformPartTypeRequestToDto(partRequestEntity: PartRequsetEntity): PartRequestDto {
        const partRequestDto = new PartRequestDto();
        partRequestDto.id = partRequestEntity.id;
        partRequestDto.make = partRequestEntity.make;
        partRequestDto.year = partRequestEntity.year;
        partRequestDto.model = partRequestEntity.model;
        partRequestDto.vinNumber = partRequestEntity.vinNumber;
        partRequestDto.partName = partRequestEntity.partName;
        partRequestDto.partType = {
            used: partRequestEntity.usedPartType,
            new: partRequestEntity.newPartType,
            reManufactured: partRequestEntity.reManufacturedPartType,
        };
        partRequestDto.numberOfOffers = partRequestEntity.numberOfOffers;
        partRequestDto.offerStatus = partRequestEntity.offerStatus;

        return partRequestDto;
    }

    private transformPartsRequestToDto(partRequestEntity: PartRequsetEntity[]): PartRequestDto[] {
        const listOfPartRequestDto: PartRequestDto[] = [];
        partRequestEntity.forEach((entity) => {
            listOfPartRequestDto.push(this.trasformPartTypeRequestToDto(entity));
        });

        return listOfPartRequestDto;
    }
}
