import { DocumentChunk } from "../../domain/DocumentChunk";
import { ResumeAnalysisResult } from "../../domain/dto/ResumeAnalysis.dto";

export interface GeminiService {
  generateEmbeddings(texts: string[]): Promise<DocumentChunk[]>;
  generateQueryEmbedding(text: string): Promise<number[]>;
  analyzeResumeStructure(context: string): Promise<ResumeAnalysisResult>;
}