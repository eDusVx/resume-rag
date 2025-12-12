import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngestResumeUseCase } from './application/usecases/IngestResume.usecase';
import { AnalyzeResumeUseCase } from './application/usecases/AnalyseResume.usecase';

@Controller('resume')
export class ResumeController {
  constructor(
    private readonly ingestUseCase: IngestResumeUseCase,
    private readonly analyzeUseCase: AnalyzeResumeUseCase,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file || file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Arquivo inválido. Envie um PDF.');
    }
    return await this.ingestUseCase.execute(file.buffer);
  }

  @Post('chat')
  async analyze(@Body('question') question: string) {
    if (!question) throw new BadRequestException('Pergunta obrigatória.');
    return await this.analyzeUseCase.execute(question);
  }
}