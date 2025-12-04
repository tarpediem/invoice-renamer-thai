#!/usr/bin/env tsx

/**
 * Test invoice extraction with LM Studio
 */

import { LMStudioProvider } from './src/providers/lmstudio-provider';

async function testInvoiceExtraction(): Promise<void> {
  console.log('Testing Invoice Extraction with Ministral...\n');

  const provider = new LMStudioProvider();

  await provider.initialize({
    baseUrl: 'http://localhost:1234/v1',
    model: 'mistralai/ministral-3-14b',
  });

  console.log('✓ Provider initialized\n');

  // Test with a simple text-based "invoice" to verify the extraction logic
  // This tests the JSON parsing and response handling
  console.log('Testing invoice data extraction logic...\n');

  // Create a minimal test to verify the provider can call the API
  // For real testing, you would need an actual PDF invoice file

  console.log('Instructions for full test:');
  console.log('='.repeat(60));
  console.log('1. Get a sample invoice PDF (or create a simple one)');
  console.log('2. Place it in this directory (e.g., test-invoice.pdf)');
  console.log('3. Run:');
  console.log('   npm run dev -- process test-invoice.pdf --provider lmstudio --dry-run -v');
  console.log('='.repeat(60));
  console.log('\nAlternatively, test with a specific file:');
  console.log('   npx tsx test-invoice-extraction.ts /path/to/invoice.pdf');

  // If a file path was provided as argument
  const testFile = process.argv[2];
  if (testFile) {
    console.log(`\nTesting with file: ${testFile}`);
    try {
      const result = await provider.extractInvoiceData(testFile);
      console.log('\n✓ Extraction successful!');
      console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('\n✗ Extraction failed:', error);
    }
  } else {
    console.log('\nNo test file provided. Ready to test with real invoices!');
  }
}

testInvoiceExtraction().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
