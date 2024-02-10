import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Course } from './Course.entity';
import { Resource } from './Resource.entity';

@Entity('unit')
export class Unit {
    @PrimaryGeneratedColumn()
    unit_id: number;

    @ManyToOne(() => Course, course => course.units)
    @JoinColumn({ name: 'course_id' })
    course_id: Course;

    @OneToMany(() => Resource, resource => resource.unit_id)
    resources: Resource[];

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

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
