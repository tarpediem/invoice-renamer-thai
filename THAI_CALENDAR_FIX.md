# Thai Buddhist Era Calendar Fix ✅

## Problem Identified

Thailand uses the **Buddhist Era (BE)** calendar, which is **543 years ahead** of the Common Era (CE) / Gregorian calendar.

### Previous Issues

Before the fix, dates were being extracted incorrectly:
- ❌ `2568-11-28` (should be `2025-11-28`)
- ❌ `2058-11-16` (ambiguous - could be OCR error)
- ❌ `1968-11-17` (might be correct or converted incorrectly)

### Buddhist Era Conversion

| BE Year | CE Year | Calculation |
|---------|---------|-------------|
| 2568    | 2025    | 2568 - 543 = 2025 |
| 2567    | 2024    | 2567 - 543 = 2024 |
| 2566    | 2023    | 2566 - 543 = 2023 |
| 2565    | 2022    | 2565 - 543 = 2022 |

## Solution Implemented

### 1. Enhanced LLM Prompt

Added explicit instructions to the vision model:

```
CRITICAL - Thai Buddhist Era Calendar:
- Thailand uses Buddhist Era (BE) calendar which is 543 years ahead of Common Era (CE)
- If you see a Thai year like 2568, 2567, 2566, etc. (years > 2500), subtract 543 to get CE year
- Example: 2568 BE = 2025 CE, 2567 BE = 2024 CE, 2566 BE = 2023 CE
- ALWAYS return dates in Common Era (CE) format, NOT Buddhist Era
- Convert: YYYY_BE - 543 = YYYY_CE
```

### 2. Post-Processing Validation

Added automatic date normalization in `src/utils/date-utils.ts`:

```typescript
export function normalizeDateFromBE(dateStr: string): string {
  const year = parseInt(yearStr, 10);

  if (year > 2500) {
    // Definitely Buddhist Era, convert to CE
    ceYear = year - 543;
  } else if (year > currentYear + 20) {
    // Ambiguous year - try conversion and validate
    // ...
  } else {
    // Reasonable CE year, keep as-is
    ceYear = year;
  }

  return `${ceYear}-${month}-${day}`;
}
```

### 3. Smart Ambiguity Handling

The system now intelligently handles edge cases:

| Year Range | Interpretation | Action |
|------------|----------------|--------|
| > 2500 | Buddhist Era | Convert (subtract 543) |
| 2046-2500 | Ambiguous | Try conversion, validate result |
| 1900-2045 | Common Era | Keep as-is |
| < 1900 | Invalid/Error | Reject with error |

## Validation Tests

### Test Cases Passing

✅ `2568-11-28` → `2025-11-28` (BE conversion)
✅ `2567-03-15` → `2024-03-15` (BE conversion)
✅ `2566-01-01` → `2023-01-01` (BE conversion)
✅ `2025-11-10` → `2025-11-10` (already CE)
✅ `2023-07-15` → `2023-07-15` (already CE)

### Edge Cases Handled

⚠️ `2058-11-16` - Ambiguous year detected and converted appropriately
⚠️ `2046-01-01` - Future year handled with validation

## Files Modified

1. **`src/providers/lmstudio-provider.ts`**
   - Updated prompt with Buddhist Era instructions
   - Added post-processing date normalization

2. **`src/utils/date-utils.ts`** (NEW)
   - Buddhist Era detection
   - BE to CE conversion
   - Smart ambiguity handling
   - Date validation

3. **`test-thai-date.ts`** (NEW)
   - Test suite for date conversion
   - Validates all edge cases

## Impact on Processing

### Before Fix
- Dates with BE years would show up as future dates (e.g., 2568)
- Ambiguous dates could cause sorting issues
- No way to distinguish BE from CE

### After Fix
- ✅ All dates normalized to Common Era (CE)
- ✅ Automatic conversion of BE years > 2500
- ✅ Smart handling of ambiguous years
- ✅ Validation prevents nonsensical dates
- ✅ Consistent date format across all invoices

## How to Reprocess

To reprocess all invoices with corrected dates:

```bash
# Clear old results
rm -rf renamed-invoices/

# Reprocess with Thai calendar fix
npm run dev -- process "Folder essai TRI.zip" \
  --provider lmstudio \
  --output renamed-invoices/ \
  --verbose
```

## Testing

Run the date conversion tests:

```bash
npx tsx test-thai-date.ts
```

Expected output:
```
✓ BE 2568 → CE 2025
✓ BE 2567 → CE 2024
✓ BE 2566 → CE 2023
✓ Already CE (no change)
```

## Notes

- The LLM (Ministral) is now explicitly instructed about Thai calendar
- Post-processing provides a safety net in case LLM misses the conversion
- Warning messages alert you to ambiguous or suspicious years
- All dates are validated to be within reasonable range (1900-2045)

---

**Status**: ✅ Fixed and tested
**Impact**: All future invoice processing will use correct CE dates
