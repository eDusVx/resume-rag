import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Query,
  Body,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngestResumeUseCase } from './application/usecases/IngestResume.usecase';
import { AnalyzeResumeUseCase } from './application/usecases/AnalyseResume.usecase';
import { ChatResumeUseCase } from './application/usecases/ChatResume.usecase';
import { ChatResumeDto } from './domain/dto/ChatResume.dto';
import { ListResumeQuery } from './application/queries/ListResume.query';

@Controller('resume')
export class ResumeController {
  constructor(
    private readonly ingestUseCase: IngestResumeUseCase,
    private readonly analyzeUseCase: AnalyzeResumeUseCase,
    private readonly chatResumeUseCase: ChatResumeUseCase,
    private readonly listResumesQuery: ListResumeQuery,
  ) {}

  @Post('ingest')
  @UseInterceptors(FileInterceptor('file'))
  async IngestResumeUseCase(@UploadedFile() file: Express.Multer.File) {
    if (!file || file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Arquivo inválido. Envie um PDF.');
    }
    return await this.ingestUseCase.execute(file.buffer, file.originalname);
  }

  @Get('analyze')
  async AnalyseResumeUseCase(@Query('id') id: string) {
    if (!id) {
      throw new BadRequestException(
        'O ID do currículo é obrigatório (ex: ?id=uuid)',
      );
    }
    return await this.analyzeUseCase.execute(id);
  }

  @Post(':id/chat')
  async ChatResumeUseCase(@Param('id') id: string, @Body() requestBody: ChatResumeDto) {
    if (!id) throw new BadRequestException('ID do currículo é obrigatório.');

    return await this.chatResumeUseCase.execute(id, requestBody.question);
  }

  @Get()
  async ListResumesQuery() {
    return await this.listResumesQuery.execute();
  }
}
