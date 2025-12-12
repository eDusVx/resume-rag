import { DocumentChunk } from "../DocumentChunk";

export interface VectorStoreRepository {
  save(chunks: DocumentChunk[], filename?: string): Promise<void>;
  search(queryVector: number[], limit: number, resumeId: string ): Promise<DocumentChunk[]>;
}