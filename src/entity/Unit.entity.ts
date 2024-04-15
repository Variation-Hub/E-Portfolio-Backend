import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Course } from './Course.entity';
import { Resource } from './Resource.entity';

interface PetaUnit {
    peta_unit_id: string;
    name: string;
    status: 'pending' | 'Inprogress' | 'complete';
}

interface SubUnit {
    sub_unit_id: string;
    name: string;
    peta_unit: PetaUnit[];
}

@Entity('unit')
export class Unit {
    @PrimaryGeneratedColumn()
    unit_id: number;

    @ManyToOne(() => Course, course => course.units)
    @JoinColumn({ name: 'course_id' })
    course_id: Course;

    @Column({ type: 'varchar', nullable: true })
    title: string;

    @Column({ type: 'numeric', nullable: true })
    level: number;

    @Column({ type: 'numeric', nullable: true })
    glh: number;

    @Column({ type: 'enum', enum: ["Mandatory", "Optional"], default: "Mandatory" })
    status: string;

    @Column({ type: 'varchar', nullable: true })
    unit_ref: string;

    @Column({ type: 'numeric', nullable: true })
    credit_value: number;

    @Column({ type: 'json', nullable: true })
    sub_units: SubUnit[]

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
