import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Unit } from './Unit.entity';
import { User } from './User.entity';
import { Learner } from './Learner.entity';

@Entity('course')
export class Course {
    @PrimaryGeneratedColumn()
    course_id: number;

    @OneToMany(() => Unit, unit => unit.course_id)
    units: Unit[];

    @Column({ type: 'varchar' })
    course_name: string;

    @Column({ type: 'varchar' })
    course_code: string;

    @Column({ type: 'varchar' })
    level: string;

    @Column({ type: 'varchar' })
    sector: string;

    @Column({ type: 'varchar' })
    internal_external: string;

    @Column({ type: 'varchar' })
    qualification_type: string;

    @Column({ type: 'varchar' })
    assessment_language: string;

    @Column({ type: 'varchar' })
    recommended_minimum_age: string;

    @Column({ type: 'varchar' })
    total_credits: string;

    @Column({ type: 'varchar' })
    operational_start_date: string;

    @Column({ type: 'varchar' })
    assessment_methods: string;

    @Column({ type: 'varchar' })
    guided_learning_hours: string;

    @Column({ type: 'text' })
    brand_guidelines: string;

    @Column({ type: 'varchar', nullable: true })
    qualification_status: string;

    @Column({ type: 'varchar', nullable: true })
    overall_grading_type: string;

    @Column({ type: 'varchar', nullable: true })
    permitted_delivery_types: string;

    @ManyToMany(() => Learner, learner => learner.courses, { nullable: true })
    @JoinTable()
    learners: Learner[];

    // @ManyToOne(() => User, user => user.course, { nullable: true })
    // trainer: User;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
