import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User.entity';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    notification_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
    user_id: User;

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'varchar' })
    message: string;

    @Column({ type: 'boolean', default: false })
    read: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
