import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class ChatResumeDto {
  @IsNotEmpty()
  @IsString()
  question: string;
}