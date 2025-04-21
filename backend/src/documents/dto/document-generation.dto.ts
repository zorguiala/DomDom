import { IsString, IsEnum, IsObject, IsOptional } from 'class-validator';
import { DocumentFormat } from './document-template.dto';

export class GenerateDocumentDto {
  @IsString()
  templateId: string;

  @IsObject()
  data: Record<string, any>;

  @IsEnum(DocumentFormat)
  format: DocumentFormat;

  @IsOptional()
  @IsString()
  filename?: string;
}
