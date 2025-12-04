import { OpenAICompatibleProvider } from './openai-compatible-provider';
import { ProviderConfig } from '../types';

/**
 * LM Studio provider for local vision model inference
 * LM Studio provides an OpenAI-compatible API for local models
 */
export class LMStudioProvider extends OpenAICompatibleProvider {
  protected baseUrl: string = 'http://localhost:1234/v1';
  protected model: string = 'local-model';

  constructor() {
    super('lmstudio');
  }

  async initialize(config: ProviderConfig): Promise<void> {
    await super.initialize(config);

    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }

    if (config.model) {
      this.model = config.model;
    }
  }

  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    };
  }

  protected getProviderName(): string {
    return 'LM Studio';
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Check if LM Studio server is running
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
