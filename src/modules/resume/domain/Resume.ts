import { v4 as uuidv4 } from 'uuid';
import { DocumentChunk } from './DocumentChunk';

export class Resume {
  public readonly id: string;
  public readonly createdAt: Date;
  private chunks: DocumentChunk[] = [];

  constructor(
    public readonly filename: string,
    id?: string,
    createdAt?: Date,
  ) {
    this.id = id ?? uuidv4();
    this.createdAt = createdAt ?? new Date();
  }

  addChunks(chunks: DocumentChunk[]) {
    chunks.forEach((chunk) => chunk.setResumeId(this.id));
    this.chunks.push(...chunks);
  }

  getChunks(): DocumentChunk[] {
    return this.chunks;
  }

  getId(): string {
    return this.id;
  }
}
