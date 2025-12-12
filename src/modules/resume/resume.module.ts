import { Module } from '@nestjs/common';
import { IngestResumeUseCase } from './application/usecases/IngestResume.usecase';
import { AnalyzeResumeUseCase } from './application/usecases/AnalyseResume.usecase';
import { PdfParserServiceImpl } from './infra/services/PdrParser.service';
import { GeminiServiceImpl } from './infra/services/Gemini.service';
import { VectorStoreRepositoryImpl } from './infra/repositories/VectorStore.repository';
import { ResumeController } from './resume.controller';

@Module({
  controllers: [ResumeController],
  providers: [
    IngestResumeUseCase,
    AnalyzeResumeUseCase,
    { 
        provide: 'PdfParserService', 
        useClass: PdfParserServiceImpl 
    },
    { 
        provide: 'GeminiService', 
        useClass: GeminiServiceImpl 
    },
    { 
        provide: 'VectorStoreRepository', 
        useClass: VectorStoreRepositoryImpl 
    },
  ],
})
export class ResumeModule {}