import { Module } from '@nestjs/common';
import { OpenAiService } from './services/openai.service';

@Module({
  controllers: [],
  providers: [OpenAiService],
  exports: [OpenAiService],
})
export class AiModule {}
