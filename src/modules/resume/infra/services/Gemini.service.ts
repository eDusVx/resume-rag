import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { TaskType } from '@google/generative-ai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { DocumentChunk } from 'src/modules/resume/domain/DocumentChunk';
import { GeminiService } from '../../application/services/Gemini.service';

@Injectable()
export class GeminiServiceImpl implements GeminiService {
  private chatModel: ChatGoogleGenerativeAI;
  private embeddingsModel: GoogleGenerativeAIEmbeddings;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    
    this.chatModel = new ChatGoogleGenerativeAI({
      model: 'models/gemini-flash-latest',
      temperature: 0,
      apiKey,
    });

    this.embeddingsModel = new GoogleGenerativeAIEmbeddings({
      modelName: 'text-embedding-004',
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      apiKey,
    });
  }

  async generateEmbeddings(texts: string[]): Promise<DocumentChunk[]> {
    const results: DocumentChunk[] = [];
    for (const text of texts) {
        await new Promise(r => setTimeout(r, 1000)); 
        const embedding = await this.embeddingsModel.embedQuery(text);
        results.push(new DocumentChunk(text, {}, embedding));
    }
    return results;
  }

  async generateQueryEmbedding(text: string): Promise<number[]> {
    return await this.embeddingsModel.embedQuery(text);
  }

  async generateAnswer(question: string, context: string): Promise<string> {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `Você é um assistente de RH Sênior analisando um currículo.
        
        REGRAS DE OURO:
        1. Responda baseando-se APENAS no contexto abaixo.
        2. Se a resposta não estiver no texto, diga: "Não encontrei essa informação no documento".
        3. Formate a resposta em Markdown para facilitar a leitura.
        
        CONTEXTO DO CURRÍCULO:
        """
        {context}
        """`
      ],
      ['user', '{input}'],
    ]);

    const chain = prompt.pipe(this.chatModel).pipe(new StringOutputParser());

    return await chain.invoke({ 
      context, 
      input: question 
    });
  }
}