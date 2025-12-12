import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResumeModule } from './modules/resume/resume.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ResumeModule],
})
export class AppModule {}