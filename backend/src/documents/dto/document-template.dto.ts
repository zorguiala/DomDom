import { IsString, IsEnum, IsObject, IsOptional, IsArray, IsBoolean } from 'class-validator';

export enum DocumentType {
  INVOICE = 'invoice',
  BON_DE_SORTIE = 'bon_de_sortie',
  BON_DE_LIVRAISON = 'bon_de_livraison',
  PRODUCTION_ORDER = 'production_order',
  REPORT = 'report',
  CUSTOM = 'custom',
  CONTRACT = 'contract',
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
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  requiredFields?: string[];
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
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  requiredFields?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TemplateResponseDto {
  id: string;
  name: string;
  type: DocumentType;
  description?: string;
  requiredFields?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class TemplateDetailsResponseDto extends TemplateResponseDto {
  content: string;
  metadata?: Record<string, any>;
}
