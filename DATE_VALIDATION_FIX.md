# Strict Date Validation - Fix for Year Misreading

## Problem Identified

Multiple invoices showing obviously wrong dates:
- **1968-11-12** (Way too old!)
- **1982-11-17** (Reported by user)
- **2011, 2015, 2016** (Previous issue)
- **2568** (Buddhist Era NOT converted to CE)
- **2058, 2068** (Future dates - likely misread)

### Analysis

| File Year | Likely Cause | Should Be |
|-----------|--------------|-----------|
| 1968 | 2511 BE → 1968 CE (misread 2568 as 2511) | 2025 |
| 2011 | 2554 BE → 2011 CE (misread 2568 as 2554) | 2025 |
| 2015 | 2558 BE → 2015 CE (misread 2568 as 2558) | 2025 |
| 2016 | 2559 BE → 2016 CE (misread 2567 as 2559) | 2024 |
| 2568 | LLM forgot to convert BE to CE | 2025 |
| 2058 | 2601 BE → 2058 CE (misread) | ~2024-2025 |
| 2068 | 2611 BE → 2068 CE (misread) | ~2024-2025 |

## Root Cause

Despite improved prompts, the vision model still:
1. **Misreads digits** in years (2568 → 2511, 2554, 2558, etc.)
2. **Forgets to convert** BE to CE (returns 2568 instead of 2025)
3. **Doesn't self-validate** the result

## Solution Implemented

### 1. Enhanced Prompt (Step-by-Step with Examples)

**File**: `src/providers/lmstudio-provider.ts`

Added explicit step-by-step instructions:

```
CRITICAL - Thai Buddhist Era Calendar (READ CAREFULLY):
- Today is December 2025 CE = 2568 BE in Thailand
- CURRENT VALID YEARS: 2567 BE (2024 CE), 2568 BE (2025 CE)

- STEP 1: READ THE YEAR - Look at ALL FOUR DIGITS very carefully
  * Common misreads: 2568→2558, 2568→2554, 2568→2511 (WRONG!)
  * The year should be 256X where X is 6, 7, or 8 for recent invoices

- STEP 2: CONVERT - If year > 2500, subtract 543
  * 2568 - 543 = 2025 ✓ CORRECT
  * 2567 - 543 = 2024 ✓ CORRECT
  * 2554 - 543 = 2011 ✗ WRONG! (You misread 2568 as 2554)
  * 2511 - 543 = 1968 ✗ WRONG! (You misread 2568 as 2511)

- STEP 3: VALIDATE - Final year must be between 2020-2027
  * If < 2020: You misread the year, try again
  * If > 2027: You misread the year, try again

- DO NOT return years like 2568, 2567 - these MUST be converted to 2025, 2024
```

**Key improvements**:
- Explicit current date context
- Step-by-step process
- Examples of WRONG conversions to avoid
- Expected year range (256X for recent invoices)
- Self-validation instructions

### 2. Strict Server-Side Validation

Added validation that **rejects** obviously wrong dates:

```typescript
// Check if LLM forgot to convert Buddhist Era
const parsedYear = parseInt(parsed.date.split('-')[0], 10);
if (parsedYear > 2500) {
  throw new Error(
    `Buddhist Era year not converted! Got ${parsedYear}, expected CE year (subtract 543).`
  );
}

// Reject dates before 2020
if (year < 2020) {
  throw new Error(
    `Date too old: ${normalizedDate} (year ${year}). ` +
    `This is likely a year misread (e.g., 2568 read as 2511/2554/2558). ` +
    `Expected range: 2020-${currentYear + 2}.`
  );
}

// Reject dates more than 2 years in future
if (year > currentYear + 2) {
  throw new Error(
    `Date too far in future: ${normalizedDate} (year ${year}). ` +
    `Expected range: 2020-${currentYear + 2}.`
  );
}
```

**Validation rules**:
- ✅ **2020-2027**: Valid range
- ❌ **< 2020**: Too old - Rejected
- ❌ **> 2027**: Too far future - Rejected
- ❌ **> 2500**: Forgot to convert BE - Rejected

## Impact

### Before Fix
Files with wrong dates were silently processed:
- `1968-11-12-East-West-Trading.pdf` ❌
- `2011-11-21-La-Vanille.pdf` ❌
- `2568-XX-XX-Supplier.pdf` ❌

