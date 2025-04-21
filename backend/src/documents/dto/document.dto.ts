import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentType: string; // e.g., 'bon-de-sortie', 'invoice', etc.

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsObject()
  metadata: Record<string, any>; // Flexible metadata for different document types

  @IsOptional()
  @IsObject()
  content: Record<string, any>; // Document specific content
}

export class DocumentResponseDto {
  id: number;
  documentType: string;
  title: string;
  filePath?: string;
  createdAt: Date;
  metadata: Record<string, any>;
}
