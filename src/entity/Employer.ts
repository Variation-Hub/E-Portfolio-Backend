// employer.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('employer')
export class Employer {
  @PrimaryGeneratedColumn()
  employer_id: number;

  @Column({ type: 'varchar' })
  job_title: string;

  @Column({ type: 'varchar' })
  location: string;

  @Column({ type: 'varchar' })
  manager_name: string;

  @Column({ type: 'varchar' })
  manager_job_title: string;

  @Column({ type: 'varchar' })
  mentor: string;

  @Column({ type: 'varchar' })
  funding_contractor: string;

  @Column({ type: 'varchar' })
  area: string;

  @Column({ type: 'varchar' })
  cohort: string;

  @Column({ type: 'numeric' }) // Adjust the data type based on your needs
  wage: number;

  @Column({ type: 'enum', enum: ['per_hour', 'per_annum'] })
  wage_type: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
