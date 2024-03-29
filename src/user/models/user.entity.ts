import { PartRequsetEntity } from './../../buyer/models/part.entity';
import {
    BaseEntity,
    BeforeInsert,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';
import { AddressEntity } from './address.entity';
import { RoleEntity } from './role.entity';
import { PartBidRequestEntity } from './../../seller/models/partBidRequest.entity';

@Entity({ name: 'USER' })
@Unique('UNIQUE_USER_GUID_EMAIL', ['userGuid', 'email'])
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'USER_ID' })
    public id: number;

    @Column({ name: 'USER_GUID' })
    public userGuid: string;

    @Column({ name: 'FIRST_NAME' })
    public firstName: string;

    @Column({ name: 'LAST_NAME' })
    public lastName: string;

    @Column({ name: 'EMAIL', unique: true })
    public email: string;

    @Column({ name: 'PASSWORD' })
    public password: string;

    @Column({ name: 'COMPNAY_NAME' })
    public companyName: string;

    @OneToOne(() => AddressEntity, { eager: true })
    @JoinColumn({ name: 'USER_ADDRESS_ID' })
    public address: AddressEntity;

    @Column({ name: 'IS_MAIL_DELIVERY_ACCEPTABLE' })
    public isMailDeliveryAcceptable: string;

    @Column({ name: 'PHONE_NUMBER' })
    public phoneNumber: string;

    @Column({ name: 'FAX_NUMBER' })
    public faxNumber: string;

    @Column({ name: 'DELIVERY_RADIUS', nullable: true })
    public deliveryRadius: string;

    @Column({ name: 'IS_ACCOUNT_APPROVED' })
    public isAccountApproved: boolean;

    @Column({ name: 'IS_ACCOUNT_ACTIVE' })
    public isAccountActive: boolean;

    @Column({ name: 'CREATED_DATE' })
    public accountCreationDate: string;

    @Column({ name: 'UPDATED_DATE' })
    public accountUpdatedDate: string;

    @ManyToOne(() => RoleEntity, (role) => role.id, { eager: true })
    @JoinColumn({ name: 'USER_ROLE_ID' })
    public role: RoleEntity;

    @OneToMany(() => PartRequsetEntity, (partRequest) => partRequest.id, { eager: false })
    public partsRequest: PartRequsetEntity[];

    @OneToMany(() => PartBidRequestEntity, (partBidRequest) => partBidRequest.id, { eager: false })
    public partBidsRequest: PartBidRequestEntity[];

    @BeforeInsert()
    public emailToLowerCase() {
        this.email = this.email.toLowerCase();
    }
}
