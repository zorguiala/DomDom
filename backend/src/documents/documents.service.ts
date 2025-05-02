/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { DocumentTemplate } from '../entities/document-template.entity';
import { User } from '../entities/user.entity';
import {
  CreateDocumentDto,
  DocumentResponseDto,
  GenerateInvoiceDto,
  GenerateBonDeSortieDto,
  GenerateProductionReportDto,
} from './dto/document.dto';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateResponseDto,
  TemplateDetailsResponseDto,
  DocumentFormat,
  DocumentType,
} from './dto/document-template.dto';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { SalesService } from '../sales/sales.service';
import { ProductsService } from '../products/products.service';
import { ProductionService } from '../production/production.service';

// Define interfaces for content types to improve type safety
interface InvoiceItem {
  product?: { name: string };
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: Date | string;
  customer?: {
    firstName?: string;
    lastName?: string;
    name?: string;
  };
  items?: InvoiceItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
}

interface BonDeSortieItem {
  product?: { name: string };
  quantity: number;
  unit?: string;
  unitPrice?: number;
  total?: number;
}

interface BonDeSortieData {
  reference: string;
  date: Date | string;
  items?: BonDeSortieItem[];
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  notes?: string;
}

interface ProductionReportRecord {
  createdAt: Date | string;
  employee?: { firstName?: string; lastName?: string };
  bom?: { name: string };
  quantity: number;
  qualityChecked: boolean;
}

interface ProductionReportData {
  startDate: Date | string;
  endDate: Date | string;
  records: ProductionReportRecord[];
  totalQuantity: number;
  totalRecords: number;
  employeeId?: string;
  bomId?: string;
}

interface DocumentContent {
  invoice?: InvoiceData;
  bonDeSortie?: BonDeSortieData;
  productionReport?: ProductionReportData;
}

