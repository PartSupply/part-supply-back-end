import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './../../user/models/user.entity';
import { Not, Repository } from 'typeorm';
import { RoleEntity } from './../../user/models/role.entity';
import { AddressEntity } from './../../user/models/address.entity';
import { UserSessionEntity } from './../../user/models/user-session.entity';
import { AuthService } from './../../auth/service/auth.service';
import { AccountUpdateDto } from '../models/admin.dto';
import { PartRequsetEntity } from './../../buyer/models/part.entity';
import { PartBidRequestEntity } from './../../seller/models/partBidRequest.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(RoleEntity) private readonly roleRepository: Repository<RoleEntity>,
        @InjectRepository(AddressEntity) private readonly addressRepository: Repository<AddressEntity>,
        @InjectRepository(UserSessionEntity) private readonly userSessionRepository: Repository<UserSessionEntity>,
        @InjectRepository(PartRequsetEntity) private readonly partRequestRepository: Repository<PartRequsetEntity>,
        @InjectRepository(PartBidRequestEntity) private readonly partBidRequestRepository: Repository<PartBidRequestEntity>,
        private authService: AuthService,
    ) {}

    public async getAllUsersAccountDetails() {
        const response = await this.userRepository.find({
            where: {
                role: { id: Not(1) },
            },
        });
        return response;
    }

    public async getAllBuyerRequest() {
        const response = await this.partRequestRepository.find();
        return response;
    }

    public async getAllSellerPartOfferRequest() {
        const response = await this.partBidRequestRepository.find({
            relations: ['partRequest'],
        });
        return response;
    }

    public async updateUserAccountDetails(accountUpdateDto: AccountUpdateDto): Promise<void> {
        let userEntity: UserEntity = null;
        try {
            userEntity = await this.userRepository.findOne({ id: accountUpdateDto.userId });
        } catch (error) {
            throw new NotFoundException('Provided user id not found in records');
        }

        if (!userEntity.isAccountApproved && accountUpdateDto.isAccountApproved) {
            // that means request is coming for to update the user account is approved by admin
            userEntity.isAccountApproved = true;
            userEntity.isAccountActive = true;
        } else if (accountUpdateDto.isAccountApproved && !accountUpdateDto.isAccountActive){
            // that means account is active but we need to block that account now
            userEntity.isAccountActive = false;
            userEntity.isAccountApproved = false;
        }

        await this.userRepository.save(userEntity);
    }
}
