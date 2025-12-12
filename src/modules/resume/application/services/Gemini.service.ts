import { DocumentChunk } from "../../domain/DocumentChunk";

export interface GeminiService {
  generateEmbeddings(texts: string[]): Promise<DocumentChunk[]>;
  generateQueryEmbedding(text: string): Promise<number[]>;
  generateAnswer(question: string, context: string): Promise<string>;
}