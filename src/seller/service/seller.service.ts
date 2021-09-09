import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OfferStatus } from './../../buyer/models/part.dto';
import { Repository } from 'typeorm';
import { PartRequsetEntity } from './../../buyer/models/part.entity';

@Injectable()
export class SellerService {
    constructor(
        @InjectRepository(PartRequsetEntity) private readonly partRequestRepository: Repository<PartRequsetEntity>,
    ) {}

    public async returnPartRequstList(): Promise<PartRequsetEntity[]> {
        return await this.partRequestRepository.find({ where: { offerStatus: OfferStatus.OPEN } });
    }
}
