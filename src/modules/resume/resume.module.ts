import { Module } from '@nestjs/common';
import { IngestResumeUseCase } from './application/usecases/IngestResume.usecase';
import { AnalyzeResumeUseCase } from './application/usecases/AnalyseResume.usecase';
import { PdfParserServiceImpl } from './infra/services/PdrParser.service';
import { GeminiServiceImpl } from './infra/services/Gemini.service';
import { VectorStoreRepositoryImpl } from './infra/repositories/VectorStore.repository';
import { ResumeController } from './resume.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumeEntity } from './infra/models/Resume.model';
import { DocumentChunkEntity } from './infra/models/DocumentChunk.model';
import { ChatResumeUseCase } from './application/usecases/ChatResume.usecase';
import { ListResumeQuery } from './application/queries/ListResume.query';

@Module({
  imports: [TypeOrmModule.forFeature([ResumeEntity, DocumentChunkEntity])],
  controllers: [ResumeController],
  providers: [
    IngestResumeUseCase,
    AnalyzeResumeUseCase,
    ChatResumeUseCase,
    ListResumeQuery,
    {
      provide: 'PdfParserService',
      useClass: PdfParserServiceImpl,
    },
    {
      provide: 'GeminiService',
      useClass: GeminiServiceImpl,
    },
    {
      provide: 'VectorStoreRepository',
      useClass: VectorStoreRepositoryImpl,
    },
  ],
})
export class ResumeModule {}
