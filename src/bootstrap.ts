/**
 * Bootstrap function to register all providers
 */
import { providerRegistry } from './providers/provider-registry';
import { MockProvider } from './providers/mock-provider';
import { LMStudioProvider } from './providers/lmstudio-provider';
import { OpenRouterProvider } from './providers/openrouter-provider';

/**
 * Register all available providers
 */
export function registerProviders(): void {
  // Register mock provider
  providerRegistry.register(new MockProvider());

  // Register LM Studio provider
  const lmstudioProvider = new LMStudioProvider();
  const lmstudioConfig = {
    baseUrl: process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1',
    model: process.env.LMSTUDIO_MODEL || 'local-model',
  };
  lmstudioProvider.initialize(lmstudioConfig);
  providerRegistry.register(lmstudioProvider);

  // Register OpenRouter provider (Qwen3-VL-235B for Thai invoice OCR)
  const openrouterProvider = new OpenRouterProvider();
  const openrouterConfig = {
    apiKey: process.env.OPENROUTER_API_KEY || '', // No default - must be provided
    model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-vl-235b-a22b-instruct',
  };
  openrouterProvider.initialize(openrouterConfig);
  providerRegistry.register(openrouterProvider);
}
