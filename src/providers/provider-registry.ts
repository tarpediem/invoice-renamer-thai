import { VisionProvider } from './base-provider';
import { ProviderConfig } from '../types';

/**
 * Registry for managing vision model providers
 */
export class ProviderRegistry {
  private providers: Map<string, VisionProvider> = new Map();

  /**
   * Register a new provider
   */
  register(provider: VisionProvider): void {
    if (this.providers.has(provider.name)) {
      throw new Error(`Provider '${provider.name}' is already registered`);
    }
    this.providers.set(provider.name, provider);
  }

  /**
   * Get a provider by name
   */
  get(name: string): VisionProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Check if a provider is registered
   */
  has(name: string): boolean {
    return this.providers.has(name);
  }

  /**
   * Get all registered provider names
   */
  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get all available (configured and ready) providers
   */
  async getAvailableProviders(): Promise<string[]> {
    const availableProviders: string[] = [];

    for (const [name, provider] of this.providers.entries()) {
      try {
        if (await provider.isAvailable()) {
          availableProviders.push(name);
        }
      } catch {
        // Provider not available
      }
    }

    return availableProviders;
  }

  /**
   * Initialize a provider with configuration
   */
  async initializeProvider(name: string, config: ProviderConfig): Promise<void> {
    const provider = this.get(name);
    if (!provider) {
      throw new Error(`Provider '${name}' is not registered`);
    }
    await provider.initialize(config);
  }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry();
