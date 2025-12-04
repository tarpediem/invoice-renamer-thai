import { InvoiceData, ProviderConfig } from '../types';

/**
 * Base interface for all vision model providers
 */
export interface VisionProvider {
  /**
   * Name of the provider (e.g., 'openrouter', 'lmstudio')
   */
  readonly name: string;

  /**
   * Initialize the provider with configuration
   */
  initialize(config: ProviderConfig): Promise<void>;

  /**
   * Extract invoice data from a PDF file
   * @param filePath Path to the PDF file
   * @returns Extracted invoice data
   */
  extractInvoiceData(filePath: string): Promise<InvoiceData>;

  /**
   * Check if the provider is available/configured
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Abstract base class for vision providers
 */
export abstract class BaseVisionProvider implements VisionProvider {
  protected config?: ProviderConfig;

  constructor(public readonly name: string) {}

  async initialize(config: ProviderConfig): Promise<void> {
    this.config = config;
  }

  abstract extractInvoiceData(filePath: string): Promise<InvoiceData>;

  abstract isAvailable(): Promise<boolean>;

  protected ensureInitialized(): void {
    if (!this.config) {
      throw new Error(`Provider ${this.name} is not initialized`);
    }
  }
}
