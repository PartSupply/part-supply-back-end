import { Get, InternalServerErrorException, Post, Put, UseGuards } from '@nestjs/common';
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
    public async returnPartsRequest(@Req() request): Promise<ResponseType<any>> {
        const partRequest: PartRequsetEntity[] = await this.sellerService.returnPartRequestList(request.user.id);
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
        // Check here if seller has already put request for this part or not
        const isSellerAlreadyPutBidRequest = await this.sellerService.isBidRequestAlreadyPresentForThePart(
            request.user.id,
            partBidRequest.partRequest.id,
        );
        if (isSellerAlreadyPutBidRequest) {
            throw new InternalServerErrorException('Seller has already put an offer for this part');
        }
        const savedPartBidRequest = await this.sellerService.savePartBidRequest(partBidRequest);
        delete savedPartBidRequest.user;

        // Update # of offers
        const partRequest = await this.sellerService.getPartRequestById(partBidRequest.partRequest.id);
        partRequest.numberOfOffers = partRequest.numberOfOffers + 1;
        await this.sellerService.savePartRequest(partRequest);
        return {
            data: savedPartBidRequest,
        };
    }

    @hasRoles(UserRole.SELLER, UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Put('partBidRequest')
    public async updatePartBidRequest(
        @Req() request,
        @Body(ValidationPipe) partBidRequest: PartBidRequestDto,
    ): Promise<ResponseType<any>> {
        // First get part bid request
        const savedPartBidRequest = await this.sellerService.getPartBidRequest(
            partBidRequest.partRequest.id,
            request.user.id,
        );
        if (!savedPartBidRequest.length || savedPartBidRequest[0].id !== partBidRequest.id) {
            throw new InternalServerErrorException('User is not allowed to perform update operation');
        }
        // Check if this user only has submitted request
        if (savedPartBidRequest[0].user.id !== request.user.id) {
            throw new InternalServerErrorException('User is not authorized to perform this update operation');
        }

        // Update the record now
        partBidRequest.user = request.user;
        await this.sellerService.savePartBidRequest(partBidRequest);
        delete savedPartBidRequest[0].user;

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
