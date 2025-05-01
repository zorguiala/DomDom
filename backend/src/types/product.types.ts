import { Product } from '../entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

export class LowStockAlert {
  @ApiProperty({ description: 'Whether the product is below minimum stock level' })
  isLow: boolean;

  @ApiProperty({ description: 'Current stock quantity' })
  currentStock: number;

  @ApiProperty({ description: 'Minimum stock threshold' })
  minimumStock: number;

  @ApiProperty({ description: 'Product details', type: () => Product })
  product: Product;
}
