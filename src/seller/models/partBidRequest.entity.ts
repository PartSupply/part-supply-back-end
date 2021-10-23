import { PartRequsetEntity } from './../../buyer/models/part.entity';
import { UserEntity } from './../../user/models/user.entity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

    @ManyToOne(() => PartRequsetEntity, { eager: false })
    @JoinColumn({ name: 'PART_REQUEST_ID', referencedColumnName: 'id' })
    public partRequest: PartRequsetEntity;

    @ManyToOne(() => UserEntity, { eager: true })
    @JoinColumn({ name: 'USER_ID', referencedColumnName: 'id' })
    public user: UserEntity;
}
