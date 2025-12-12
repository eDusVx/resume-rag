import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid'; 
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

  async execute(buffer: Buffer, fileName: string) {
    const resumeId = uuidv4();

    const rawTexts = await this.pdfParserService.parse(buffer);

    const chunks = await this.geminiService.generateEmbeddings(rawTexts);

    chunks.forEach(chunk => chunk.setResumeId(resumeId));

    await this.vectorStoreRepository.save(chunks, fileName);

    return {
      message: 'Currículo processado e indexado com sucesso.',
      id: resumeId,
      chunks_count: chunks.length,
    };
  }
}