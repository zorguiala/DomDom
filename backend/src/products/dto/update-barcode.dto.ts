import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBarcodeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  barcode: string;
}
