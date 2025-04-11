import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  openAiClient: OpenAI;
  constructor() {
    this.openAiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createCompletion(prompt: string) {
    return this.openAiClient.chat.completions.create({
      model: 'gpt-4-turbo',
      store: false,
      messages: [
        {
          role: 'system',
          content:
            'You need to suggest a list of criteria to the ranking based on the name of the ranking.',
        },
        {
          role: 'system',
          content:
            'Its extremely important to be concise and objective, and to suggest only the criteria that are really necessary.',
        },
        {
          role: 'system',
          content:
            'Its always important to suggest the criteria in a array format.',
        },
        {
          role: 'system',
          content:
            'The criteria should be in Portuguese, and the ranking name will be in Portuguese too.',
        },
        {
          role: 'system',
          content:
            'The criteria should be in a array format, and the array should be in JSON format.',
        },
        {
          role: 'system',
          content:
            'The array should be in a JSON format, and the JSON format should be in a array format.',
        },
        {
          role: 'developer',
          content: 'A resposta deve ser capaz de ser parseada por um JSON. Esse é o formato esperado: ["critério 1", "critério 2", "critério 3"]',
        },
        { role: 'user', content: prompt },
      ],
    });
  }
}
