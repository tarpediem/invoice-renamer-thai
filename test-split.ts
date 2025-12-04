
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs/promises';
import * as path from 'path';
import { splitPdfIntoPages } from './src/utils/pdf-split';

async function testSplit() {
    try {
        console.log('Creating multi-page PDF...');
        const doc = await PDFDocument.create();
        doc.addPage([100, 100]);
        doc.addPage([100, 100]);
        doc.addPage([100, 100]);

        const pdfBytes = await doc.save();
        const testPath = 'test-multi.pdf';
        await fs.writeFile(testPath, pdfBytes);

        console.log('Splitting PDF...');
        const outputDir = 'test-split-output';
        const result = await splitPdfIntoPages(testPath, outputDir);

        console.log(`Result: ${result.length} files`);
        result.forEach(f => console.log(` - ${f}`));

        if (result.length === 3) {
            console.log('SUCCESS: Split into 3 pages');
        } else {
            console.error('FAILURE: Did not split into 3 pages');
        }

        // Cleanup
        await fs.unlink(testPath);
        await fs.rm(outputDir, { recursive: true, force: true });

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testSplit();
