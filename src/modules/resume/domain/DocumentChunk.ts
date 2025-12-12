import { v4 as uuidv4 } from 'uuid';

export class DocumentChunk {
  public readonly id: string;

  constructor(
    public content: string,
    public metadata: Record<string, any> = {},
    public embedding?: number[],
    public score?: number,
    id?: string,
    private resumeId?: string
  ) {
    this.id = id ?? uuidv4();
  }

  setResumeId(resumeId: string) {
    this.resumeId = resumeId;
    this.metadata.resumeId = resumeId;
  }

  getResumeId(): string | undefined {
    return this.resumeId;
  }
}