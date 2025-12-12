import { Injectable, BadRequestException } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PdfParserService } from 'src/modules/resume/application/services/PdfParser.service';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

@Injectable()
export class PdfParserServiceImpl implements PdfParserService {
  
  async parse(buffer: Buffer): Promise<string[]> {
    try {
      const blob = new Blob([new Uint8Array(buffer)]);

      const loader = new PDFLoader(blob, {
        splitPages: false, 
      });

      const docs = await loader.load();
      
      if (docs.length === 0 || !docs[0].pageContent.trim()) {
        throw new BadRequestException('PDF vazio.');
      }

      const cleanText = docs[0].pageContent.replace(/\n\n+/g, '\n');

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 100,
      });

      const splitDocs = await splitter.createDocuments([cleanText]);
      
      return splitDocs.map((d) => d.pageContent);

    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Falha ao processar o PDF.');
    }
  }
}