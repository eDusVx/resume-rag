import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
import { DocumentChunk } from 'src/modules/resume/domain/DocumentChunk';
import { VectorStoreRepository } from '../../domain/repository/VectorStore.repository';

@Injectable()
export class VectorStoreRepositoryImpl implements VectorStoreRepository, OnModuleInit {
  private vectorDb: DocumentChunk[] = [];
  private readonly dbPath = path.resolve(process.cwd(), 'database.json');

  async onModuleInit() {
    if (existsSync(this.dbPath)) {
      const rawData = await fs.readFile(this.dbPath, 'utf-8');
      this.vectorDb = JSON.parse(rawData);
    }
  }

  async save(chunks: DocumentChunk[]): Promise<void> {
    this.vectorDb.push(...chunks);
    await fs.writeFile(this.dbPath, JSON.stringify(this.vectorDb, null, 2));
  }

  async search(queryVector: number[], limit: number = 4, filter?: { resumeId: string }): Promise<DocumentChunk[]> {
    let candidates = this.vectorDb;
    
    if (filter?.resumeId) {
        candidates = this.vectorDb.filter(doc => doc.metadata?.resumeId === filter.resumeId);
    }

    if (candidates.length === 0) return [];

    const ranking = candidates.map((doc) => {
      const score = this.cosineSimilarity(queryVector, doc.embedding!);
      return { ...doc, score };
    });

    return ranking
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => new DocumentChunk(r.content, r.metadata, r.embedding, r.score)); 
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (normA * normB);
  }
}