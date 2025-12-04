import { generateFileName, isPdfFile, isZipFile, getFileExtension } from '../../src/utils/file-utils';
import { InvoiceData } from '../../src/types';

describe('file-utils', () => {
  describe('generateFileName', () => {
    it('should generate correct filename from invoice data', () => {
      const invoiceData: InvoiceData = {
        date: '2024-03-15',
        supplier: 'Acme Corporation',
      };

      const result = generateFileName(invoiceData, '.pdf');
      expect(result).toBe('2024-03-15-Acme-Corporation.pdf');
    });

    it('should handle supplier names with special characters', () => {
      const invoiceData: InvoiceData = {
        date: '2024-03-15',
        supplier: 'A&B Co., Ltd.',
      };

      const result = generateFileName(invoiceData, '.pdf');
      expect(result).toBe('2024-03-15-AB-Co-Ltd.pdf');
    });

    it('should handle Thai supplier names', () => {
      const invoiceData: InvoiceData = {
        date: '2024-03-15',
        supplier: 'Bangkok-Supply',
        originalSupplier: 'บริษัท กรุงเทพ ซัพพลาย',
      };

      const result = generateFileName(invoiceData, '.pdf');
      expect(result).toBe('2024-03-15-Bangkok-Supply.pdf');
    });

    it('should remove multiple consecutive hyphens', () => {
      const invoiceData: InvoiceData = {
        date: '2024-03-15',
        supplier: 'Test   Multiple   Spaces',
      };

      const result = generateFileName(invoiceData, '.pdf');
      expect(result).toBe('2024-03-15-Test-Multiple-Spaces.pdf');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(getFileExtension('invoice.pdf')).toBe('.pdf');
      expect(getFileExtension('archive.zip')).toBe('.zip');
      expect(getFileExtension('file.name.with.dots.pdf')).toBe('.pdf');
    });
  });

  describe('isPdfFile', () => {
    it('should identify PDF files', () => {
      expect(isPdfFile('invoice.pdf')).toBe(true);
      expect(isPdfFile('invoice.PDF')).toBe(true);
      expect(isPdfFile('invoice.zip')).toBe(false);
      expect(isPdfFile('invoice.txt')).toBe(false);
    });
  });

  describe('isZipFile', () => {
    it('should identify ZIP files', () => {
      expect(isZipFile('archive.zip')).toBe(true);
      expect(isZipFile('archive.ZIP')).toBe(true);
      expect(isZipFile('archive.pdf')).toBe(false);
      expect(isZipFile('archive.tar.gz')).toBe(false);
    });
  });
});
