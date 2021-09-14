import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OfferStatus } from './../../buyer/models/part.dto';
import { Repository } from 'typeorm';
import { PartRequsetEntity } from './../../buyer/models/part.entity';
import { PartBidRequestEntity } from '../models/partBidRequest.entity';
import {
    BidStandingStatusEnum,
    BidStatusEnum,
    PartBidRequestDto,
    SellerBidRequestStatus,
} from '../models/partBidRequest.dto';

@Injectable()
export class SellerService {
    constructor(
        @InjectRepository(PartRequsetEntity) private readonly partRequestRepository: Repository<PartRequsetEntity>,
        @InjectRepository(PartBidRequestEntity)
        private readonly partBidRequestRepository: Repository<PartBidRequestEntity>,
    ) {}

    public async returnPartRequstList(): Promise<PartRequsetEntity[]> {
        return await this.partRequestRepository.find({ where: { offerStatus: OfferStatus.OPEN } });
    }

    public async savePartBidRequest(partBidRequest: PartBidRequestDto): Promise<PartBidRequestEntity> {
        const partBidRequestEntity = new PartBidRequestEntity();
        partBidRequestEntity.bidAmount = partBidRequest.bidAmount;
        partBidRequestEntity.bidWarranty = partBidRequest.bidWarranty;
        partBidRequestEntity.partBrand = partBidRequest.partBrand;
        partBidRequestEntity.estDeliveryTime = partBidRequest.estDeliveryTime;
        partBidRequestEntity.typeOfPart = partBidRequest.typeOfPart;
        partBidRequestEntity.bidStatus = partBidRequest.bidStatus;
        partBidRequestEntity.partRequest = partBidRequest.partRequest;
        partBidRequestEntity.user = partBidRequest.user;

        return await this.partBidRequestRepository.save(partBidRequestEntity);
    }

    public async getListOfBidStatus(sellerUserId: string): Promise<SellerBidRequestStatus[]> {
        const sellerBidRequestList: PartBidRequestEntity[] = await this.partBidRequestRepository.find({
            where: { user: { id: sellerUserId } },
            relations: ['partRequest', 'user'],
        });

        const sellerBidRequestStatusList: SellerBidRequestStatus[] = [];
        // Next thing is to find the best bid request for each selletBid
        for (const bidRequest of sellerBidRequestList) {
            const result: PartBidRequestEntity[] = await this.partBidRequestRepository.find({
                where: { partRequest: { id: bidRequest.partRequest.id } },
                order: {
                    bidAmount: 'ASC',
                },
            });
            const winningBidRequest: PartBidRequestEntity = result[0];
            const sellerBidRequestStatus: SellerBidRequestStatus = {
                year: bidRequest.partRequest.year,
                make: bidRequest.partRequest.make,
                model: bidRequest.partRequest.model,
                part: bidRequest.partRequest.partName,
                bid: winningBidRequest.bidAmount,
                warranty: winningBidRequest.bidWarranty,
                brand: winningBidRequest.partBrand,
                partRequestId: bidRequest.id,
                bidId: winningBidRequest.id,
                bidStandingStatus: this.getBidStandingStatus(bidRequest, winningBidRequest),
            };
            sellerBidRequestStatusList.push(sellerBidRequestStatus);
        }
       return sellerBidRequestStatusList;
    }

    private getBidStandingStatus(
        bidRequest: PartBidRequestEntity,
        winningBidRequest: PartBidRequestEntity,
    ): BidStandingStatusEnum {
        let bidStandingStatus: BidStandingStatusEnum = BidStandingStatusEnum.OUTBID;
        if (bidRequest.id === winningBidRequest.id && winningBidRequest.bidStatus === BidStatusEnum.ACCEPTED) {
            bidStandingStatus = BidStandingStatusEnum.ACCEPTED;
        } else if (bidRequest.id !== winningBidRequest.id && winningBidRequest.bidStatus === BidStatusEnum.OPEN) {
            bidStandingStatus = BidStandingStatusEnum.OUTBID;
        } else if (bidRequest.id === winningBidRequest.id && winningBidRequest.bidStatus === BidStatusEnum.OPEN) {
            bidStandingStatus = BidStandingStatusEnum.BEST_BID;
        }
        return bidStandingStatus;
    }
}
