#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs/promises';
import { providerRegistry } from './providers';
import { InvoiceProcessor } from './core/invoice-processor';
import { ProcessingOptions } from './types';
import { isPdfFile, isZipFile, fileExists } from './utils/file-utils';
import { extractPdfsFromZip, cleanupTempDir } from './utils/zip-utils';
import { registerProviders } from './bootstrap';

// Register all providers on startup
registerProviders();

const program = new Command();

program
  .name('invoice-renamer')
  .description('CLI tool for automated invoice processing and file renaming using vision models')
  .version('0.1.0');

program
  .command('process')
  .description('Process invoice files and rename them based on extracted data')
  .argument('<file>', 'PDF file or directory containing PDFs to process')
  .option('-p, --provider <name>', 'vision model provider to use', 'openrouter')
  .option('-o, --output <dir>', 'output directory for renamed files')
  .option('-d, --dry-run', 'show what would be done without actually renaming files')
  .option('-v, --verbose', 'show detailed processing information')
  .action(async (file: string, cmdOptions) => {
    try {
      const options: ProcessingOptions = {
        provider: cmdOptions.provider,
        outputDir: cmdOptions.output,
        dryRun: cmdOptions.dryRun || false,
        verbose: cmdOptions.verbose || false,
      };

      // Check if provider is registered
      if (!providerRegistry.has(options.provider)) {
        console.error(`Error: Provider '${options.provider}' is not registered`);
        console.log('Available providers:', providerRegistry.getProviderNames().join(', '));
        process.exit(1);
      }

      const provider = providerRegistry.get(options.provider)!;

      // Check if provider is available
      if (!(await provider.isAvailable())) {
        console.error(`Error: Provider '${options.provider}' is not available or not configured`);
        process.exit(1);
      }

      const processor = new InvoiceProcessor(provider);

      // Check if file exists
      if (!(await fileExists(file))) {
        console.error(`Error: File not found: ${file}`);
        process.exit(1);
      }

      const stats = await fs.stat(file);

      let filesToProcess: string[] = [];
      let tempDir: string | null = null;

      if (stats.isFile()) {
        if (isZipFile(file)) {
          // Handle ZIP file
          console.log('Extracting PDFs from ZIP archive...');
          const zipPath = path.resolve(file);
          filesToProcess = await extractPdfsFromZip(zipPath);
          tempDir = path.dirname(filesToProcess[0]); // Store temp dir for cleanup
          console.log(`Extracted ${filesToProcess.length} PDF files\n`);
        } else if (isPdfFile(file)) {
          filesToProcess.push(path.resolve(file));
        } else {
          console.error('Error: Only PDF and ZIP files are supported');
          process.exit(1);
        }
      } else if (stats.isDirectory()) {
        const files = await fs.readdir(file);
        filesToProcess = files
          .filter((f) => isPdfFile(f))
          .map((f) => path.resolve(file, f));

        if (filesToProcess.length === 0) {
          console.error('Error: No PDF files found in directory');
          process.exit(1);
        }
      }

      console.log(`Processing ${filesToProcess.length} file(s)...`);
      if (options.dryRun) {
        console.log('DRY RUN - No files will be renamed\n');
      }

      const results = await processor.processMultiple(filesToProcess, options);

      // Summary
      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      console.log(`\nSummary: ${successful} successful, ${failed} failed`);

      if (failed > 0) {
        console.log('\nFailed files:');
        results
          .filter((r) => !r.success)
          .forEach((r) => {
            console.log(`  ${path.basename(r.originalPath)}: ${r.error}`);
          });
      }

      // Cleanup temp directory if we extracted from ZIP
      if (tempDir && tempDir.includes('.temp')) {
        console.log('\nCleaning up temporary files...');
        await cleanupTempDir(tempDir);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('providers')
  .description('List available vision model providers')
  .action(async () => {
    console.log('Registered providers:', providerRegistry.getProviderNames().join(', '));

    const available = await providerRegistry.getAvailableProviders();
    console.log('Available providers:', available.length > 0 ? available.join(', ') : 'none');
  });

program.parse();
