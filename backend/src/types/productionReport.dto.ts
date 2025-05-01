import { ApiProperty } from '@nestjs/swagger';

export class ProductionReportItemDto {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  bomName: string;

  @ApiProperty()
  employeeName: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ type: String, format: 'date-time' })
  date: Date;
}

export class ProductionReportDto {
  @ApiProperty({ type: [ProductionReportItemDto] })
  items: ProductionReportItemDto[];

  @ApiProperty()
  totalQuantity: number;
}
