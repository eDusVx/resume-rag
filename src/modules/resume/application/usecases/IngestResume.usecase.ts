import { Inject, Injectable } from '@nestjs/common';
import type { VectorStoreRepository } from 'src/modules/resume/domain/repository/VectorStore.repository';
import type { GeminiService } from '../services/Gemini.service';
import type { PdfParserService } from '../services/PdfParser.service';
@Injectable()
export class IngestResumeUseCase {
  constructor(
    @Inject('PdfParserService')
    private readonly pdfParserService: PdfParserService,
    @Inject('GeminiService')
    private readonly geminiService: GeminiService,
    @Inject('VectorStoreRepository')
    private readonly vectorStoreRepository: VectorStoreRepository,
  ) {}

  async execute(buffer: Buffer) {
    const rawTexts = await this.pdfParserService.parse(buffer);

    const chunksWithEmbeddings = await this.geminiService.generateEmbeddings(rawTexts);

    await this.vectorStoreRepository.save(chunksWithEmbeddings);

    return {
      message: 'Currículo processado e indexado com sucesso.',
      chunks: chunksWithEmbeddings.length,
    };
  }
}