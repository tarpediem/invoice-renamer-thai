import * as path from 'path';
import * as fs from 'fs/promises';
import { VisionProvider } from '../providers';
import { ProcessingResult, ProcessingOptions } from '../types';
import { generateUniqueFileName, ensureDir, getFileExtension } from '../utils/file-utils';

/**
 * Main invoice processing engine
 */
export class InvoiceProcessor {
  constructor(private provider: VisionProvider) {}

  /**
   * Process a single PDF invoice file with retry logic
   */
  async processInvoice(filePath: string, options: ProcessingOptions): Promise<ProcessingResult> {
    const maxRetries = options.maxRetries || 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Wait before retry (exponential backoff: 1s, 2s, 4s)
          const waitTime = Math.pow(2, attempt - 1) * 1000;
          if (options.verbose) {
            console.log(
              `  Retry attempt ${attempt}/${maxRetries} for ${path.basename(filePath)} (waiting ${waitTime}ms)...`
            );
          }
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }

        // Extract invoice data using the vision provider
        const invoiceData = await this.provider.extractInvoiceData(filePath);

        // Determine output directory
        const outputDir = options.outputDir || path.dirname(filePath);
        await ensureDir(outputDir);

        // Generate unique filename (handles duplicates automatically)
        const ext = getFileExtension(filePath);
        const newFileName = await generateUniqueFileName(invoiceData, ext, outputDir);
        const newPath = path.join(outputDir, newFileName);

        // Rename the file (unless dry run)
        if (!options.dryRun) {
          await fs.rename(filePath, newPath);
        }

        if (options.verbose) {
          console.log(`Processed: ${path.basename(filePath)} -> ${newFileName}`);
          if (invoiceData.originalSupplier) {
            console.log(`  Translated: ${invoiceData.originalSupplier} -> ${invoiceData.supplier}`);
          }
          if (attempt > 0) {
            console.log(`  ✓ Succeeded on retry attempt ${attempt}`);
          }
        }

        return {
          success: true,
          originalPath: filePath,
          newPath,
          invoiceData,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on certain errors
        const errorMessage = lastError.message;
        const nonRetryableErrors = ['File not found', 'Permission denied', 'Not a PDF'];

        if (nonRetryableErrors.some((msg) => errorMessage.includes(msg))) {
          if (options.verbose) {
            console.log(`  Non-retryable error, skipping retries`);
          }
          break;
        }

        // Log retry-worthy errors
        if (attempt < maxRetries && options.verbose) {
          console.log(`  Attempt ${attempt + 1} failed: ${errorMessage}`);
        }
      }
    }

    // All retries exhausted
    const errorMessage = lastError?.message || 'Unknown error';
    return {
      success: false,
      originalPath: filePath,
      error: `Failed after ${maxRetries + 1} attempts: ${errorMessage}`,
    };
  }

  /**
   * Process multiple invoice files
   */
  async processMultiple(
    filePaths: string[],
    options: ProcessingOptions
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];

    for (const filePath of filePaths) {
      const result = await this.processInvoice(filePath, options);
      results.push(result);
    }

    return results;
  }
}
