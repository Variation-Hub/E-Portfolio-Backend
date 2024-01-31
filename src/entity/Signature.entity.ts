import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('signature')
export class Signature {
    @PrimaryGeneratedColumn()
    signature_id: number;

    @Column({ type: 'varchar' })
    user_id: string;

    @Column({ type: 'varchar' })
    evidence_id: string;

    @Column({ type: 'varchar' })
    signature_request_id: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
