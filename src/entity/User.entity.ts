import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Course } from './Course.entity';

@Entity('users')
export class User {
  toObject() {
    throw new Error('Method not implemented.');
  }

  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', nullable: true })
  user_name: string;

  @Column({ type: 'varchar', nullable: true })
  first_name: string;

  @Column({ type: 'varchar', nullable: true })
  last_name: string;

  // @ManyToOne(() => Course, course => course.trainer, { nullable: true })
  // course: Course;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  mobile: string;

  @Column({ type: 'enum', enum: ["Learner", "Trainer", "Employer", "IQA", "EQA", "Admin"], default: "Learner" })
  role: string;

  @Column({ type: 'json', nullable: true })
  avatar: object;

  @Column({ type: 'boolean', default: false })
  password_changed: boolean;

  @Column({ type: 'varchar', nullable: true })
  time_zone: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

export interface IUser {
  user_id: number;
  user_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  password: string;
  sso_id?: string | null;
  mobile?: string | null;
  phone?: string | null;
  role: "Learner" | "Trainer" | "Employer" | "IQA" | "EQA" | "Admin";
  avatar?: object | null;
  password_changed: boolean;
  created_at: Date;
  updated_at: Date;
}