@Injectable()
export class DocumentsService {
  private readonly documentsDir = path.join(process.cwd(), 'uploads', 'documents');

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(DocumentTemplate)
    private templateRepository: Repository<DocumentTemplate>,
    private salesService: SalesService,
    private ProductsService: ProductsService,
    private productionService: ProductionService
  ) {
    // Ensure the documents directory exists
    if (!fs.existsSync(this.documentsDir)) {
      fs.mkdirSync(this.documentsDir, { recursive: true });
    }
  }

  // Template management methods
  async createTemplate(templateData: CreateTemplateDto, user: User): Promise<TemplateResponseDto> {
    const template = this.templateRepository.create({
      name: templateData.name,
      type: templateData.type as any, // Type cast to resolve enum mismatch
      content: templateData.content,
      metadata: templateData.metadata,
      description: templateData.description,
      requiredFields: templateData.requiredFields,
      createdBy: user,
    });
    const savedTemplate = await this.templateRepository.save(template);
    return this.mapTemplateToResponse(savedTemplate);
  }

  async updateTemplate(id: string, templateData: UpdateTemplateDto): Promise<TemplateResponseDto> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    Object.assign(template, templateData);
    const updatedTemplate = await this.templateRepository.save(template);
    return this.mapTemplateToResponse(updatedTemplate);
  }

  async getTemplates(): Promise<TemplateResponseDto[]> {
    const templates = await this.templateRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
    return templates.map((template) => this.mapTemplateToResponse(template));
  }

  async getTemplateById(id: string): Promise<TemplateDetailsResponseDto> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return {
      ...this.mapTemplateToResponse(template),
      content: template.content,
      metadata: template.metadata,
    };
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    // Soft delete by setting isActive to false
    template.isActive = false;
    await this.templateRepository.save(template);
  }

  // Document generation methods
  async generateDocument(
    documentData: CreateDocumentDto,
    user: User
  ): Promise<DocumentResponseDto> {
    let templateContent: string | null = null;
    if (documentData.templateId) {
      const template = await this.templateRepository.findOne({
        where: { id: documentData.templateId },
      });
      if (template) {
        templateContent = template.content;
      }
    }

    // Generate a unique filename
    const timestamp = new Date().getTime();
    const filename = `${documentData.documentType}_${timestamp}.${documentData.format}`;
    const outputPath = path.join(this.documentsDir, filename);

    // Generate the document based on format
    if (documentData.format === DocumentFormat.PDF) {
      await this.createPDF(documentData, templateContent, outputPath);
    } else if (documentData.format === DocumentFormat.EXCEL) {
      await this.createExcel(documentData, templateContent, outputPath);
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unsupported format: ${documentData.format}`);
    }

    // Save document record
    const document = this.documentRepository.create({
      name: documentData.title,
      type: documentData.documentType as any, // Type cast to resolve enum mismatch
      format: documentData.format as any, // Type cast to resolve enum mismatch
      filePath: outputPath,
      metadata: documentData.metadata,
      relatedEntityId: documentData.relatedEntityId,
      relatedEntityType: documentData.relatedEntityType,
      createdBy: user,
    });

    const savedDocument = await this.documentRepository.save(document);
    return this.mapDocumentToResponse(savedDocument);
  }

  async generateInvoice(data: GenerateInvoiceDto, user: User): Promise<DocumentResponseDto> {
    const sale = await this.salesService.getSale(data.saleId);
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${data.saleId} not found`);
    }

    const documentData: CreateDocumentDto = {
      title: `Invoice_${sale.invoiceNumber || sale.id}`,
      documentType: DocumentType.INVOICE,
      format: data.format,
      content: {
        invoice: {
          invoiceNumber: sale.invoiceNumber || `INV-${sale.id.substring(0, 8)}`,
          date: sale.createdAt,
          customer: sale.customer,
          items: sale.items,
          totalAmount: sale.totalAmount,
          discount: sale.discount,
          finalAmount: sale.finalAmount,
        },
      },
      relatedEntityId: sale.id,
      relatedEntityType: 'sale',
      templateId: data.templateId,
    };

    return this.generateDocument(documentData, user);
  }

  async generateBonDeSortie(
    data: GenerateBonDeSortieDto,
    user: User
  ): Promise<DocumentResponseDto> {
    // Fetch product details for each item
    const items = await Promise.all(
      data.items.map(async (item) => {
        const product = await this.ProductsService.findOne(item.productId);
        return {
          product: { name: product.name },
          quantity: item.quantity,
          unit: product.unit,
          unitPrice: product.price,
          total: item.quantity * product.price,
        };
      })
    );

    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + (item.total || 0), 0);

    const documentData: CreateDocumentDto = {
      title: `BonDeSortie_${data.reference}`,
      documentType: DocumentType.BON_DE_SORTIE,
      format: data.format,
      content: {
        bonDeSortie: {
          reference: data.reference,
          date: new Date(),
          items,
          totalItems,
          totalQuantity,
          totalValue,
          notes: data.notes,
        },
      },
      metadata: { reference: data.reference },
      templateId: data.templateId,
    };

    return this.generateDocument(documentData, user);
  }

  async generateProductionReport(
    data: GenerateProductionReportDto,
    user: User
  ): Promise<DocumentResponseDto> {
    const startDate = data.startDate
      ? new Date(data.startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = data.endDate ? new Date(data.endDate) : new Date();

    // Get production records with filters
    const records = await this.productionService.getProductionRecords({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      employeeId: data.employeeId,
      bomId: data.bomId,
    });

    const totalQuantity = records.reduce((sum, record) => sum + record.quantity, 0);

    const documentData: CreateDocumentDto = {
      title: `ProductionReport_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`,
      documentType: DocumentType.REPORT,
      format: data.format,
      content: {
        productionReport: {
          startDate,
          endDate,
          records,
          totalQuantity,
          totalRecords: records.length,
          employeeId: data.employeeId,
          bomId: data.bomId,
        },
      },
      metadata: {
        startDate,
        endDate,
        employeeId: data.employeeId,
        bomId: data.bomId,
      },
      templateId: data.templateId,
    };

    return this.generateDocument(documentData, user);
  }

  // Helper methods for document generation
  private async createPDF(
    documentData: CreateDocumentDto,
    templateContent: string | null,
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      // Add content to PDF
      this.addContentToPDF(doc, documentData, templateContent);

      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', (err) => reject(err));
    });
  }

  private addContentToPDF(
    doc: PDFKit.PDFDocument,
    documentData: CreateDocumentDto,
    templateContent: string | null
  ): void {
    // Add title
    doc.fontSize(20).text(documentData.title, { align: 'center' });
    doc.moveDown();

    // Process template if available
    if (templateContent && documentData.content) {
      const processedContent = this.processTemplate(templateContent, documentData.content);
      doc.fontSize(12).text(processedContent);
      return;
    }

    // Render specific document types
    switch (documentData.documentType) {
      case DocumentType.INVOICE:
        this.renderInvoicePDF(doc, documentData);
        break;
      case DocumentType.BON_DE_SORTIE:
        this.renderBonDeSortiePDF(doc, documentData);
        break;
      case DocumentType.REPORT:
        this.renderReportPDF(doc, documentData);
        break;
      default:
        doc.text('Document content not available');
    }
  }

  private renderInvoicePDF(doc: PDFKit.PDFDocument, documentData: CreateDocumentDto): void {
    const content = documentData.content as DocumentContent;
    const invoice = content.invoice;

    if (!invoice) {
      doc.text('Invoice data not available');
      return;
    }

    // Header
    doc.fontSize(16).text('INVOICE', { align: 'center' });
    doc.moveDown();

    // Invoice details
    doc.fontSize(12);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`);

    // Customer details
    if (invoice.customer) {
      doc.moveDown();
      doc.text('Customer:');
      if (invoice.customer.name) {
        doc.text(invoice.customer.name);
      } else if (invoice.customer.firstName && invoice.customer.lastName) {
        doc.text(`${invoice.customer.firstName} ${invoice.customer.lastName}`);
      }
    }

    // Items table
    if (invoice.items && invoice.items.length > 0) {
      doc.moveDown();
      doc.text('Items:', { underline: true });

      // Table header
      const tableTop = doc.y;
      doc.fontSize(10);
      doc.text('Product', 50, tableTop);
      doc.text('Quantity', 200, tableTop);
      doc.text('Unit Price', 300, tableTop);
      doc.text('Total', 400, tableTop);

      // Table rows
      let y = tableTop + 20;
      for (const item of invoice.items) {
        doc.text(item.product?.name || 'Unknown', 50, y);
        doc.text(item.quantity?.toString() || '0', 200, y);
        doc.text(item.unitPrice?.toFixed(2) || '0.00', 300, y);
        doc.text(item.totalPrice?.toFixed(2) || '0.00', 400, y);
        y += 20;
      }

      // Totals
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Total Amount: ${invoice.totalAmount.toFixed(2)}`, { align: 'right' });
      if (invoice.discount > 0) {
        doc.text(`Discount: ${invoice.discount.toFixed(2)}`, { align: 'right' });
      }
      doc.text(`Final Amount: ${invoice.finalAmount.toFixed(2)}`, { align: 'right' });
    }
  }

  private renderBonDeSortiePDF(doc: PDFKit.PDFDocument, documentData: CreateDocumentDto): void {
    const content = documentData.content as DocumentContent;
    const bonDeSortie = content.bonDeSortie;

    if (!bonDeSortie) {
      doc.text('Bon de Sortie data not available');
      return;
    }

    // Header
    doc.fontSize(16).text('BON DE SORTIE', { align: 'center' });
    doc.moveDown();

    // Reference and date
    doc.fontSize(12);
    doc.text(`Reference: ${bonDeSortie.reference}`);
    doc.text(`Date: ${new Date(bonDeSortie.date).toLocaleDateString()}`);

    // Items table
    if (bonDeSortie.items && bonDeSortie.items.length > 0) {
      doc.moveDown();
      doc.text('Items:', { underline: true });

      // Table header
      const tableTop = doc.y;
      doc.fontSize(10);
      doc.text('Product', 50, tableTop);
      doc.text('Quantity', 200, tableTop);
      doc.text('Unit', 300, tableTop);
      doc.text('Unit Price', 400, tableTop);
      doc.text('Total', 500, tableTop);

      // Table rows
      let y = tableTop + 20;
      for (const item of bonDeSortie.items) {
        doc.text(item.product?.name || 'Unknown', 50, y);
        doc.text(item.quantity.toString(), 200, y);
        doc.text(item.unit || '', 300, y);
        doc.text(item.unitPrice?.toFixed(2) || '0.00', 400, y);
        doc.text(item.total?.toFixed(2) || '0.00', 500, y);
        y += 20;
      }

      // Totals
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Total Items: ${bonDeSortie.totalItems}`, { align: 'right' });
      doc.text(`Total Quantity: ${bonDeSortie.totalQuantity}`, { align: 'right' });
      doc.text(`Total Value: ${bonDeSortie.totalValue.toFixed(2)}`, { align: 'right' });
    }

    // Notes
    if (bonDeSortie.notes) {
      doc.moveDown();
      doc.text('Notes:');
      doc.text(bonDeSortie.notes);
    }
  }

  private renderReportPDF(doc: PDFKit.PDFDocument, documentData: CreateDocumentDto): void {
    const content = documentData.content as DocumentContent;
    const report = content.productionReport;

    if (!report) {
      doc.text('Report data not available');
      return;
    }

    // Header
    doc.fontSize(16).text('PRODUCTION REPORT', { align: 'center' });
    doc.moveDown();

    // Date range
    doc.fontSize(12);
    doc.text(
      `Period: ${new Date(report.startDate).toLocaleDateString()} - ${new Date(report.endDate).toLocaleDateString()}`
    );

    // Summary
    doc.moveDown();
    doc.text(`Total Records: ${report.totalRecords}`);
    doc.text(`Total Quantity: ${report.totalQuantity}`);

    // Records table
    if (report.records && report.records.length > 0) {
      doc.moveDown();
      doc.text('Production Records:', { underline: true });

      // Table header
      const tableTop = doc.y;
      doc.fontSize(10);
      doc.text('Date', 50, tableTop);
      doc.text('Employee', 150, tableTop);
      doc.text('BOM', 250, tableTop);
      doc.text('Quantity', 350, tableTop);
      doc.text('Quality Checked', 450, tableTop);

      // Table rows
      let y = tableTop + 20;
      for (const record of report.records) {
        doc.text(new Date(record.createdAt).toLocaleDateString(), 50, y);
        doc.text(
          record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : 'N/A',
          150,
          y
        );
        doc.text(record.bom?.name || 'N/A', 250, y);
        doc.text(record.quantity.toString(), 350, y);
        doc.text(record.qualityChecked ? 'Yes' : 'No', 450, y);
        y += 20;
      }
    }
  }

  private async createExcel(
    documentData: CreateDocumentDto,
    templateContent: string | null,
    outputPath: string
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Document');

    // Add content to Excel
    if (templateContent && documentData.content) {
      // Template processing for Excel is more complex and would require a different approach
      worksheet.addRow(['Document generated from template']);
    } else {
      // Render specific document types
      switch (documentData.documentType) {
        case DocumentType.INVOICE:
          this.renderInvoiceExcel(worksheet, documentData);
          break;
        case DocumentType.BON_DE_SORTIE:
          this.renderBonDeSortieExcel(worksheet, documentData);
          break;
        case DocumentType.REPORT:
          this.renderReportExcel(worksheet, documentData);
          break;
        default:
          worksheet.addRow(['Document content not available']);
      }
    }

    await workbook.xlsx.writeFile(outputPath);
  }

  private renderInvoiceExcel(sheet: ExcelJS.Worksheet, documentData: CreateDocumentDto): void {
    const content = documentData.content as DocumentContent;
    const invoice = content.invoice;

    if (!invoice) {
      sheet.addRow(['Invoice data not available']);
      return;
    }

    // Header
    sheet.addRow(['INVOICE']);
    sheet.addRow([]);

    // Invoice details
    sheet.addRow(['Invoice Number:', invoice.invoiceNumber]);
    sheet.addRow(['Date:', new Date(invoice.date).toLocaleDateString()]);

    // Customer details
    if (invoice.customer) {
      sheet.addRow([]);
      sheet.addRow(['Customer:']);
      if (invoice.customer.name) {
        sheet.addRow([invoice.customer.name]);
      } else if (invoice.customer.firstName && invoice.customer.lastName) {
        sheet.addRow([`${invoice.customer.firstName} ${invoice.customer.lastName}`]);
      }
    }

    // Items table
    if (invoice.items && invoice.items.length > 0) {
      sheet.addRow([]);
      sheet.addRow(['Items:']);

      // Table header
      sheet.addRow(['Product', 'Quantity', 'Unit Price', 'Total']);

      // Table rows
      for (const item of invoice.items) {
        sheet.addRow([
          item.product?.name || 'Unknown',
          item.quantity || 0,
          item.unitPrice || 0,
          item.totalPrice || 0,
        ]);
      }

      // Totals
      sheet.addRow([]);
      sheet.addRow(['', '', 'Total Amount:', invoice.totalAmount]);
      if (invoice.discount > 0) {
        sheet.addRow(['', '', 'Discount:', invoice.discount]);
      }
      sheet.addRow(['', '', 'Final Amount:', invoice.finalAmount]);
    }
  }

  private renderBonDeSortieExcel(sheet: ExcelJS.Worksheet, documentData: CreateDocumentDto): void {
    const content = documentData.content as DocumentContent;
    const bonDeSortie = content.bonDeSortie;

    if (!bonDeSortie) {
      sheet.addRow(['Bon de Sortie data not available']);
      return;
    }

    // Header
    sheet.addRow(['BON DE SORTIE']);
    sheet.addRow([]);

    // Reference and date
    sheet.addRow(['Reference:', bonDeSortie.reference]);
    sheet.addRow(['Date:', new Date(bonDeSortie.date).toLocaleDateString()]);

    // Items table
    if (bonDeSortie.items && bonDeSortie.items.length > 0) {
      sheet.addRow([]);
      sheet.addRow(['Items:']);

      // Table header
      sheet.addRow(['Product', 'Quantity', 'Unit', 'Unit Price', 'Total']);

      // Table rows
      for (const item of bonDeSortie.items) {
        sheet.addRow([
          item.product?.name || 'Unknown',
          item.quantity,
          item.unit || '',
          item.unitPrice || 0,
          item.total || 0,
        ]);
      }

      // Totals
      sheet.addRow([]);
      sheet.addRow(['', '', '', 'Total Items:', bonDeSortie.totalItems]);
      sheet.addRow(['', '', '', 'Total Quantity:', bonDeSortie.totalQuantity]);
      sheet.addRow(['', '', '', 'Total Value:', bonDeSortie.totalValue]);
    }

    // Notes
    if (bonDeSortie.notes) {
      sheet.addRow([]);
      sheet.addRow(['Notes:']);
      sheet.addRow([bonDeSortie.notes]);
    }
  }

  private renderReportExcel(sheet: ExcelJS.Worksheet, documentData: CreateDocumentDto): void {
    const content = documentData.content as DocumentContent;
    const report = content.productionReport;

    if (!report) {
      sheet.addRow(['Report data not available']);
      return;
    }

    // Header
    sheet.addRow(['PRODUCTION REPORT']);
    sheet.addRow([]);

    // Date range
    sheet.addRow([
      'Period:',
      `${new Date(report.startDate).toLocaleDateString()} - ${new Date(report.endDate).toLocaleDateString()}`,
    ]);

    // Summary
    sheet.addRow([]);
    sheet.addRow(['Total Records:', report.totalRecords]);
    sheet.addRow(['Total Quantity:', report.totalQuantity]);

    // Records table
    if (report.records && report.records.length > 0) {
      sheet.addRow([]);
      sheet.addRow(['Production Records:']);

      // Table header
      sheet.addRow(['Date', 'Employee', 'BOM', 'Quantity', 'Quality Checked']);

      // Table rows
      for (const record of report.records) {
        sheet.addRow([
          new Date(record.createdAt).toLocaleDateString(),
          record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : 'N/A',
          record.bom?.name || 'N/A',
          record.quantity,
          record.qualityChecked ? 'Yes' : 'No',
        ]);
      }
    }
  }

  private processTemplate(template: string, data: Record<string, any>): string {
    const flattenedData = this.flattenObject(data);
    let processedContent = template;

    // Replace placeholders with actual values
    for (const [key, value] of Object.entries(flattenedData)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(placeholder, String(value));
    }

    return processedContent;
  }

  private flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }

    return flattened;
  }

  // Document retrieval methods
  async getDocumentByPath(filePath: string): Promise<Buffer> {
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Document file not found: ${filePath}`);
    }
    return fs.promises.readFile(filePath);
  }

  async getDocumentById(id: string): Promise<DocumentResponseDto> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return this.mapDocumentToResponse(document);
  }

  async getUserDocuments(userId: string): Promise<DocumentResponseDto[]> {
    const documents = await this.documentRepository.find({
      where: { createdById: userId },
      order: { createdAt: 'DESC' },
    });
    return documents.map((document) => this.mapDocumentToResponse(document));
  }

  // Helper methods for mapping entities to DTOs
  private mapTemplateToResponse(template: DocumentTemplate): TemplateResponseDto {
    return {
      id: template.id,
      name: template.name,
      type: template.type as any, // Type cast to resolve enum mismatch
      description: template.description,
      requiredFields: template.requiredFields,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  private mapDocumentToResponse(document: Document): DocumentResponseDto {
    return {
      id: document.id,
      documentType: document.type as any, // Type cast to resolve enum mismatch
      title: document.name,
      filePath: document.filePath,
      createdAt: document.createdAt,
      metadata: document.metadata,
      relatedEntityId: document.relatedEntityId,
      relatedEntityType: document.relatedEntityType,
    };
  }
}
