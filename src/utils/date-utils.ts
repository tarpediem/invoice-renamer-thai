/**
 * Date conversion utilities for Thai Buddhist Era calendar
 */

/**
 * Convert Thai Buddhist Era (BE) year to Gregorian/Common Era (CE)
 * BE calendar is 543 years ahead of CE
 * Example: 2568 BE = 2025 CE
 */
export function convertBEtoCE(year: number): number {
  if (year > 2500) {
    // Likely Buddhist Era year, convert to CE
    return year - 543;
  }
  return year; // Already in CE
}

/**
 * Validate and normalize a date string, converting Thai BE dates to CE
 * @param dateStr Date string in YYYY-MM-DD format
 * @returns Normalized date string in YYYY-MM-DD format with CE year
 */
export function normalizeDateFromBE(dateStr: string): string {
  // Parse the date
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  const [, yearStr, month, day] = match;
  const year = parseInt(yearStr, 10);

  // Determine the year format and convert if needed
  let ceYear: number;
  const currentYear = new Date().getFullYear();

  if (year > 2500) {
    // Definitely Buddhist Era, convert to CE
    ceYear = year - 543;
  } else if (year > currentYear + 20) {
    // Ambiguous: too far in future for CE, but could be OCR error
    // Try converting from BE to see if it makes more sense
    const possibleCE = year - 543;
    if (possibleCE >= 1900 && possibleCE <= currentYear + 5) {
      // Makes sense as BE converted to CE
      ceYear = possibleCE;
      console.warn(
        `Ambiguous year ${year} converted from BE to CE: ${ceYear} (${dateStr} -> ${ceYear}-${month}-${day})`
      );
    } else {
      // Likely OCR error or invalid date, keep as-is but warn
      ceYear = year;
      console.warn(`Suspicious year detected: ${year} in date ${dateStr}`);
    }
  } else {
    // Reasonable CE year, keep as-is
    ceYear = year;
  }

  // Validate the final year is reasonable (between 1900 and current year + 20)
  if (ceYear < 1900 || ceYear > currentYear + 20) {
    throw new Error(
      `Year ${ceYear} is out of reasonable range (original: ${year}, date: ${dateStr})`
    );
  }

  // Validate that the date is actually valid (e.g., not February 30th)
  const testDate = new Date(`${ceYear}-${month}-${day}`);
  if (
    testDate.getFullYear() !== ceYear ||
    testDate.getMonth() + 1 !== parseInt(month, 10) ||
    testDate.getDate() !== parseInt(day, 10)
  ) {
    throw new Error(`Invalid date: ${ceYear}-${month}-${day} (month or day does not exist)`);
  }

  // Return normalized date
  return `${ceYear.toString().padStart(4, '0')}-${month}-${day}`;
}

/**
 * Check if a year is likely in Buddhist Era format
 */
export function isBuddhistEra(year: number): boolean {
  return year > 2500;
}
