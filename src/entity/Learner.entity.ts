import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User.entity';
import { Course } from './Course.entity';

@Entity('learner')
export class Learner {
  @PrimaryGeneratedColumn()
  learner_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user_id: User;

  @ManyToMany(() => Course, course => course.learners, { nullable: true })
  @JoinTable()
  courses: Course[];

  @Column({ type: 'varchar' })
  first_name: string;

  @Column({ type: 'varchar' })
  last_name: string;

  @Column({ type: 'varchar' })
  user_name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  mobile: string;

  @Column({ type: 'varchar', nullable: true })
  national_ins_no: string;

  // @Column({ type: 'varchar' })
  // ethnicity: string;

  // @Column({ type: 'varchar', nullable: true })
  // learner_disability: string;

  // @Column({ type: 'varchar', nullable: true })
  // learner_difficulity: string;

  // @Column({ type: 'varchar', nullable: true })
  // Initial_Assessment_Numeracy: string;

  // @Column({ type: 'varchar', nullable: true })
  // Initial_Assessment_Literacy: string;

  // @Column({ type: 'varchar', nullable: true })
  // street: string;

  // @Column({ type: 'varchar', nullable: true })
  // suburb: string;

  // @Column({ type: 'varchar', nullable: true })
  // town: string;

  // @Column({ type: 'varchar', nullable: true })
  // country: string;

  // @Column({ type: 'varchar', nullable: true })
  // home_postcode: string;

  // @Column({ type: 'enum', enum: ["UK", "USA"], default: "UK" })
  // country_of_domicile: string;

  @Column({ type: 'integer', nullable: true })
  employer_id: number;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'varchar', nullable: true })
  funding_body: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
