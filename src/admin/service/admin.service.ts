import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './../../user/models/user.entity';
import { getConnection, Not, Repository } from 'typeorm';
import { RoleEntity } from './../../user/models/role.entity';
import { AddressEntity } from './../../user/models/address.entity';
import { UserSessionEntity } from './../../user/models/user-session.entity';
import { AuthService } from './../../auth/service/auth.service';
import { AccountUpdateDto, GetReportDto } from '../models/admin.dto';
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

    public async getReport(getReportDto: GetReportDto, user: UserEntity) {
        const query = `SELECT * from (SELECT * from (SELECT PARTS_REQUEST.ID as PART_ID, PART_REQUEST_CREATED_DATE,YEAR, MAKE, MODEL,VIN_NUMBER,PART_NAME,BUYER_USER_ID, BID_AMOUNT, PART_BRAND, TYPE_OF_PARTS, SELLER_USER_ID, BID_WARRANTY, EST_DELIVERY_TIME  FROM PARTS_REQUEST INNER JOIN PART_BID_REQUEST on PARTS_REQUEST.ID = PART_BID_REQUEST.PART_REQUEST_ID and PART_BID_REQUEST.IS_OFFER_ACCEPTED=1 and PART_BID_REQUEST.SELLER_USER_ID=${user.id} and (PART_REQUEST_CREATED_DATE between '${getReportDto.startDate}' and '${getReportDto.endDate}')) AS SQ inner join (select USER_ID,FIRST_NAME as SELLER_FIRST_NAME,LAST_NAME as SELLER_LAST_NAME from USER) AS U  on U.USER_ID=SQ.SELLER_USER_ID)  as SP inner join(SELECT PART_ID, BUYER_FIRST_NAME,BUYER_LAST_NAME from (SELECT PARTS_REQUEST.ID as PART_ID, PART_REQUEST_CREATED_DATE,YEAR, MAKE, MODEL,VIN_NUMBER,PART_NAME,BUYER_USER_ID, BID_AMOUNT, PART_BRAND, TYPE_OF_PARTS, SELLER_USER_ID, BID_WARRANTY, EST_DELIVERY_TIME  FROM PARTS_REQUEST INNER JOIN PART_BID_REQUEST on PARTS_REQUEST.ID = PART_BID_REQUEST.PART_REQUEST_ID and PART_BID_REQUEST.IS_OFFER_ACCEPTED=1 and PART_BID_REQUEST.SELLER_USER_ID=${user.id} and (PART_REQUEST_CREATED_DATE between '${getReportDto.startDate}' and '${getReportDto.endDate}')) AS SQ inner join (select USER_ID,FIRST_NAME as BUYER_FIRST_NAME,LAST_NAME as BUYER_LAST_NAME from USER) AS U  on U.USER_ID=SQ.BUYER_USER_ID) as PS on PS.PART_ID=SP.PART_ID`;

        const response = await getConnection().query(query);

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
