import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Split a multi-page PDF into separate single-page PDFs
 * @param pdfPath Path to the PDF file to split
 * @param outputDir Directory to save split PDFs
 * @returns Array of paths to the split PDF files
 */
export async function splitPdfIntoPages(
  pdfPath: string,
  outputDir: string
): Promise<string[]> {
  try {
    // Read the PDF file
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pageCount = pdfDoc.getPageCount();
    const splitPdfPaths: string[] = [];

    // If only one page, no need to split
    if (pageCount === 1) {
      return [pdfPath];
    }

    console.log(`Splitting ${path.basename(pdfPath)} into ${pageCount} pages...`);

    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    // Split each page into a separate PDF
    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);

      const newPdfBytes = await newPdf.save();
      const outputFileName = `${path.basename(pdfPath, '.pdf')}_page${i + 1}.pdf`;
      const outputPath = path.join(outputDir, outputFileName);

      await fs.writeFile(outputPath, newPdfBytes);
      splitPdfPaths.push(outputPath);
    }

    console.log(`✓ Split into ${pageCount} individual pages`);
    return splitPdfPaths;
  } catch (error) {
    throw new Error(
      `Failed to split PDF: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get the number of pages in a PDF
 * @param pdfPath Path to the PDF file
 * @returns Number of pages
 */
export async function getPdfPageCount(pdfPath: string): Promise<number> {
  try {
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    return pdfDoc.getPageCount();
  } catch (error) {
    throw new Error(
      `Failed to get PDF page count: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Check if a PDF has multiple pages
 * @param pdfPath Path to the PDF file
 * @returns True if PDF has more than one page
 */
export async function isMultiPagePdf(pdfPath: string): Promise<boolean> {
  const pageCount = await getPdfPageCount(pdfPath);
  return pageCount > 1;
}
