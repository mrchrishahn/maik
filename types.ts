export interface ProcessConfig {
  apiKey: string;
  directory: string;
  userPrompt: string;
  outputFile?: string;
}

export interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface ContractStep {
  name: string;
  prompt: string;
  description: string;
}

export interface ContractSession {
  userPrompt: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  contractDraft?: string;
  finalContract?: string;
} 