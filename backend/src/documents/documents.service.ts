import { Injectable } from '@nestjs/common';
import { CreateDocumentDto, DocumentResponseDto } from './dto/document.dto';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private readonly documentsDir = path.join(
    process.cwd(),
    'uploads',
    'documents',
  );

  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.documentsDir)) {
      fs.mkdirSync(this.documentsDir, { recursive: true });
    }
  }

  async generateDocument(
    documentData: CreateDocumentDto,
  ): Promise<DocumentResponseDto> {
    const fileName = `${documentData.documentType}_${Date.now()}.pdf`;
    const filePath = path.join(this.documentsDir, fileName);

    // Create a PDF document
    await this.createPDF(documentData, filePath);

    // In a real implementation, you would save document metadata to database
    return {
      id: Math.floor(Math.random() * 1000), // Placeholder ID
      documentType: documentData.documentType,
      title: documentData.title,
      filePath: fileName,
      createdAt: new Date(),
      metadata: documentData.metadata || {},
    };
  }

  private async createPDF(
    documentData: CreateDocumentDto,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(outputPath);

      // Pipe the PDF into a file
      doc.pipe(stream);

      // Add content to the PDF based on document type
      doc.fontSize(25).text(documentData.title, 100, 100);

      // Handle different document types
      switch (documentData.documentType) {
        case 'bon-de-sortie':
          doc.fontSize(12).text('Bon de Sortie', 100, 150);
          // Add more content based on documentData.content
          break;
        case 'invoice':
          doc.fontSize(12).text('Invoice', 100, 150);
          // Add more content based on documentData.content
          break;
        default:
          doc.fontSize(12).text('Custom Document', 100, 150);
      }

      // Add document metadata
      if (documentData.metadata) {
        const metadataY = 200;
        doc.fontSize(10).text('Document Metadata:', 100, metadataY);

        let currentY = metadataY + 20;
        Object.entries(documentData.metadata).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`, 120, currentY);
          currentY += 15;
        });
      }

      // Finalize PDF file
      doc.end();

      stream.on('finish', () => {
        resolve();
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  async getDocumentByPath(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.documentsDir, filePath);
    return fs.promises.readFile(fullPath);
  }
}
