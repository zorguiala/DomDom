import { ApiProperty } from '@nestjs/swagger';

export class ProductionOutputDto {
  @ApiProperty({ type: String, format: 'date-time' })
  date: Date;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        product: { type: 'string' },
        quantity: { type: 'number' },
      },
    },
  })
  outputs: { product: string; quantity: number }[];

  @ApiProperty({ type: 'number' })
  totalOutput: number;
}
