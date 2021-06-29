import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'USER' })
@Unique(['id', 'userGuid'])
export class UserEntiry extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'USER_GUID' })
  userGuid: string;

  @Column({ name: 'USER_EMAIL' })
  userEmail: string;

  @Column({ name: 'PASSWORD' })
  userPassword: string;
}
