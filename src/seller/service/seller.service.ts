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

    public async returnPartRequstList(userId: string): Promise<PartRequsetEntity[]> {
        const partRequestList: PartRequsetEntity[] = await this.partRequestRepository.find({
            where: { offerStatus: OfferStatus.OPEN },
        });
        const finalPartRequestList: PartRequsetEntity[] = [];

        for (const partRequest of partRequestList) {
            const isSellerHasAlreadyPutRequest = await this.isBidRequestAlreadyPresentForThePart(
                userId,
                partRequest.id,
            );
            if (!isSellerHasAlreadyPutRequest) {
                finalPartRequestList.push(partRequest);
            }
        }

        return finalPartRequestList;
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

    public async isBidRequestAlreadyPresentForThePart(sellerUserId: string, partRequestId): Promise<boolean> {
        const sellerBidRequestList: PartBidRequestEntity[] = await this.partBidRequestRepository.find({
            where: { user: { id: sellerUserId }, partRequest: { id: partRequestId } },
        });

        return sellerBidRequestList.length > 0 ? true : false;
    }

    public async getListOfBidStatus(sellerUserId: string): Promise<SellerBidRequestStatus[]> {
        const sellerBidRequestList: PartBidRequestEntity[] = await this.partBidRequestRepository.find({
            where: { user: { id: sellerUserId } },
            relations: ['partRequest', 'user'],
        });

        const sellerBidRequestStatusList: SellerBidRequestStatus[] = [];
        // Next thing is to find the best bid request for each seller Bid
        for (const bidRequest of sellerBidRequestList) {
            const result: PartBidRequestEntity[] = await this.partBidRequestRepository.find({
                where: { partRequest: { id: bidRequest.partRequest.id } },
                order: {
                    bidAmount: 'ASC',
                },
            });

            const winningBidRequest: PartBidRequestEntity = result[0];
            result.forEach((parthBidRequest: PartBidRequestEntity) => {
                const sellerBidRequestStatus: SellerBidRequestStatus = {
                    year: bidRequest.partRequest.year,
                    make: bidRequest.partRequest.make,
                    model: bidRequest.partRequest.model,
                    part: bidRequest.partRequest.partName,
                    bid: parthBidRequest.bidAmount,
                    warranty: parthBidRequest.bidWarranty,
                    brand: parthBidRequest.partBrand,
                    partRequestId: parthBidRequest.id,
                    bidId: parthBidRequest.id,
                    sellerId: parthBidRequest.user.id,
                    bidStandingStatus: this.getBidStandingStatus(parthBidRequest, winningBidRequest),
                };
                sellerBidRequestStatusList.push(sellerBidRequestStatus);
            });
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
