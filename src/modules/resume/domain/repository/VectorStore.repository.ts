import { DocumentChunk } from '../DocumentChunk';
import { ResumeSummary } from '../dto/ResumeSummary.dto';
import { Resume } from '../Resume';

export interface VectorStoreRepository {
  save(resume: Resume): Promise<void>;
  search(
    queryVector: number[],
    limit: number,
    resumeId: string,
  ): Promise<DocumentChunk[]>;
  findAllResumes(): Promise<ResumeSummary[]>;
}
