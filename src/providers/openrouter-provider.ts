import { OpenAICompatibleProvider } from './openai-compatible-provider';
import { ProviderConfig } from '../types';

/**
 * OpenRouter provider for accessing various vision models via OpenRouter API
 * Recommended: Qwen3-VL-235B for Thai invoice OCR (best accuracy)
 * Alternative: Qwen2.5-VL-72B (proven, cost-effective)
 */
export class OpenRouterProvider extends OpenAICompatibleProvider {
  protected baseUrl: string = 'https://openrouter.ai/api/v1';
  protected model: string = 'qwen/qwen3-vl-235b-a22b-instruct';
  private apiKey: string = '';

  constructor() {
    super('openrouter');
  }

  async initialize(config: ProviderConfig): Promise<void> {
    await super.initialize(config);

    if (!config.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    this.apiKey = config.apiKey;

    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }

    if (config.model) {
      this.model = config.model;
    }
  }

  protected getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/anthropics/claude-code',
      'X-Title': 'Invoice Renamer CLI',
    };
  }

  protected getProviderName(): string {
    return 'OpenRouter';
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Check if OpenRouter API is accessible with the provided key
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
