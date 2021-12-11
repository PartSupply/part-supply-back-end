import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'OTP' })
export class OtpEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'ID' })
    public id: number;

    @Column({ name: 'USER_ID' })
    public userId: number;

    @Column({ name: 'ONE_TIME_CODE' })
    public oneTimeCode: number;

    @CreateDateColumn({ name: 'PART_OFFER_CREATED_DATE' })
    public createdDate: Date;

    @UpdateDateColumn({ name: 'PART_OFFER_UPDATED_DATE' })
    public updatedDate: Date;
}
