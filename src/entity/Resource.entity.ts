import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Unit } from './Unit.entity';
import { ResourceStatus } from './ResourceStatus.entity';

@Entity('resource')
export class Resource {
    @PrimaryGeneratedColumn()
    resource_id: number;

    @ManyToOne(() => Unit, unit => unit.resources)
    @JoinColumn({ name: 'unit_id' })
    unit_id: Unit;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    discription: string;

    @Column({ type: 'varchar' })
    size: string;

    @Column({ type: 'json' })
    url: object;

    @OneToMany(() => ResourceStatus, resourceStatus => resourceStatus.resource)
    resourceStatus: ResourceStatus[];

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
