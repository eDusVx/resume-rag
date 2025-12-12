import { Inject, Injectable } from '@nestjs/common';
import type { VectorStoreRepository } from '../../domain/repository/VectorStore.repository';

@Injectable()
export class ListResumeQuery {
  constructor(
    @Inject('VectorStoreRepository')
    private readonly vectorStoreRepository: VectorStoreRepository,
  ) {}

  async execute() {
    return await this.vectorStoreRepository.findAllResumes();
  }
}
