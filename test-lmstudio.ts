#!/usr/bin/env tsx

/**
 * Test script for LM Studio provider
 */

import { LMStudioProvider } from './src/providers/lmstudio-provider';

async function testLMStudio(): Promise<void> {
  console.log('Testing LM Studio Provider...\n');

  const provider = new LMStudioProvider();

  // Initialize with default config
  await provider.initialize({
    baseUrl: process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1',
    model: process.env.LMSTUDIO_MODEL || 'local-model',
  });

  console.log('✓ Provider initialized');

  // Check if available
  const isAvailable = await provider.isAvailable();
  console.log(`✓ Provider available: ${isAvailable}`);

  if (!isAvailable) {
    console.error('\n✗ LM Studio is not running or not accessible');
    console.log('  Make sure LM Studio is running on http://localhost:1234');
    process.exit(1);
  }

  // Check which models are available
  console.log('\nFetching available models...');
  try {
    const response = await fetch('http://localhost:1234/v1/models');
    const data = await response.json();
    console.log('Available models:');
    data.data.forEach((model: { id: string }) => {
      console.log(`  - ${model.id}`);
    });
  } catch (error) {
    console.error('Failed to fetch models:', error);
  }

  console.log('\n✓ LM Studio provider test completed successfully!');
  console.log('\nNote: To test invoice extraction, you need:');
  console.log('  1. A vision-capable model loaded in LM Studio (e.g., LLaVA, BakLLaVA)');
  console.log('  2. A PDF invoice file to process');
}

testLMStudio().catch((error) => {
  console.error('\n✗ Test failed:', error);
  process.exit(1);
});
