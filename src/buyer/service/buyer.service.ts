import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PartBidRequestEntity } from '../../seller/models/partBidRequest.entity';
import { getConnection, Repository } from 'typeorm';
import { PartRequestDto, PostAnswerDto } from '../models/part.dto';
import { PartRequsetEntity } from '../models/part.entity';
import { QuestionAnswerEntity } from '../../seller/models/questionAnswer.entity';

@Injectable()
export class BuyerService {
    constructor(
        @InjectRepository(PartRequsetEntity) private readonly partRequestRepository: Repository<PartRequsetEntity>,
        @InjectRepository(PartBidRequestEntity)
        private readonly partBidRequestRepository: Repository<PartBidRequestEntity>,
        @InjectRepository(QuestionAnswerEntity)
        private readonly questionAnswerRepository: Repository<QuestionAnswerEntity>,
    ) {}

    public async savePartRequest(partRequest: PartRequestDto): Promise<PartRequsetEntity> {
        const partRequestEntity = new PartRequsetEntity();
        partRequestEntity.make = partRequest.make;
        partRequestEntity.year = partRequest.year;
        partRequestEntity.model = partRequest.model;
        partRequestEntity.vinNumber = partRequest.vinNumber;
        partRequestEntity.partName = partRequest.partName;
        partRequestEntity.newPartType = partRequest.partType.new;
        partRequestEntity.usedPartType = partRequest.partType.used;
        partRequestEntity.reManufacturedPartType = partRequest.partType.reManufactured;
        partRequestEntity.numberOfOffers = partRequest.numberOfOffers;
        partRequestEntity.offerStatus = partRequest.offerStatus;
        partRequestEntity.partRequestCreationDate = new Date().toISOString().split('T')[0];
        partRequestEntity.partRequestUpdatedDate = new Date().toISOString().split('T')[0];
        partRequestEntity.user = partRequest.user;

        return await this.partRequestRepository.save(partRequestEntity);
    }

    public async returnPartRequstList(userId: string): Promise<PartRequsetEntity[]> {
        return await this.partRequestRepository.find({ where: { user: { id: userId } } });
    }

    public async getPartOffersList(partRequestId: string): Promise<any> {
        const sellerBidRequestList: PartBidRequestEntity[] = await this.partBidRequestRepository.find({
            where: { partRequest: { id: partRequestId } },
        });

        const partRequsetEntity = await this.getPartRequestById(+partRequestId);
        const finalResult: PartBidRequestEntity[] = [];
        sellerBidRequestList.forEach((seller) => {
            delete seller.user;
            finalResult.push(seller);
        });
        return { partRequest: partRequsetEntity, partOffers: finalResult };
    }

    public async getPartRequestById(partRequestId: number): Promise<PartRequsetEntity> {
        return await this.partRequestRepository.findOne({ id: partRequestId });
    }

    public async updatePartRequest(partRequest: PartRequsetEntity): Promise<void> {
        await this.partRequestRepository.save(partRequest);
    }

    public async saveAnswer(postAnswerDto: PostAnswerDto): Promise<void> {
        await getConnection()
            .createQueryBuilder()
            .update(QuestionAnswerEntity)
            .set({ answer: postAnswerDto.answer, isAnswered: true })
            .where('id = :id', { id: postAnswerDto.id })
            .execute();
    }
}
