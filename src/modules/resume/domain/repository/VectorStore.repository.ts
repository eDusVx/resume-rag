import { DocumentChunk } from '../DocumentChunk';
import { ResumeSummary } from '../dto/ResumeSummary.dto';

export interface VectorStoreRepository {
  save(chunks: DocumentChunk[], filename?: string): Promise<void>;
  search(
    queryVector: number[],
    limit: number,
    resumeId: string,
  ): Promise<DocumentChunk[]>;
  findAllResumes(): Promise<ResumeSummary[]>;
}
