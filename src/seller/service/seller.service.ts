import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetQuestionBuyerDto, GetQuestionDto, OfferStatus, PostQuestionDto } from './../../buyer/models/part.dto';
import { getConnection, Repository } from 'typeorm';
import { PartRequsetEntity } from './../../buyer/models/part.entity';
import { PartBidRequestEntity } from '../models/partBidRequest.entity';
import {
    BidStandingStatusEnum,
    BidStatusEnum,
    PartBidRequestDto,
    SellerBidRequestStatus,
} from '../models/partBidRequest.dto';
import { QuestionAnswerEntity } from '../models/questionAnswer.entity';
import { UserEntity } from '../../user/models/user.entity';

@Injectable()
export class SellerService {
    constructor(
        @InjectRepository(PartRequsetEntity) private readonly partRequestRepository: Repository<PartRequsetEntity>,
        @InjectRepository(PartBidRequestEntity)
        private readonly partBidRequestRepository: Repository<PartBidRequestEntity>,
        @InjectRepository(QuestionAnswerEntity)
        private readonly questionAnswerRepository: Repository<QuestionAnswerEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    public async returnPartRequestList(userId: string): Promise<PartRequsetEntity[]> {
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

    public async getPartRequestById(userId: number): Promise<PartRequsetEntity> {
        const partRequest: PartRequsetEntity = await this.partRequestRepository.findOne({ id: userId });

        return partRequest;
    }

    public async savePartRequest(partRequest: PartRequsetEntity) {
        await this.partRequestRepository.save(partRequest);
    }

    public async savePartBidRequest(partBidRequest: PartBidRequestDto): Promise<PartBidRequestEntity> {
        const partBidRequestEntity = new PartBidRequestEntity();
        if (partBidRequest.id) {
            partBidRequestEntity.id = partBidRequest.id;
        }
        partBidRequestEntity.bidAmount = partBidRequest.bidAmount;
        partBidRequestEntity.bidWarranty = partBidRequest.bidWarranty;
        partBidRequestEntity.partBrand = partBidRequest.partBrand;
        partBidRequestEntity.estDeliveryTime = partBidRequest.estDeliveryTime;
        partBidRequestEntity.typeOfPart = partBidRequest.typeOfPart;
        partBidRequestEntity.bidStatus = partBidRequest.bidStatus;
        partBidRequestEntity.partRequest = partBidRequest.partRequest;
        partBidRequestEntity.isOfferAccepted = false;
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

            const storedPartRequest = await getConnection().query(
                `SELECT * FROM PARTS_REQUEST where ID=${bidRequest.partRequest.id}`,
            );
            // Get PartRequest info using partRequestId
            const buyerId = storedPartRequest[0].BUYER_USER_ID ?? 0;
            const winningBidRequest: PartBidRequestEntity = result[0];
            result.forEach((partBidRequest: PartBidRequestEntity) => {
                const sellerBidRequestStatus: SellerBidRequestStatus = {
                    year: bidRequest.partRequest.year,
                    make: bidRequest.partRequest.make,
                    model: bidRequest.partRequest.model,
                    part: bidRequest.partRequest.partName,
                    bid: partBidRequest.bidAmount,
                    warranty: partBidRequest.bidWarranty,
                    brand: partBidRequest.partBrand,
                    partRequestId: bidRequest.partRequest.id,
                    bidId: partBidRequest.id,
                    sellerId: partBidRequest.user.id,
                    bidStandingStatus: this.getBidStandingStatus(partBidRequest, winningBidRequest),
                    estDeliveryTime: partBidRequest.estDeliveryTime,
                    partType: partBidRequest.typeOfPart,
                    isOfferAccepted: partBidRequest.isOfferAccepted,
                    buyerId: buyerId,
                };
                sellerBidRequestStatusList.push(sellerBidRequestStatus);
            });
        }
        return sellerBidRequestStatusList;
    }

    public async getPartBidRequest(partRequestId: number, userId: number): Promise<PartBidRequestEntity[]> {
        return await this.partBidRequestRepository.find({
            where: { partRequest: { id: partRequestId }, user: { id: userId } },
        });
    }

    public async updatePartBidRequestOfferStatus(id: number): Promise<void> {
        await getConnection()
            .createQueryBuilder()
            .update(PartBidRequestEntity)
            .set({ isOfferAccepted: true })
            .where('id = :id', { id })
            .execute();
    }

    public async saveQuestions(postQuestionDto: PostQuestionDto): Promise<void> {
        const response = await getConnection().query(
            `SELECT * FROM PARTS_REQUEST where ID=${postQuestionDto.partRequestId}`,
        );
        const questionAnswerEntity = new QuestionAnswerEntity();
        questionAnswerEntity.question = postQuestionDto.question;
        questionAnswerEntity.answer = '';
        questionAnswerEntity.buyerId = response[0].BUYER_USER_ID;
        questionAnswerEntity.sellerId = postQuestionDto.sellerId;
        questionAnswerEntity.partRequestId = postQuestionDto.partRequestId;
        questionAnswerEntity.partBidId = null;
        if (postQuestionDto.partBidRequestId) {
            questionAnswerEntity.partBidId = postQuestionDto.partBidRequestId;
        }
        questionAnswerEntity.isAnswered = false;

        await this.questionAnswerRepository.save(questionAnswerEntity);
    }

    public async getQuestionAnswerForSeller(getQuestionDto: GetQuestionDto): Promise<QuestionAnswerEntity[]> {
        const response = await getConnection().query(
            `SELECT * FROM QUESTION_ANSWER where SELLER_ID=${getQuestionDto.sellerId} AND PART_REQUEST_ID=${getQuestionDto.partRequestId}`,
        );

        return response;
    }

    public async getQuestionAnswerForBuyer(getQuestionDto: GetQuestionBuyerDto): Promise<QuestionAnswerEntity[]> {
        const response = await getConnection().query(
            `SELECT * FROM QUESTION_ANSWER where BUYER_ID=${getQuestionDto.buyerId} AND PART_REQUEST_ID=${getQuestionDto.partBidId}`,
        );

        return response;
    }

    public async getSellerInformation(partRequestId, partBidRequestId): Promise<any> {
        const partRequestResponse = await getConnection().query(
            `SELECT * FROM PARTS_REQUEST where ID=${partRequestId}`,
        );

        const partBidRequestResponse = await getConnection().query(
            `SELECT * FROM PART_BID_REQUEST where ID=${partBidRequestId}`,
        );

        const userResponse = await this.userRepository.findOne({ id: partBidRequestResponse[0].SELLER_USER_ID });

        return {
            partRequest: partRequestResponse[0],
            partBidRequest: partBidRequestResponse[0],
            user: userResponse,
        };
    }

    public async getBuyerInformation(partRequestId, partBidRequestId): Promise<any> {
        const partRequestResponse = await getConnection().query(
            `SELECT * FROM PARTS_REQUEST where ID=${partRequestId}`,
        );

        const partBidRequestResponse = await getConnection().query(
            `SELECT * FROM PART_BID_REQUEST where ID=${partBidRequestId}`,
        );

        const userResponse = await this.userRepository.findOne({ id: partRequestResponse[0].BUYER_USER_ID });

        return {
            partRequest: partRequestResponse[0],
            partBidRequest: partBidRequestResponse[0],
            user: userResponse,
        };
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
