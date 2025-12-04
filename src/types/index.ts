/**
 * Extracted invoice data from vision model
 */
export interface InvoiceData {
  date: string; // ISO format YYYY-MM-DD
  supplier: string; // English name
  originalSupplier?: string; // Original name if translated
  confidence?: number; // Confidence score from the model
}

/**
 * Configuration for a vision model provider
 */
export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Result from processing a single invoice
 */
export interface ProcessingResult {
  success: boolean;
  originalPath: string;
  newPath?: string;
  invoiceData?: InvoiceData;
  error?: string;
}

/**
 * Options for processing invoices
 */
export interface ProcessingOptions {
  provider: string;
  outputDir?: string;
  dryRun?: boolean;
  verbose?: boolean;
  maxRetries?: number;
}
