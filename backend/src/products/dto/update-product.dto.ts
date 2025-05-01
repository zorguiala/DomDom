import { PartialType } from '@nestjs/mapped-types';
import { BaseProductDto } from './base-product.dto';

export class UpdateProductDto extends PartialType(BaseProductDto) {}
