import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentChunk } from '../../domain/DocumentChunk';
import { VectorStoreRepository } from '../../domain/repository/VectorStore.repository';
import { DocumentChunkEntity } from '../models/DocumentChunk.model';
import { ResumeEntity } from '../models/Resume.model';
import { ResumeSummary } from '../../domain/dto/ResumeSummary.dto';
import { Resume } from '../../domain/Resume';

@Injectable()
export class VectorStoreRepositoryImpl implements VectorStoreRepository {
  constructor(
    @InjectRepository(DocumentChunkEntity)
    private readonly chunkRepo: Repository<DocumentChunkEntity>,
    @InjectRepository(ResumeEntity)
    private readonly resumeRepo: Repository<ResumeEntity>,
  ) {}

  async save(resumeDomain: Resume): Promise<void> {
    await this.resumeRepo.save({
      id: resumeDomain.id,
      filename: resumeDomain.filename,
      createdAt: resumeDomain.createdAt,
    });

    const chunksDomain = resumeDomain.getChunks();

    if (chunksDomain.length > 0) {
      const entities = chunksDomain.map((c) => {
        return this.chunkRepo.create({
          id: c.id,
          content: c.content,
          metadata: c.metadata,
          resumeId: resumeDomain.getId(),
          embedding: c.embedding as any,
        });
      });

      await this.chunkRepo.save(entities);
    }
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
        .select('chunk.id', 'id')
        .addSelect('chunk.content', 'content')
        .addSelect('chunk.metadata', 'metadata')
        .addSelect('chunk.resumeId', 'resumeId')
        .addSelect(`1 - (chunk.embedding <=> '${vectorStr}')`, 'score')
        .where('chunk.resumeId = :resumeId', { resumeId: resumeId })
        .orderBy('score', 'DESC')
        .limit(limit)
        .getRawMany<{
          id: string;
          content: string;
          metadata: any;
          resumeId: string;
          score: number;
        }>();

      return results.map(
        (r) =>
          new DocumentChunk(
            r.content,
            r.metadata,
            [],
            r.score,
            r.id,
            r.resumeId,
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
