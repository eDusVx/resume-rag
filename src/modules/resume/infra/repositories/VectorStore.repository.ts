import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentChunk } from '../../domain/DocumentChunk';
import { VectorStoreRepository } from '../../domain/repository/VectorStore.repository';
import { DocumentChunkEntity } from '../models/DocumentChunk.model';
import { ResumeEntity } from '../models/Resume.model';
import { ResumeSummary } from '../../domain/dto/ResumeSummary.dto';

@Injectable()
export class VectorStoreRepositoryImpl implements VectorStoreRepository {
  constructor(
    @InjectRepository(DocumentChunkEntity)
    private readonly chunkRepo: Repository<DocumentChunkEntity>,
    @InjectRepository(ResumeEntity)
    private readonly resumeRepo: Repository<ResumeEntity>,
  ) {}

  async save(chunks: DocumentChunk[], filename?: string): Promise<void> {
    if (!chunks.length) return;
    const resumeId = chunks[0].getResumeId();

    await this.resumeRepo.save({ id: resumeId, filename: filename });

    const entities = chunks.map((c) => {
      return this.chunkRepo.create({
        id: c.id,
        content: c.content,
        metadata: c.metadata,
        resumeId: resumeId,
        embedding: c.embedding as any,
      });
    });

    await this.chunkRepo.save(entities);
  }

  async search(
    queryVector: number[],
    limit: number,
    resumeId: string,
  ): Promise<DocumentChunk[]> {
    const vectorStr = `[${queryVector.join(',')}]`;

    try {
      const results = await this.chunkRepo
        .createQueryBuilder('chunk')
        .select([
          'chunk.id',
          'chunk.content',
          'chunk.metadata',
          'chunk.resumeId',
        ])
        .addSelect(`1 - (chunk.embedding <=> '${vectorStr}')`, 'score')
        .where('chunk.resumeId = :resumeId', { resumeId: resumeId })
        .orderBy('score', 'DESC')
        .limit(limit)
        .getRawMany();

      return results.map(
        (r) =>
          new DocumentChunk(
            r.chunk_content,
            r.chunk_metadata,
            [],
            r.score,
            r.chunk_id,
            r.chunk_resumeId,
          ),
      );
    } catch (error) {
      throw new InternalServerErrorException('Erro na busca vetorial');
    }
  }

  async findAllResumes(): Promise<ResumeSummary[]> {
    const resumes = await this.resumeRepo.find({
      select: {
        id: true,
        filename: true,
        createdAt: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return resumes;
  }
}
