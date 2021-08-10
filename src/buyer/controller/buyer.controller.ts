import { Body, Controller, Get, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { PartRequestDto } from '../models/part.dto';
import { ResponseType } from '../../utilities/responseType';
import { hasRoles } from './../../auth/decorators/roles.decorator';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { JwtAuthGuard } from './../../auth/guards/jwt-guard';
import { UserIsUserGuard } from './../../auth/guards/UserIsUser.guard';
import { BuyerService } from '../service/buyer.service';
import { UserRole } from './../../user/models/user.dto';
import { Req } from '@nestjs/common';
import { PartRequsetEntity } from '../models/part.entity';

@Controller('buyer')
export class BuyerController {
    constructor(private buyerService: BuyerService) {}

    @hasRoles(UserRole.BUYER, UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Post('submitPartRequest')
    public async submitPartRequest(
        @Req() request,
        @Body(ValidationPipe) partRequest: PartRequestDto,
    ): Promise<ResponseType<any>> {
        partRequest.user = request.user;
        const savedPartRequest = await this.buyerService.savePartRequest(partRequest);
        delete savedPartRequest.user;
        return {
            data: this.trasformPartTypeRequestToDto(savedPartRequest),
        };
    }

    @hasRoles(UserRole.BUYER, UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Get('partsRequest')
    public async returnPartsRequest(@Req() request): Promise<ResponseType<any>> {
        const loggedInUserId = request.user.id;
        const partRequest: PartRequsetEntity[] = await this.buyerService.returnPartRequstList(loggedInUserId);
        return {
            data: this.transformPartsRequestToDto(partRequest),
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
