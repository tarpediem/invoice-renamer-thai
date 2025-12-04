import AdmZip from 'adm-zip';
import * as path from 'path';
import * as fs from 'fs/promises';
import { isPdfFile } from './file-utils';

/**
 * Extract PDF files from a ZIP archive to a temporary directory
 * @param zipPath Path to the ZIP file
 * @param outputDir Directory to extract files to (optional, uses temp dir if not specified)
 * @returns Array of extracted PDF file paths
 */
export async function extractPdfsFromZip(zipPath: string, outputDir?: string): Promise<string[]> {
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();

  // Use temp directory if no output specified
  const extractDir = outputDir || path.join(process.cwd(), '.temp', `extract-${Date.now()}`);

  // Ensure extract directory exists
  await fs.mkdir(extractDir, { recursive: true });

  const extractedPdfs: string[] = [];

  for (const entry of zipEntries) {
    // Skip directories, macOS metadata files, and non-PDF files
    if (
      entry.isDirectory ||
      entry.entryName.includes('__MACOSX') ||
      entry.entryName.startsWith('.') ||
      !isPdfFile(entry.entryName)
    ) {
      continue;
    }

    // Get just the filename without the path
    const fileName = path.basename(entry.entryName);
    const outputPath = path.join(extractDir, fileName);

    // Extract the file
    zip.extractEntryTo(entry.entryName, extractDir, false, true, false, fileName);

    extractedPdfs.push(outputPath);
  }

  return extractedPdfs;
}

/**
 * Clean up temporary extraction directory
 */
export async function cleanupTempDir(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
    console.warn(`Failed to clean up temp directory: ${dirPath}`);
  }
}
