import { UserEntity } from './../../user/models/user.entity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OfferStatus } from './part.dto';
import { PartBidRequestEntity } from './../../seller/models/partBidRequest.entity';

@Entity({ name: 'PARTS_REQUEST' })
export class PartRequsetEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'ID' })
    public id: number;

    @Column({ name: 'YEAR' })
    public year: string;

    @Column({ name: 'MAKE' })
    public make: string;

    @Column({ name: 'MODEL' })
    public model: string;

    @Column({ name: 'VIN_NUMBER' })
    public vinNumber: string;

    @Column({ name: 'PART_NAME' })
    public partName: string;

    @Column({ name: 'USED' })
    public usedPartType: boolean;

    @Column({ name: 'NEW' })
    public newPartType: boolean;

    @Column({ name: 'RE_MANUFACTURED' })
    public reManufacturedPartType: boolean;

    @Column({ name: 'NO_OF_OFFER' })
    public numberOfOffers: number;

    @Column({ type: 'enum', name: 'OFFER_STATUS', enum: OfferStatus })
    public offerStatus: OfferStatus;

    @ManyToOne(() => UserEntity, { eager: false })
    @JoinColumn({ name: 'USER_ID', referencedColumnName: 'id' })
    public user: UserEntity;

    @OneToMany(() => PartBidRequestEntity, (partBidRequest) => partBidRequest.id, { eager: false })
    public partBidsRequest: PartBidRequestEntity[];
}
