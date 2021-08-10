import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartRequestDto } from '../models/part.dto';
import { PartRequsetEntity } from '../models/part.entity';

@Injectable()
export class BuyerService {
    constructor(
        @InjectRepository(PartRequsetEntity) private readonly partRequestRepository: Repository<PartRequsetEntity>,
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
        partRequestEntity.user = partRequest.user;

        return await this.partRequestRepository.save(partRequestEntity);
    }

    public async returnPartRequstList(userId: string): Promise<PartRequsetEntity[]> {
        return await this.partRequestRepository.find({ where: { user: { id: userId } } });
    }
}
