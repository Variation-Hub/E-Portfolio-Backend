import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Learner } from './Learner.entity';
import { User } from './User.entity';


@Entity('user_course')
export class UserCourse {
    @PrimaryGeneratedColumn()
    user_course_id: number;

    @ManyToOne(() => Learner)
    @JoinColumn({ name: 'learner_id', referencedColumnName: 'learner_id' })
    learner_id: Learner;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'trainer_id', referencedColumnName: 'user_id' })
    trainer_id: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'IQA_id', referencedColumnName: 'user_id' })
    IQA_id: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'EQA_id', referencedColumnName: 'user_id' })
    EQA_id: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'employer_id', referencedColumnName: 'user_id' })
    employer_id: User;

    @Column({ type: 'json', nullable: false })
    course: Object;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
