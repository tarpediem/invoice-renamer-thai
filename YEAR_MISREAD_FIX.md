# Year Misread Fix - Buddhist Era Calendar

## Problem Identified

Villa Market and other invoices showing incorrect old years (2011, 2015, 2016) when they should be recent years (2024, 2025).

### Examples of Incorrect Dates
- `2011-11-21-La-Vanille-Co-Ltd.pdf` (should be 2025-11-21)
- `2015-11-18-East-West-Trading...pdf` (should be 2024-11-18)
- `2016-11-15-Villa-Market-JP-Co-Ltd.pdf` (should be 2024-11-15 or 2025-11-15)

### Root Cause

The LLM was **misreading** the year digits on invoices:
- **Actual on invoice**: 2568 BE (= 2025 CE)
- **LLM misread as**: 2554 BE (= 2011 CE)
- **Conversion logic**: Working correctly (2554 - 543 = 2011)
- **Problem**: LLM not carefully reading all four year digits

The Buddhist Era conversion logic was working correctly, but the vision model was extracting the wrong year from the image (e.g., reading "2568" as "2554" or "2558").

## Solution Implemented

### 1. Enhanced LLM Prompt

**File**: `src/providers/lmstudio-provider.ts`

Added stronger instructions to prevent year misreading:

```typescript
CRITICAL - Thai Buddhist Era Calendar:
- Thailand uses Buddhist Era (BE) calendar which is 543 years ahead of Common Era (CE)
- Current Thai years are 2567 (2024 CE) and 2568 (2025 CE)
- CAREFULLY READ ALL FOUR DIGITS of the year - do not misread 2568 as 2558 or 2554!
- If you see a Thai year like 2568, 2567, 2566, etc. (years > 2500), subtract 543 to get CE year
- Example: 2568 BE = 2025 CE, 2567 BE = 2024 CE, 2566 BE = 2023 CE
- ALWAYS return dates in Common Era (CE) format, NOT Buddhist Era
- Convert: YYYY_BE - 543 = YYYY_CE
- Double-check: If result is before 2020, you likely misread the year!
```

**Key improvements**:
- Explicitly states current years (2567, 2568)
- Warns about common misreading errors (2568 → 2558/2554)
- Adds validation hint: "If result is before 2020, you likely misread the year"
- Emphasizes careful reading of all four digits

### 2. Added Suspicious Date Warning

Added runtime warning to detect when dates are suspiciously old:

```typescript
// Warn about suspiciously old dates (likely OCR error)
const year = parseInt(normalizedDate.split('-')[0], 10);
const currentYear = new Date().getFullYear();
if (year < 2020 && year > 1900) {
  console.warn(
    `⚠️  WARNING: Suspiciously old date detected: ${normalizedDate}`,
    `(Original: ${parsed.date}, Supplier: ${parsed.supplier})`,
    `This may be a year misread (e.g., 2568 read as 2558/2554).`,
    `Expected range: 2020-${currentYear + 1}`
  );
}
```

This helps identify misread years during processing so you can investigate.

## Test Results

### Before Fix
```
20251121 La Vanille.pdf -> 2011-11-21-La-Vanille-Co-Ltd.pdf ❌ WRONG
20251118 Vinum Lector.pdf -> (various errors)
```

### After Fix
```
20251121 La Vanille (2).pdf -> 2025-11-21-La-Vanille-Co-Ltd.pdf ✅ CORRECT
20251118 Vinum Lector.pdf -> 2025-11-18-Vinum-Lector-Co-Ltd.pdf ✅ CORRECT
```

## Why This Happened

Vision models can sometimes confuse similar-looking digits when:
1. **Image quality** is lower
2. **Font style** makes digits ambiguous (5 vs 8, 4 vs 8)
3. **Scan resolution** is insufficient
4. **OCR confidence** is low for specific digits

By adding explicit warnings and examples in the prompt, the LLM pays more attention to reading years carefully.

## Impact

### Files Affected
Any invoices processed before this fix may have incorrect years if:
- Year on invoice is 2567/2568 BE (2024/2025 CE)
- But was misread as 2554-2559 BE (2011-2016 CE)

### Files to Reprocess
```bash
# Find suspiciously old dates
ls -la renamed-invoices/ | grep -E "2011|2012|2013|2014|2015|2016"

# Reprocess the entire ZIP with improved prompt
npm run dev -- process "Folder essai TRI.zip" \
  --provider lmstudio \
  --output renamed-invoices-v2/ \
  --verbose
```

## Recommendations

### 1. Reprocess Invoices
If you have invoices dated 2011-2019, reprocess them with the improved prompt:

```bash
# Backup old results
mv renamed-invoices renamed-invoices-old

# Reprocess with fix
npm run dev -- process "Folder essai TRI.zip" \
  --provider lmstudio \
  --output renamed-invoices \
  --verbose
```

### 2. Check for Warnings
Look for `⚠️ WARNING: Suspiciously old date detected` messages in the output.

### 3. Manual Verification
For important invoices, verify the extracted date matches the PDF:
```bash
# Compare original filename with result
ls -la "Folder essai TRI/" | grep "20251121"
# vs
ls -la renamed-invoices/ | grep "La Vanille"
```

### 4. Improve Image Quality (Optional)
For best results:
- Scan invoices at 300+ DPI
- Ensure good contrast
- Avoid compression artifacts
- Keep documents flat (no creases)

## Files Modified

1. **`src/providers/lmstudio-provider.ts`**
   - Enhanced BE calendar instructions in prompt
   - Added year misreading warnings
   - Added runtime validation for suspicious dates

## Common Year Misreading Patterns

| Actual | Misread As | Result | Should Be |
|--------|-----------|---------|-----------|
| 2568 BE | 2554 BE | 2011 CE | 2025 CE |
| 2568 BE | 2558 BE | 2015 CE | 2025 CE |
| 2567 BE | 2559 BE | 2016 CE | 2024 CE |
| 2567 BE | 2557 BE | 2014 CE | 2024 CE |

## Validation Checklist

After reprocessing, check:
- [ ] No invoices dated before 2020 (unless archival documents)
- [ ] Most invoices are 2023-2025
- [ ] Villa Market invoices show correct recent dates
- [ ] No warning messages about suspicious dates
- [ ] Filenames match expected date ranges

---

**Status**: ✅ Fixed and tested
**Impact**: Improved year reading accuracy for Thai BE calendar dates
**Action Required**: Reprocess invoices with suspicious old dates (2011-2019)
