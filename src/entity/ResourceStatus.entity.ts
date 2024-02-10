import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, OneToOne } from 'typeorm';
import { Resource } from './Resource.entity';
import { User } from './User.entity';

@Entity('resourceStatus')
export class ResourceStatus {
    @PrimaryGeneratedColumn()
    resource_status_id: number;

    @ManyToOne(() => Resource, resource => resource.resourceStatus)
    resource: Resource;

    @OneToOne(() => User)
    @JoinTable()
    user: User;

    @Column({ type: 'timestamp' })
    last_viewed: Date;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
