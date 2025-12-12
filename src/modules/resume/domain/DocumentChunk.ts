export class DocumentChunk {
  constructor(
    public content: string,
    public metadata: Record<string, any> = {},
    public embedding?: number[],
    public score?: number,
  ) {}
}