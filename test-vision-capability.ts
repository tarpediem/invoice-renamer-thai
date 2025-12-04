#!/usr/bin/env tsx

/**
 * Test if the current LM Studio model supports vision
 */

async function testVisionCapability(): Promise<void> {
  console.log('Testing LM Studio Vision Capability...\n');

  // First, check text-only capability
  console.log('1. Testing text-only chat (should work)...');
  try {
    const textResponse = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistralai/ministral-3-14b',
        messages: [
          {
            role: 'user',
            content: 'Reply with just "OK" if you can read this',
          },
        ],
        temperature: 0.1,
        max_tokens: 10,
      }),
    });

    const textData = await textResponse.json();
    console.log('   ✓ Text response:', textData.choices[0]?.message?.content?.trim());
  } catch (error) {
    console.error('   ✗ Failed:', error);
  }

  // Now test vision capability with a simple base64 image
  console.log('\n2. Testing vision capability (may not work with text-only model)...');

  // Create a minimal test "image" (actually just encoded text for testing)
  const testImage = Buffer.from('Test invoice data').toString('base64');

  try {
    const visionResponse = await fetch('http://localhost:1234/v1/chat/completions', {
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
                text: 'Can you see this image?',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${testImage}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 50,
      }),
    });

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.log('   ✗ Vision not supported - Expected for text-only models');
      console.log('   Error:', errorText.substring(0, 200));
    } else {
      const visionData = await visionResponse.json();
      console.log('   ✓ Vision response:', visionData.choices[0]?.message?.content);
      console.log('\n   🎉 Great! Your model supports vision!');
    }
  } catch (error) {
    console.log('   ✗ Vision capability test failed');
    console.log('   Error:', error instanceof Error ? error.message : String(error));
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log('='.repeat(60));
  console.log('\nCurrent model: mistralai/ministral-3-14b (text-only)');
  console.log('\nFor invoice processing with images/PDFs, you need:');
  console.log('  • LLaVA 1.6 (recommended)');
  console.log('  • BakLLaVA (document-focused)');
  console.log('  • LLaVA-Phi-3 (lightweight)');
  console.log('  • Obsidian-3B-V0.5 (small but capable)');
  console.log('\nSteps to add vision support:');
  console.log('  1. Open LM Studio');
  console.log('  2. Search for "llava" in the model search');
  console.log('  3. Download a vision model');
  console.log('  4. Load it in the Local Server tab');
  console.log('  5. Update LMSTUDIO_MODEL in .env to the new model name');
}

testVisionCapability().catch((error) => {
  console.error('\nTest failed:', error);
  process.exit(1);
});
