import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngestResumeUseCase } from './application/usecases/IngestResume.usecase';
import { AnalyzeResumeUseCase } from './application/usecases/AnalyseResume.usecase';

@Controller('resume')
export class ResumeController {
  constructor(
    private readonly ingestUseCase: IngestResumeUseCase,
    private readonly analyzeUseCase: AnalyzeResumeUseCase,
  ) {}

  @Post('injest')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file || file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Arquivo inválido. Envie um PDF.');
    }
    return await this.ingestUseCase.execute(file.buffer);
  }

  @Get('analyze')
  async analyze(@Query('id') id: string) {
    if (!id) {
        throw new BadRequestException('O ID do currículo é obrigatório (ex: ?id=uuid)');
    }
    return await this.analyzeUseCase.execute(id);
  }
}