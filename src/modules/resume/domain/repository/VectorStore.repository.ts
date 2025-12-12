import { DocumentChunk } from "../DocumentChunk";

export interface VectorStoreRepository {
  save(chunks: DocumentChunk[]): Promise<void>;
  search(queryVector: number[], limit?: number, minScore?: number): Promise<DocumentChunk[]>;
}