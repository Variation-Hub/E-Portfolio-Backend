import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Unit } from './Unit.entity';

@Entity('course')
export class Course {
    @PrimaryGeneratedColumn()
    course_id: number;

    @OneToMany(() => Unit, unit => unit.course_id)
    units: Unit[];

    @Column({ type: 'varchar' })
    title: string;

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

    @Column({ type: 'text' })
    brand_guidelines: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
