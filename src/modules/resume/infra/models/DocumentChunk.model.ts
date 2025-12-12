import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { ResumeEntity } from './Resume.model';
@Entity('document_chunks')
export class DocumentChunkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'vector', nullable: true })
  embedding: number[]; 

  @Column()
  resumeId: string;

  @ManyToOne(() => ResumeEntity, (resume) => resume.chunks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resumeId' })
  resume: ResumeEntity;
}