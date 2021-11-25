import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type Nullable<T> = T | null;
@Entity({ name: 'QUESTION_ANSWER' })
export class QuestionAnswerEntity extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'ID' })
    public id: number;

    @Column({ name: 'QUESTION', length: 3000 })
    public question: string;

    @Column({ name: 'ANSWER', length: 3000 })
    public answer: string;

    @Column({ name: 'BUYER_ID' })
    public buyerId: number;

    @Column({ name: 'SELLER_ID' })
    public sellerId: number;

    @Column({ name: 'PART_REQUEST_ID' })
    public partRequestId: number;

    @Column({ name: 'PART_BID_ID', nullable: true })
    public partBidId: number;

    @Column({ name: 'IS_ANSWER' })
    public isAnswered: boolean;
}
