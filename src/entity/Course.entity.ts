import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Unit } from './Unit.entity';

@Entity('course')
export class Course {
    @PrimaryGeneratedColumn()
    course_id: number;

    @OneToMany(() => Unit, unit => unit.course_id)
    units: Unit[];

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    course_code: string;

    @Column({ type: 'varchar' })
    level: string;

    @Column({ type: 'varchar' })
    discription: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
