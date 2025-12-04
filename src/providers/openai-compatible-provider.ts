import { BaseVisionProvider } from './base-provider';
import { InvoiceData } from '../types';
import { pdfToBase64Image } from '../utils/pdf-to-image';
import { normalizeDateFromBE } from '../utils/date-utils';

/**
 * Abstract base class for OpenAI-compatible vision providers
 * This eliminates code duplication between OpenRouter and LM Studio providers
 */
export abstract class OpenAICompatibleProvider extends BaseVisionProvider {
  protected abstract baseUrl: string;
  protected abstract model: string;

  /**
   * Get HTTP headers for API requests
   * Subclasses override this to add authentication
   */
  protected abstract getHeaders(): Record<string, string>;

  /**
   * Get the provider name for error messages
   */
  protected abstract getProviderName(): string;

  /**
   * Extract invoice data using OpenAI-compatible API
   */
  async extractInvoiceData(filePath: string): Promise<InvoiceData> {
    this.ensureInitialized();

    try {
      // Convert PDF to PNG image and get base64
      const base64Data = await pdfToBase64Image(filePath);
      const mimeType = 'image/png'; // Always PNG after conversion

      // Get the comprehensive Thai invoice extraction prompt
      const prompt = this.getExtractionPrompt();

      // Call OpenAI-compatible API
      // Timeout after 60 seconds to prevent hanging requests
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
          temperature: 0.1,
        }),
        signal: AbortSignal.timeout(60000), // 60 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `${this.getProviderName()} API error: ${response.status} - ${errorText}`
        );
      }

      const result = (await response.json()) as any;
      const content = result.choices[0]?.message?.content;

      if (!content) {
        throw new Error(`No response from ${this.getProviderName()}`);
      }

      // Parse the JSON response
      const invoiceData = this.parseInvoiceData(content);
      return invoiceData;
    } catch (error) {
      throw new Error(
        `Failed to extract invoice data: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Parse invoice data from LLM response
   */
  protected parseInvoiceData(content: string): InvoiceData {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.date || !parsed.supplier) {
        throw new Error('Missing required fields: date and supplier');
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(parsed.date)) {
        throw new Error(
          `Invalid date format: ${parsed.date}. Expected YYYY-MM-DD`
        );
      }

      // Check if LLM forgot to convert Buddhist Era
      const parsedYear = parseInt(parsed.date.split('-')[0], 10);
      if (parsedYear > 2500) {
        throw new Error(
          `Buddhist Era year not converted! Got ${parsedYear}, expected CE year (subtract 543). ` +
            `This indicates the LLM failed to convert the date properly.`
        );
      }

      // Normalize date from Buddhist Era to Common Era if needed
      const normalizedDate = normalizeDateFromBE(parsed.date);

      // STRICT validation: Reject obviously wrong dates
      const year = parseInt(normalizedDate.split('-')[0], 10);
      const currentYear = new Date().getFullYear();

      // Reject dates before 2020 or more than 2 years in future
      if (year < 2020) {
        throw new Error(
          `Date too old: ${normalizedDate} (year ${year}). ` +
            `This is likely a year misread (e.g., 2568 read as 2511/2554/2558). ` +
            `Expected range: 2020-${currentYear + 2}. ` +
            `Original date from LLM: ${parsed.date}`
        );
      }

      if (year > currentYear + 2) {
        throw new Error(
          `Date too far in future: ${normalizedDate} (year ${year}). ` +
            `This is likely a year misread or OCR error. ` +
            `Expected range: 2020-${currentYear + 2}. ` +
            `Original date from LLM: ${parsed.date}`
        );
      }

      return {
        date: normalizedDate,
        supplier: parsed.supplier,
        originalSupplier: parsed.originalSupplier,
        confidence: parsed.confidence || 0.8,
      };
    } catch (error) {
      throw new Error(
        `Failed to parse invoice data: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get the comprehensive extraction prompt for Thai invoices
   * This prompt is shared between all OpenAI-compatible providers
   */
  protected getExtractionPrompt(): string {
    return `You are an expert invoice data extraction assistant specializing in Thai invoices and receipts. Your task is to analyze this image and extract invoice information with high accuracy.

EXTRACTION REQUIREMENTS:
1. **Invoice/Receipt Date** - Return in YYYY-MM-DD format (Common Era)
2. **Supplier/Store Name** - English name (translate if Thai)

═══════════════════════════════════════════════════════════════
CRITICAL - THAI BUDDHIST ERA CALENDAR (พ.ศ.) CONVERSION
═══════════════════════════════════════════════════════════════

Thailand uses Buddhist Era (BE/พ.ศ.) which is 543 years ahead of Common Era (CE/ค.ศ.)
- Current year: December 2025 CE = 2568 BE
- Valid recent years: 2566 BE (2023), 2567 BE (2024), 2568 BE (2025)

⚠️ COMMON OCR MISTAKES TO AVOID:
- 2568 misread as 2558, 2554, 2511, 2518 ❌
- The year should be 256X where X is typically 6, 7, or 8
- Look at ALL FOUR DIGITS carefully - don't confuse 6 with 5, 8 with 3

CONVERSION STEPS:
1. READ: Identify the year (look for 4-digit number near date)
2. CHECK: If year > 2500, it's Buddhist Era (BE)
3. CONVERT: Subtract 543 from BE to get CE
   - 2568 - 543 = 2025 ✓
   - 2567 - 543 = 2024 ✓
   - 2566 - 543 = 2023 ✓
4. VALIDATE: Final year must be 2020-2027
   - If < 2020: You misread the year ❌
   - If > 2027: You misread the year ❌

⚠️ YOU MUST RETURN COMMON ERA (CE), NOT BUDDHIST ERA
- WRONG: "2568-11-15" ❌
- CORRECT: "2025-11-15" ✓

═══════════════════════════════════════════════════════════════
DATE FORMAT RECOGNITION
═══════════════════════════════════════════════════════════════

Handle these formats (all should be converted to YYYY-MM-DD):
- Thai format: DD/MM/YYYY or DD/MM/YY (e.g., 15/11/2568 → 2025-11-15)
- ISO format: YYYY-MM-DD (may need BE→CE conversion)
- Dash format: DD-MM-YYYY
- Text dates: "15 Nov 2024", "15 พ.ย. 2567" (พ.ย. = November)
- Compact: YYYYMMDD or DDMMYYYY

Thai month abbreviations:
ม.ค.=Jan, ก.พ.=Feb, มี.ค.=Mar, เม.ย.=Apr, พ.ค.=May, มิ.ย.=Jun,
ก.ค.=Jul, ส.ค.=Aug, ก.ย.=Sep, ต.ค.=Oct, พ.ย.=Nov, ธ.ค.=Dec

═══════════════════════════════════════════════════════════════
SUPPLIER NAME EXTRACTION
═══════════════════════════════════════════════════════════════

Common Thai suppliers (use English names):
- เซเว่น อีเลฟเว่น → "7-Eleven"
- แม็คโคร → "Makro"
- โลตัส → "Lotus"
- บิ๊กซี → "Big C"
- ท็อปส์ → "Tops"
- แฟมิลี่มาร์ท → "Family Mart"
- เทสโก้ → "Tesco"
- กูร์เมต์ → "Gourmet"
- เดลิช ฟู้ดส์ → "Delish Foods"
- ฟู้ดแลนด์ → "Foodland"
- วิลล่า มาร์เก็ต → "Villa Market"

For other suppliers:
- Use the company name from the header/logo
- Translate Thai to English (transliterate if needed)
- Remove "บริษัท", "จำกัด", "Co., Ltd." suffixes
- Keep it concise (2-3 words max)

═══════════════════════════════════════════════════════════════
SMALL RECEIPT HANDLING (7-Eleven, convenience stores)
═══════════════════════════════════════════════════════════════

⚠️ CRITICAL: Small receipts have TINY TEXT - scan carefully!
- Date is often at TOP or BOTTOM of receipt
- Store name/logo is usually in the header
- Look for "Tax Invoice" / "ใบกำกับภาษี" header
- Transaction date vs. print date: Use TRANSACTION date
- Receipt number format: Often includes date (YYYYMMDD)

═══════════════════════════════════════════════════════════════
EDGE CASES & TROUBLESHOOTING
═══════════════════════════════════════════════════════════════

If you can't find the date:
1. Check receipt header/footer
2. Look for "วันที่" (date), "Date:", "เวลา" (time)
3. Check receipt number (may contain YYYYMMDD)
4. Look for timestamps near totals

If you can't find supplier:
1. Check top of document for logo/company name
2. Look for "ผู้ขาย" (seller), "Vendor", "From"
3. Check tax ID section (company name nearby)
4. Use building/store name if visible

Quality checks:
- confidence < 0.5: Uncertain extraction
- confidence 0.5-0.8: Moderate confidence
- confidence > 0.8: High confidence

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════

Return ONLY valid JSON (no markdown, no explanation):
{
  "date": "YYYY-MM-DD",
  "supplier": "English Supplier Name",
  "originalSupplier": "ชื่อภาษาไทย (if translated)",
  "confidence": 0.0-1.0
}

Example outputs:
{
  "date": "2025-11-15",
  "supplier": "7-Eleven",
  "originalSupplier": "เซเว่น อีเลฟเว่น",
  "confidence": 0.95
}

{
  "date": "2024-03-20",
  "supplier": "Makro",
  "originalSupplier": "แม็คโคร",
  "confidence": 0.90
}

NOW ANALYZE THE IMAGE AND EXTRACT THE DATA:`;
  }
}
