import OpenAI from 'openai';
import type { ModelConfig } from './types.ts';

export class OpenAIClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }

  async chatCompletion(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    config: Partial<ModelConfig> = {}
  ): Promise<string> {
    const defaultConfig: ModelConfig = {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 4000,
      ...config,
    };

    try {
      const response = await this.client.chat.completions.create({
        model: defaultConfig.model,
        messages,
        temperature: defaultConfig.temperature,
        max_tokens: defaultConfig.maxTokens,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateContractStep(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<string> {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: userMessage }
    ];

    return this.chatCompletion(messages);
  }
} 