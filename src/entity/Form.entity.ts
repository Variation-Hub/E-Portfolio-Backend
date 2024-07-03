import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User.entity';

export enum FormType {
    ILP = "ILP",
    Review = "Review",
    Enrolment = "Enrolment",
    Survey = "Survey",
    Workbook = "Workbook",
    Test_Exams = "Test/Exams",
    Other = "Other",
}

@Entity('form')
export class Form {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', nullable: true })
    form_name: string;

    @Column({ type: 'varchar', nullable: true })
    description: string;

    @Column({ type: 'json' })
    form_data: object;

    @Column({ type: 'enum', enum: FormType, nullable: true })
    type: FormType;

    @Column({ type: 'boolean', default: false })
    admin_Form: boolean;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
    user_id: User;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
