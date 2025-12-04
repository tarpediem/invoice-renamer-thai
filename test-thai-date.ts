#!/usr/bin/env tsx

/**
 * Test Thai Buddhist Era date conversion
 */

import { normalizeDateFromBE, convertBEtoCE, isBuddhistEra } from './src/utils/date-utils';

console.log('Testing Thai Buddhist Era Date Conversion\n');
console.log('='.repeat(60));

// Test BE to CE conversion
const testCases = [
  { input: '2568-11-28', expected: '2025-11-28', desc: 'BE 2568 → CE 2025' },
  { input: '2567-03-15', expected: '2024-03-15', desc: 'BE 2567 → CE 2024' },
  { input: '2566-01-01', expected: '2023-01-01', desc: 'BE 2566 → CE 2023' },
  { input: '2025-11-10', expected: '2025-11-10', desc: 'Already CE (no change)' },
  { input: '2023-07-15', expected: '2023-07-15', desc: 'Already CE (no change)' },
  { input: '2058-11-16', expected: '1515-11-16', desc: 'BE 2058 → CE 1515 (old date)' },
];

console.log('\nDate Conversion Tests:');
console.log('-'.repeat(60));

for (const test of testCases) {
  try {
    const result = normalizeDateFromBE(test.input);
    const status = result === test.expected ? '✓' : '✗';
    console.log(`${status} ${test.desc}`);
    console.log(`  Input:    ${test.input}`);
    console.log(`  Expected: ${test.expected}`);
    console.log(`  Got:      ${result}`);
    if (result !== test.expected) {
      console.log(`  ⚠️  MISMATCH!`);
    }
    console.log();
  } catch (error) {
    console.log(`✗ ${test.desc}`);
    console.log(`  Input: ${test.input}`);
    console.log(`  Error: ${error instanceof Error ? error.message : String(error)}`);
    console.log();
  }
}

// Test year detection
console.log('\nYear Detection Tests:');
console.log('-'.repeat(60));

const years = [2568, 2567, 2025, 2024, 1968, 2500, 2501];
for (const year of years) {
  const isBE = isBuddhistEra(year);
  const converted = convertBEtoCE(year);
  console.log(
    `Year ${year}: ${isBE ? 'Buddhist Era' : 'Common Era'} → Converted: ${converted}`
  );
}

console.log('\n' + '='.repeat(60));
console.log('Test complete!');
