import { Body, Controller, Get, Param, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { GetQuestionBuyerDto, OfferStatus, PartRequestDto, PartRequestIdDto, PostAnswerDto } from '../models/part.dto';
import { ResponseType } from '../../utilities/responseType';
import { hasRoles } from './../../auth/decorators/roles.decorator';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { JwtAuthGuard } from './../../auth/guards/jwt-guard';
import { UserIsUserGuard } from './../../auth/guards/UserIsUser.guard';
import { BuyerService } from '../service/buyer.service';
import { UserRole } from './../../user/models/user.dto';
import { Req } from '@nestjs/common';
import { PartRequsetEntity } from '../models/part.entity';
import { SellerService } from './../../seller/service/seller.service';

@Controller('buyer')
export class BuyerController {
    constructor(private buyerService: BuyerService, private sellerService: SellerService) {}

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

    @hasRoles(UserRole.BUYER, UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Get('partOffers/:id')
    public async returnPartOffers(@Req() request, @Param('id') id): Promise<ResponseType<any>> {
        const partOfferRequestList = await this.buyerService.getPartOffersList(id);
        return {
            data: partOfferRequestList,
        };
    }

    @hasRoles(UserRole.BUYER, UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Post('acceptPartOffer')
    public async acceptPartOfferRequest(
        @Req() request,
        @Body(ValidationPipe) partRequestIdDto: PartRequestIdDto,
    ): Promise<ResponseType<any>> {
        const partRequest = await this.buyerService.getPartRequestById(+partRequestIdDto.id);
        partRequest.offerStatus = OfferStatus.ACCEPTED;

        await this.sellerService.updatePartBidRequestOfferStatus(+partRequestIdDto.bidRequestId);
        await this.buyerService.updatePartRequest(partRequest);
        return {
            data: 'status changed to accepted for this part request',
        };
    }

    @hasRoles(UserRole.BUYER, UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Post('postAnswer')
    public async postAnswer(
        @Req() request,
        @Body(ValidationPipe) postAnswerDto: PostAnswerDto,
    ): Promise<ResponseType<any>> {
        await this.buyerService.saveAnswer(postAnswerDto);
        return {
            data: 'Answer saved Successfully',
        };
    }

    @hasRoles(UserRole.BUYER, UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Post('questionAnswer')
    public async getAllQuestionAnswer(
        @Req() request,
        @Body(ValidationPipe) getQuestionDto: GetQuestionBuyerDto,
    ): Promise<ResponseType<any>> {
        const response = await this.sellerService.getQuestionAnswerForBuyer(getQuestionDto);
        return {
            data: response,
        };
    }

    @hasRoles(UserRole.BUYER, UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard, UserIsUserGuard)
    @Get('sellerInformation')
    public async getSellerInformation(
        @Req() request,
        @Query('partRequestId') partRequestId: number,
        @Query('partBidRequestId') partBidRequestId: number,
    ): Promise<ResponseType<any>> {
        const response = await this.sellerService.getSellerInformation(partRequestId, partBidRequestId);
        return {
            data: response,
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
