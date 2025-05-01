import { ApiProperty } from '@nestjs/swagger';

export class MaterialRequirementItemDto {
  @ApiProperty()
  materialId: string;

  @ApiProperty()
  materialName: string;

  @ApiProperty()
  requiredQuantity: number;

  @ApiProperty()
  unit: string;
}

export class MaterialRequirementsDto {
  @ApiProperty({ type: [MaterialRequirementItemDto] })
  items: MaterialRequirementItemDto[];
}

export class MaterialCostItemDto {
  @ApiProperty()
  materialId: string;

  @ApiProperty()
  materialName: string;

  @ApiProperty()
  requiredQuantity: number;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  unitCost: number;

  @ApiProperty()
  totalCost: number;
}

export class MaterialCostDto {
  @ApiProperty({ type: [MaterialCostItemDto] })
  items: MaterialCostItemDto[];

  @ApiProperty()
  totalCost: number;
}
