import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { DocumentChunkEntity } from './DocumentChunk.model';

@Entity('resumes')
export class ResumeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  filename: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => DocumentChunkEntity, (chunk) => chunk.resume)
  chunks: DocumentChunkEntity[];
}
