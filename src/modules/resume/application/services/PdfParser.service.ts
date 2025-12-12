export interface PdfParserService {
  parse(buffer: Buffer): Promise<string[]>;
}
