import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductAssignmentDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;
}

export class AgentAssignmentDto {
  @IsString()
  agentId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAssignmentDto)
  assignments: ProductAssignmentDto[];
}

export class ProductReturnDto {
  @IsString()
  productId: string;

  @IsNumber()
  returnedQuantity: number;

  @IsNumber()
  soldQuantity: number;

  @IsNumber()
  unitPrice: number;
}

export class AgentReturnDto {
  @IsString()
  agentId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductReturnDto)
  returns: ProductReturnDto[];
}
