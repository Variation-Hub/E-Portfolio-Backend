import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('resourceStatus')
export class ResourceStatus {
    @PrimaryGeneratedColumn()
    resource_status_id: number;

    @Column({ type: 'varchar' })
    unit_id: string;

    @Column({ type: 'varchar' })
    resource_id: string;

    @Column({ type: 'varchar' })
    last_viewed: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
