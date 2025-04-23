import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Res,
  UseGuards,
  Request,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentsService } from './documents.service';
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
} from './dto/document-template.dto';
import { User } from '../entities/user.entity';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // Template management endpoints
  @Post('templates')
  async createTemplate(
    @Body() templateData: CreateTemplateDto,
    @Request() req: { user: User }
  ): Promise<TemplateResponseDto> {
    return this.documentsService.createTemplate(templateData, req.user);
  }

  @Get('templates')
  async getTemplates(): Promise<TemplateResponseDto[]> {
    return this.documentsService.getTemplates();
  }

  @Get('templates/:id')
  async getTemplateById(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<TemplateDetailsResponseDto> {
    return this.documentsService.getTemplateById(id);
  }

  @Put('templates/:id')
  async updateTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() templateData: UpdateTemplateDto
  ): Promise<TemplateResponseDto> {
    return this.documentsService.updateTemplate(id, templateData);
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.documentsService.deleteTemplate(id);
    return { message: 'Template deleted successfully' };
  }

  // Document generation endpoints
  @Post()
  async generateDocument(
    @Body() documentData: CreateDocumentDto,
    @Request() req: { user: User }
  ): Promise<DocumentResponseDto> {
    return this.documentsService.generateDocument(documentData, req.user);
  }

  @Post('invoices')
  async generateInvoice(
    @Body() data: GenerateInvoiceDto,
    @Request() req: { user: User }
  ): Promise<DocumentResponseDto> {
    return this.documentsService.generateInvoice(data, req.user);
  }

  @Post('bon-de-sortie')
  async generateBonDeSortie(
    @Body() data: GenerateBonDeSortieDto,
    @Request() req: { user: User }
  ): Promise<DocumentResponseDto> {
    return this.documentsService.generateBonDeSortie(data, req.user);
  }

  @Post('production-reports')
  async generateProductionReport(
    @Body() data: GenerateProductionReportDto,
    @Request() req: { user: User }
  ): Promise<DocumentResponseDto> {
    return this.documentsService.generateProductionReport(data, req.user);
  }

  // Document retrieval endpoints
  @Get()
  async getUserDocuments(
    @Request() req: { user: { userId: string } }
  ): Promise<DocumentResponseDto[]> {
    return this.documentsService.getUserDocuments(req.user.userId);
  }

  @Get(':id')
  async getDocumentById(@Param('id', ParseUUIDPipe) id: string): Promise<DocumentResponseDto> {
    return this.documentsService.getDocumentById(id);
  }

  @Get('download/:filePath')
  async downloadDocument(@Param('filePath') filePath: string, @Res() res: Response): Promise<void> {
    try {
      const file = await this.documentsService.getDocumentByPath(filePath);

      // Determine content type based on file extension
      const extension = filePath.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';

      if (extension === 'pdf') {
        contentType = 'application/pdf';
      } else if (extension === 'xlsx') {
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=${filePath}`);
      res.send(file);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Document not found or could not be downloaded');
    }
  }
}
