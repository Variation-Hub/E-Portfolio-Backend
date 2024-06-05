import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.entity';

enum CompletionStatus {
  NOT_STARTED = "Not Started",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed"
}

interface Activity {
  date: Date;
  learning_objective: string;
  activity: string;
  comment: string;
  support_you: string;
  timeTake: {
    day: number;
    hours: number;
    minutes: number;
  };
  completed: CompletionStatus;
  files: Record<string, any>;
}


@Entity('cpd')
export class CPD {
  toObject() {
    throw new Error('Method not implemented.');
  }

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user_id: User;

  @Column({ type: 'varchar' })
  year: string;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ type: 'varchar' })
  cpd_plan: string;

  @Column({ type: 'enum', enum: [1, 2, 3, 4, 5] })
  impact_on_you: number;

  @Column({ type: 'enum', enum: [1, 2, 3, 4, 5] })
  impact_on_colleagues: number;

  @Column({ type: 'enum', enum: [1, 2, 3, 4, 5] })
  impact_on_managers: number;

  @Column({ type: 'enum', enum: [1, 2, 3, 4, 5] })
  impact_on_organisation: number;

  @Column({
    type: "json",
    default: () => "'{}'",
  })
  activity: Activity;

  @Column({
    type: "json",
    default: () => "'{}'",
  })
  evaluation: {
    learning_objective: string,
    completed: CompletionStatus,
    example_of_learning: string,
    support_you: string,
    feedback: string,
    files: Object
  };

  @Column({
    type: "json",
    default: () => "'{}'",
  })
  reflection: {
    learning_objective: string,
    what_went_well: string,
    differently_next_time: string,
    feedback: string,
    files: Object
  };

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
