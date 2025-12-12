import { Inject, Injectable } from '@nestjs/common';
import type { GeminiService } from '../services/Gemini.service';
import type { VectorStoreRepository } from 'src/modules/resume/domain/repository/VectorStore.repository';

@Injectable()
export class AnalyzeResumeUseCase {
  constructor(
    @Inject('GeminiService') private readonly geminiService: GeminiService,
    @Inject('VectorStoreRepository') private readonly vectorStoreRepository: VectorStoreRepository,
  ) {}

  async execute(resumeId: string) {
    const genericQuery = "Resumo profissional skills nome experiência";
    const queryVector = await this.geminiService.generateQueryEmbedding(genericQuery);

    const similarDocs = await this.vectorStoreRepository.search(queryVector, 10, { resumeId });

    if (similarDocs.length === 0) {
      throw new Error("Currículo não encontrado ou ID inválido.");
    }

    const contextText = similarDocs.map((d) => d.content).join('\n\n---\n\n');
    
    return await this.geminiService.analyzeResumeStructure(contextText);
  }
}