import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai';
import { TaskType } from '@google/generative-ai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { DocumentChunk } from 'src/modules/resume/domain/DocumentChunk';
import { GeminiService } from '../../application/services/Gemini.service';
import { ResumeAnalysisResult } from '../../domain/dto/ResumeAnalysis.dto';
import { z } from 'zod';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class GeminiServiceImpl implements GeminiService {
  private readonly logger = new Logger(GeminiServiceImpl.name);
  private readonly chatModel: ChatGoogleGenerativeAI;
  private readonly embeddingsModel: GoogleGenerativeAIEmbeddings;
  private readonly RESUME_SCHEMA = z.object({
    candidato: z.object({
      nome: z
        .string()
        .describe(
          "Nome completo do candidato. Se não achar, use 'Não identificado'",
        ),
      email: z.string().nullable().describe('Email do candidato ou null'),
      telefone: z.string().nullable().describe('Telefone com DDD ou null'),
      links: z.object({
        linkedin: z.string().nullable(),
        github: z.string().nullable(),
        portfolio: z.string().nullable(),
      }),
      cidade_estado: z
        .string()
        .nullable()
        .describe("Ex: 'São Paulo, SP' ou null"),
    }),
    profissional: z.object({
      resumo: z
        .string()
        .describe('Um parágrafo único e denso resumindo o perfil.'),
      tempo_experiencia_estimado: z
        .string()
        .describe("Ex: '5 anos', calculado baseando-se nas datas."),
      cargo_atual_ou_ultimo: z
        .string()
        .describe('O cargo mais recente encontrado.'),
      empresa_atual_ou_ultima: z.string().describe('A empresa mais recente.'),
    }),
    skills: z.object({
      linguagens: z
        .array(z.string())
        .describe('Apenas linguagens de programação (Java, JS, Go...)'),
      frameworks: z
        .array(z.string())
        .describe('Frameworks e bibliotecas (Spring, React, Nest...)'),
      bancos_de_dados: z
        .array(z.string())
        .describe('Postgres, Mongo, Redis...'),
      cloud_devops: z.array(z.string()).describe('AWS, Docker, K8s, CI/CD...'),
      arquitetura_e_conceitos: z
        .array(z.string())
        .describe('DDD, SOLID, Clean Arch...'),
    }),
    formacao_academica: z
      .array(
        z.object({
          curso: z.string(),
          instituicao: z.string(),
          ano_conclusao: z.string().nullable(),
        }),
      )
      .describe('Lista de graduações ou cursos relevantes'),
    idiomas: z.array(
      z.object({
        idioma: z.string(),
        nivel: z.string(),
      }),
    ),
  });

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('GOOGLE_API_KEY');

    this.chatModel = new ChatGoogleGenerativeAI({
      model: 'models/gemini-flash-latest',
      temperature: 0,
      maxRetries: 2,
      apiKey,
    });

    this.embeddingsModel = new GoogleGenerativeAIEmbeddings({
      modelName: 'text-embedding-004',
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      apiKey,
    });
  }

  async generateEmbeddings(texts: string[]): Promise<DocumentChunk[]> {
    this.logger.debug(
      `Gerando embeddings para ${texts.length} fragmentos de texto...`,
    );

    const BATCH_SIZE = 5;
    const results: DocumentChunk[] = [];

    try {
      for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (text) => {
          const embedding = await this.embeddingsModel.embedQuery(text);
          return new DocumentChunk(text, {}, embedding);
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        if (i + BATCH_SIZE < texts.length) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      this.logger.debug('Embeddings gerados com sucesso.');
      return results;
    } catch (error) {
      this.logger.error('Erro ao gerar embeddings', error);
      throw new InternalServerErrorException(
        'Falha ao processar vetores do currículo.',
      );
    }
  }

  async generateQueryEmbedding(text: string): Promise<number[]> {
    try {
      return await this.embeddingsModel.embedQuery(text);
    } catch (error) {
      this.logger.error(`Erro ao gerar query embedding: ${error.message}`);
      throw new InternalServerErrorException('Erro ao processar sua busca.');
    }
  }

  async analyzeResumeStructure(context: string): Promise<ResumeAnalysisResult> {
    this.logger.debug('Iniciando análise estruturada do currículo...');

    try {
      const parser = StructuredOutputParser.fromZodSchema(this.RESUME_SCHEMA);

      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          `Você é um Recrutador Técnico Sênior e Extrator de Dados (AI Parser).
          
          SUA MISSÃO:
          Analisar o texto do currículo fornecido e extrair dados estruturados com precisão cirúrgica.
          
          REGRAS DE OURO:
          1. Fidelidade: Se a informação não estiver no texto, retorne null ou array vazio. Não alucine.
          2. Formatação: Siga estritamente o schema JSON fornecido.
          3. Normalização: Padronize termos técnicos (ex: "React.js", "ReactJS", "React" -> "ReactJS").
          4. Síntese: No resumo profissional, crie um texto coeso em terceira pessoa.

          {format_instructions}`,
        ],
        ['user', 'Conteúdo do Currículo para análise:\n"""{context}"""'],
      ]);

      const chain = prompt.pipe(this.chatModel).pipe(parser);

      const result = await chain.invoke({
        context,
        format_instructions: parser.getFormatInstructions(),
      });

      this.logger.debug('Análise estruturada concluída com sucesso.');
      return result as unknown as ResumeAnalysisResult;
    } catch (error) {
      this.logger.error(
        'Erro durante a análise estruturada do currículo',
        error,
      );
      throw new InternalServerErrorException(
        'Falha ao analisar o currículo com IA.',
      );
    }
  }

  async chatWithResume(question: string, context: string): Promise<string> {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `Você é um assistente de RH útil e preciso.
        Você está conversando com um recrutador sobre um candidato específico.
        
        CONTEXTO DO CURRÍCULO (Recuperado do Banco de Dados):
        """
        {context}
        """
        
        REGRAS:
        1. Responda à pergunta do usuário APENAS com base no contexto acima.
        2. Se a resposta não estiver no contexto, diga educadamente que o currículo não menciona essa informação.
        3. Seja direto e profissional.
        4. Cite fatos. Se perguntarem "Ele sabe React?", responda "Sim, menciona React em tal projeto" ou "Não menciona explicitamente".`,
      ],
      ['user', '{question}'],
    ]);
    const chain = prompt.pipe(this.chatModel).pipe(new StringOutputParser());

    return await chain.invoke({
      question,
      context,
    });
  }
}
