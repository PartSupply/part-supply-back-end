import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'USER_ROLE' })
export class RoleEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'ID' })
    public id: number;

    @OneToMany(() => UserEntity, (user) => user.id)
    @Column({ name: 'ROLE_NAME' })
    public roleName: string;
}
