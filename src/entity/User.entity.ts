import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  toObject() {
    throw new Error('Method not implemented.');
  }

  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', nullable: true })
  user_name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  ssoid: string;

  @Column({ type: 'enum', enum: ["Learner", "Trainer", "Employer", "IQA", "EQA", "Admin"], default: "Learner" })
  role: string;

  @Column({ type: 'json', nullable: true })
  avatar: object;

  @Column({ type: 'boolean', default: false })
  password_changed: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

export interface IUser {
  user_id: number;
  user_name?: string | null;
  email: string;
  password: string;
  ssoid?: string | null;
  role: "Learner" | "Trainer" | "Employer" | "IQA" | "EQA" | "Admin";
  avatar?: string | null;
  created_at: Date;
  updated_at: Date;
}
