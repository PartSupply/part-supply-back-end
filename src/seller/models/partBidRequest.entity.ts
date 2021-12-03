import { PartRequsetEntity } from './../../buyer/models/part.entity';
import { UserEntity } from './../../user/models/user.entity';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BidStatusEnum, TypeOfPartEnum } from './partBidRequest.dto';

@Entity({ name: 'PART_BID_REQUEST' })
export class PartBidRequestEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'ID' })
    public id: number;

    @Column({ name: 'BID_AMOUNT' })
    public bidAmount: number;

    @Column({ name: 'BID_WARRANTY' })
    public bidWarranty: string;

    @Column({ name: 'PART_BRAND' })
    public partBrand: string;

    @Column({ name: 'EST_DELIVERY_TIME' })
    public estDeliveryTime: string;

    @Column({ name: 'TYPE_OF_PARTS' })
    public typeOfPart: TypeOfPartEnum;

    @Column({ name: 'BID_STATUS' })
    public bidStatus: BidStatusEnum;

    @Column({ name: 'IS_OFFER_ACCEPTED' })
    public isOfferAccepted: boolean;

    @CreateDateColumn({ name: 'PART_OFFER_CREATED_DATE' })
    public partOfferCreatedDate: Date;

    @UpdateDateColumn({ name: 'PART_OFFER_UPDATED_DATE' })
    public partOfferUpdatedDate: Date;

    @ManyToOne(() => PartRequsetEntity, { eager: false })
    @JoinColumn({ name: 'PART_REQUEST_ID', referencedColumnName: 'id' })
    public partRequest: PartRequsetEntity;

    @ManyToOne(() => UserEntity, { eager: true })
    @JoinColumn({ name: 'SELLER_USER_ID', referencedColumnName: 'id' })
    public user: UserEntity;
}
