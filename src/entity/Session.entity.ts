import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.entity';
import { Learner } from './Learner.entity';


export enum SupportStatus {
    Pending = 'Pending',
    InProgress = 'InProgress',
    Reject = 'Reject',
    Resolve = 'Resolve',
}

@Entity('session')
export class Session {
    @PrimaryGeneratedColumn()
    session_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'trainer_id', referencedColumnName: 'user_id' })
    trainer_id: User;

    @ManyToOne(() => Learner)
    @JoinColumn({ name: 'learner_id', referencedColumnName: 'learner_id' })
    learner_id: Learner;

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'varchar' })
    description: string;

    @Column({
        type: 'enum',
        enum: SupportStatus,
        default: SupportStatus.Pending
    })
    status: SupportStatus;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
