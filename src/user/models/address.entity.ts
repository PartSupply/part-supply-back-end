import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'ADDRESS' })
export class AddressEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'ID' })
    public id: string;

    @Column({ name: 'ADDRESS_LINE_1' })
    public addressLineOne: string;

    @Column({ name: 'CITY' })
    public city: string;

    @Column({ name: 'STATE' })
    public state: string;

    @Column({ name: 'ZIPCODE' })
    public zipCode: string;

    @Column({ name: 'COUNTRY' })
    public country: string;

    @OneToOne(() => UserEntity)
    public user: UserEntity;
}
