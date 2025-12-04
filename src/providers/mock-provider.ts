import { BaseVisionProvider } from './base-provider';
import { InvoiceData } from '../types';

/**
 * Mock provider for testing purposes
 * This demonstrates how to implement a vision provider
 */
export class MockProvider extends BaseVisionProvider {
  constructor() {
    super('mock');
  }

  async extractInvoiceData(_filePath: string): Promise<InvoiceData> {
    this.ensureInitialized();

    // In a real implementation, this would:
    // 1. Read the PDF file
    // 2. Send it to the vision model API
    // 3. Parse the response
    // 4. Extract and validate the invoice data

    return {
      date: '2024-03-15',
      supplier: 'Mock-Supplier',
      confidence: 0.95,
    };
  }

  async isAvailable(): Promise<boolean> {
    // Mock provider is always available
    return true;
  }
}
