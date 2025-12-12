import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { GeminiService } from 'src/modules/resume/application/services/Gemini.service';
import type { VectorStoreRepository } from 'src/modules/resume/domain/repository/VectorStore.repository';

@Injectable()
export class AnalyzeResumeUseCase {

  constructor(
    @Inject('GeminiService')
    private readonly geminiService: GeminiService,
    @Inject('VectorStoreRepository')
    private readonly vectorStoreRepository: VectorStoreRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(question: string) {
    const queryVector = await this.geminiService.generateQueryEmbedding(question);

    const minScore = parseFloat(this.configService.get<string>('MIN_SCORE') ?? '0.6');

    const searchLimit = parseInt(this.configService.get<string>('SEARCH_LIMIT') ?? '4', 10);

    const similarDocs = await this.vectorStoreRepository.search(queryVector, searchLimit, minScore);

    if (similarDocs.length === 0) {
      return { answer: "Não encontrei informações relevantes no currículo para responder essa pergunta com precisão." };
    }

    const contextText = similarDocs.map((d) => d.content).join('\n\n---\n\n');

    const answer = await this.geminiService.generateAnswer(question, contextText);

    return {
      question,
      answer,
      sources: similarDocs.map(d => ({ 
        text: d.content.slice(0, 100) + '...', 
        score: d.score?.toFixed(4) 
      }))
    };
  }
}