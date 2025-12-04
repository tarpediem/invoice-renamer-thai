import * as path from 'path';
import * as fs from 'fs/promises';
import { InvoiceData } from '../types';

/**
 * Generate a new filename from invoice data
 */
export function generateFileName(invoiceData: InvoiceData, originalExt: string): string {
  // Sanitize supplier name: replace spaces with hyphens, remove special chars
  const sanitizedSupplier = invoiceData.supplier
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${invoiceData.date}-${sanitizedSupplier}${originalExt}`;
}

/**
 * Generate a unique filename, adding counter if needed to avoid duplicates
 */
export async function generateUniqueFileName(
  invoiceData: InvoiceData,
  originalExt: string,
  outputDir: string
): Promise<string> {
  const baseFileName = generateFileName(invoiceData, originalExt);
  const baseName = path.basename(baseFileName, originalExt);
  let counter = 1;
  let fileName = baseFileName;
  let fullPath = path.join(outputDir, fileName);

  // Check if file exists, and add counter if it does
  while (await fileExists(fullPath)) {
    fileName = `${baseName}-${counter}${originalExt}`;
    fullPath = path.join(outputDir, fileName);
    counter++;
  }

  return fileName;
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure a directory exists, create if it doesn't
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error}`);
  }
}

/**
 * Get file extension including the dot
 */
export function getFileExtension(filePath: string): string {
  return path.extname(filePath);
}

/**
 * Check if a file is a PDF
 */
export function isPdfFile(filePath: string): boolean {
  return getFileExtension(filePath).toLowerCase() === '.pdf';
}

/**
 * Check if a file is a ZIP archive
 */
export function isZipFile(filePath: string): boolean {
  return getFileExtension(filePath).toLowerCase() === '.zip';
}
