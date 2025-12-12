import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { LOG_TYPE } from '../../domain/repositories/Log.repository';

@Entity('log')
export class LogModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  process: string;

  @Column('text')
  log: string;

  @Column('text')
  props: string;

  @Column({ type: 'text', nullable: true })
  result: string | null;

  @Column({
    type: 'enum',
    enum: LOG_TYPE,
  })
  type: LOG_TYPE;
}
