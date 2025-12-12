import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { VectorStoreRepository } from '../../domain/repository/VectorStore.repository';
import type { GeminiService } from '../services/Gemini.service';

@Injectable()
export class ChatResumeUseCase {
  constructor(
    @Inject('GeminiService')
    private readonly geminiService: GeminiService,
    @Inject('VectorStoreRepository')
    private readonly vectorStoreRepository: VectorStoreRepository,
  ) {}

  async execute(resumeId: string, question: string) {
    const queryVector =
      await this.geminiService.generateQueryEmbedding(question);

    const similarDocs = await this.vectorStoreRepository.search(
      queryVector,
      4,
      resumeId,
    );

    if (similarDocs.length === 0) {
      return {
        answer:
          'Não encontrei informações sobre este currículo. Verifique se o ID está correto ou se o arquivo foi processado.',
        sources: [],
      };
    }

    const contextText = similarDocs
      .map((doc) => doc.content)
      .join('\n\n---\n\n');

    const answer = await this.geminiService.chatWithResume(
      question,
      contextText,
    );

    return {
      question,
      answer,
      sources: similarDocs.map((d) => ({
        content: d.content.substring(0, 100) + '...',
        score: d.score?.toFixed(4),
      })),
    };
  }
}