### After Fix
Wrong dates are **rejected** with clear error messages:
```
Failed to process invoice: Date too old: 1968-11-12 (year 1968).
This is likely a year misread (e.g., 2568 read as 2511/2554/2558).
Expected range: 2020-2027.
Original date from LLM: 1968-11-12
```

Files marked as **failed** instead of processed with wrong dates.

## Benefits

### For Users
- ✅ **No Silent Errors**: Wrong dates don't slip through
- ✅ **Clear Feedback**: Error messages explain the problem
- ✅ **Failed Count**: Shows which files need attention
- ✅ **Data Quality**: Only valid dates accepted

### For Debugging
- ✅ **Visible Issues**: Failed files highlight prompt problems
- ✅ **Error Context**: Messages show what went wrong
- ✅ **Iterative Improvement**: Can refine prompt based on failures

## Expected Results

When you reprocess invoices:

**Previously**: ~20 files with wrong dates (1968, 2011, 2015, 2016, 2058, 2068, 2568)
**Now**: Those files will **fail** with clear error messages

**Success rate might temporarily drop**, but data quality improves dramatically!

## Reprocessing Invoices

To reprocess with the new validation:

```bash
# Clean old results
rm -rf renamed-invoices-old
mv renamed-invoices renamed-invoices-old

# Reprocess with strict validation
npm run dev -- process "Folder essai TRI.zip" \
  --provider lmstudio \
  --output renamed-invoices \
  --verbose
```

Watch for error messages like:
```
❌ Date too old: 1968-11-12
❌ Buddhist Era year not converted: 2568
❌ Date too far in future: 2068-11-15
```

These are **expected** and indicate the validation is working!

## Next Steps

### 1. Review Failed Files
Check which files are failing:
```bash
# Process and check failures
npm run dev -- process "Folder essai TRI.zip" --verbose 2>&1 | grep "Failed to process"
```

### 2. Manual Verification
For failed files, manually check the PDF to see the actual date.

### 3. Iterate on Prompt
If many files fail with the same pattern, we may need to:
- Increase image resolution further (beyond 4x)
- Add image preprocessing (contrast enhancement)
- Try different vision models
- Use OCR as fallback for dates

## Files Modified

**`src/providers/lmstudio-provider.ts`**:
1. Enhanced prompt with step-by-step instructions
2. Added examples of wrong conversions
3. Added strict date validation (2020-2027 range)
4. Added Buddhist Era detection (reject > 2500)

## Trade-Offs

### Pros
✅ **Data Quality**: No more wrong dates
✅ **Transparency**: Failed files are visible
✅ **Debugging**: Clear error messages
✅ **Reliability**: Only accept valid dates

### Cons
⚠️ **Lower Success Rate**: Some files will fail instead of processing
⚠️ **Manual Review**: Need to check failed files
⚠️ **Strict Rules**: May reject edge cases (old invoices from 2019)

**Verdict**: Better to fail loudly than succeed with wrong data!

## Validation Examples

| Input Year | Validation Result | Reason |
|-----------|------------------|---------|
| 2025 | ✅ Pass | Valid range |
| 2024 | ✅ Pass | Valid range |
| 2023 | ✅ Pass | Valid range |
| 2020 | ✅ Pass | Valid range |
| 2568 | ❌ Fail | Buddhist Era not converted |
| 2068 | ❌ Fail | Too far in future |
| 2019 | ❌ Fail | Too old (but configurable if needed) |
| 2011 | ❌ Fail | Too old (likely misread) |
| 1968 | ❌ Fail | Too old (definitely misread) |

## Adjusting Validation Range

If you have legitimate old invoices from 2018-2019, adjust the validation:

```typescript
// Change this line:
if (year < 2020) {

// To:
if (year < 2018) {  // Accept invoices from 2018+
```

## Web UI Impact

When using the web UI:
- Failed files show in the "Failed" count
- Error details logged to console
- Only successfully processed files included in ZIP download
- Clear indication of which files need attention

---

**Status**: ✅ Implemented and ready to test
**Impact**: Strict validation prevents wrong dates from being accepted
**Action Required**: Reprocess invoices to catch and fix wrong dates
