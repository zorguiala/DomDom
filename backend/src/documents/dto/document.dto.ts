import {
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
  IsArray,
  IsNumber,
  ValidateNested,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentType, DocumentFormat } from './document-template.dto';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsEnum(DocumentFormat)
  format: DocumentFormat;

  @IsOptional()
  @IsObject()
  content?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;
}

export class DocumentResponseDto {
  id: string;
  documentType: DocumentType;
  title: string;
  filePath: string;
  createdAt: Date;
  metadata?: Record<string, any>;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export class DocumentItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;
}

export class GenerateInvoiceDto {
  @IsUUID()
  saleId: string;

  @IsEnum(DocumentFormat)
  format: DocumentFormat;

  @IsOptional()
  @IsUUID()
  templateId?: string;
}

export class GenerateBonDeSortieDto {
  @IsNotEmpty()
  @IsString()
  reference: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentItemDto)
  items: DocumentItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsEnum(DocumentFormat)
  format: DocumentFormat;

  @IsOptional()
  @IsUUID()
  templateId?: string;
}

export class GenerateProductionReportDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsEnum(DocumentFormat)
  format: DocumentFormat;

  @IsOptional()
  @IsUUID()
  bomId?: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;
}
