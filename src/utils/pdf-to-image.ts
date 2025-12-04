/**
 * PDF to image conversion utilities
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { pdfToPng } from 'pdf-to-png-converter';

/**
 * Convert PDF first page to base64-encoded PNG for vision model
 * Uses high resolution (4x scale) to capture small text on receipts
 *
 * Note: Creates temporary PNG files that are automatically cleaned up
 */
export async function pdfToBase64Image(filePath: string): Promise<string> {
  // Create a unique temporary directory for this conversion
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'invoice-pdf-'));

  try {
    // Convert PDF to PNG (first page only)
    // Using 4x scale to capture small text on receipts (7-Eleven, etc.)
    const pngPages = await pdfToPng(filePath, {
      disableFontFace: false,
      useSystemFonts: false,
      viewportScale: 4.0, // Increased from 2.0 to 4.0 for better quality
      outputFolder: tempDir, // Use temp directory instead of source directory
      verbosityLevel: 0,
      pagesToProcess: [1], // Only first page
    });

    if (!pngPages || pngPages.length === 0) {
      throw new Error('Failed to convert PDF to image');
    }

    // Get the PNG buffer and convert to base64
    const pngBuffer = pngPages[0].content;
    if (!pngBuffer) {
      throw new Error('No content in generated PNG');
    }

    const base64Image = pngBuffer.toString('base64');

    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });

    return base64Image;
  } catch (error) {
    // Clean up temp directory even on error
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    throw new Error(
      `Failed to convert PDF to image: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Convert PDF file to base64-encoded string for vision model
 * @deprecated Use pdfToBase64Image instead for vision models
 */
export async function pdfToBase64(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  return buffer.toString('base64');
}

/**
 * Get the MIME type for the file
 */
export function getFileMimeType(filePath: string): string {
  if (filePath.toLowerCase().endsWith('.pdf')) {
    return 'image/png'; // Return PNG for PDFs since we convert them
  }
  if (filePath.toLowerCase().endsWith('.png')) {
    return 'image/png';
  }
  if (filePath.toLowerCase().endsWith('.jpg') || filePath.toLowerCase().endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  return 'application/octet-stream';
}
