import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'USER_SESSION_ENTITY' })
export class UserSessionEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'ID' })
    public id: number;

    @Column({ name: 'USER_GUID' })
    public userGuid: string;

    @Column({ name: 'TOKEN', length: '1000' })
    public token: string;

    @Column({ name: 'DATE_TIME' })
    public dateTime: string;
}
