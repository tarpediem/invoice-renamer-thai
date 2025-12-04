#!/usr/bin/env tsx

/**
 * Test Ministral vision capability with proper image format
 */

async function testMinistralVision(): Promise<void> {
  console.log('Testing Ministral Vision Capability...\n');

  // Create a minimal 1x1 PNG image (valid PNG format)
  // This is a base64-encoded 1x1 red pixel PNG
  const validPngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

  console.log('Testing with valid PNG image...\n');

  try {
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistralai/ministral-3-14b',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'What do you see in this image? Describe it briefly.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${validPngBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('✗ Error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    console.log('✓ Vision test successful!');
    console.log('Model response:', content);
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Ministral vision capability confirmed!');
    console.log('='.repeat(60));
    console.log('\nYou can now use this model for invoice processing.');
    console.log('\nNext steps:');
    console.log('  1. Get a test invoice PDF');
    console.log('  2. Run: npm run dev -- process invoice.pdf --provider lmstudio --dry-run -v');
  } catch (error) {
    console.error('\n✗ Vision test failed:', error);
    console.log('\nThis might mean:');
    console.log('  1. The model needs to be configured differently in LM Studio');
    console.log('  2. Vision features might need to be enabled');
    console.log('  3. The image format needs adjustment');
  }
}

testMinistralVision().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
