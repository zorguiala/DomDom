import { IsString, IsEnum, IsObject, IsOptional, IsArray } from 'class-validator';

export enum DocumentType {
  INVOICE = 'invoice',
  BON_DE_SORTIE = 'bon_de_sortie',
  BON_DE_LIVRAISON = 'bon_de_livraison',
  PRODUCTION_ORDER = 'production_order',
  REPORT = 'report',
  CUSTOM = 'custom',
}

export enum DocumentFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
}

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsEnum(DocumentType)
  type: DocumentType;

  @IsString()
  content: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsArray()
  requiredFields?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsArray()
  requiredFields?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}
