import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, DocumentResponseDto } from './dto/document.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  async generateDocument(
    @Body() createDocumentDto: CreateDocumentDto,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.generateDocument(createDocumentDto);
  }

  @Get('download/:filePath')
  async downloadDocument(
    @Param('filePath') filePath: string,
    @Res() res: Response,
  ): Promise<void> {
    const file = await this.documentsService.getDocumentByPath(filePath);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${filePath}`,
    });
    res.end(file);
  }
}
