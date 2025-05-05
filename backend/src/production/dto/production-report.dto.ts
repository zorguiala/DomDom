import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ReportPeriodDto {
  @ApiProperty({ description: 'Start date', example: '2023-01-01' })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'End date', example: '2023-01-31' })
  @IsString()
  @IsNotEmpty()
  endDate: string;
}

export class ProductionStatisticsDto extends ReportPeriodDto {
  @ApiProperty({
    description: 'Filter by BOM ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  bomId?: string;

  @ApiProperty({
    description: 'Filter by employee ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @ApiProperty({ description: 'Include wastage statistics', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  includeWastage?: boolean;

  @ApiProperty({
    description: 'Group by',
    example: 'daily',
    required: false,
    enum: ['daily', 'weekly', 'monthly'],
  })
  @IsEnum(['daily', 'weekly', 'monthly'])
  @IsOptional()
  groupBy?: 'daily' | 'weekly' | 'monthly' = 'daily';
}

export class ExportReportDto extends ProductionStatisticsDto {
  @ApiProperty({ description: 'Export format', example: 'pdf', enum: ['pdf', 'excel', 'csv'] })
  @IsEnum(['pdf', 'excel', 'csv'])
  @IsNotEmpty()
  format: 'pdf' | 'excel' | 'csv';

  @ApiProperty({
    description: 'Report title',
    example: 'Production Report - January 2023',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;
}

export class ProductionMetricsResult {
  @ApiProperty({ description: 'Efficiency percentage', example: 95.5 })
  efficiency: number;

  @ApiProperty({ description: 'Total completed orders', example: 120 })
  totalCompleted: number;

  @ApiProperty({ description: 'Total in-progress orders', example: 15 })
  totalInProgress: number;

  @ApiProperty({ description: 'Total planned orders', example: 30 })
  totalPlanned: number;

  @ApiProperty({ description: 'Average completion time in hours', example: 4.5 })
  averageCompletionTime: number;

  @ApiProperty({ description: 'Wastage percentage', example: 2.3 })
  wastagePercentage?: number;

  @ApiProperty({ description: 'On-time completion percentage', example: 90.5 })
  onTimePercentage?: number;

  @ApiProperty({ description: 'Quality check pass rate', example: 98.2 })
  qualityPassRate?: number;
}

export class ProductionTimeSeriesPoint {
  @ApiProperty({ description: 'Date point', example: '2023-01-01' })
  date: string;

  @ApiProperty({ description: 'Value', example: 120 })
  value: number;
}

export class ProductionTimeSeriesData {
  @ApiProperty({ description: 'Production quantity over time', type: [ProductionTimeSeriesPoint] })
  production: ProductionTimeSeriesPoint[];

  @ApiProperty({ description: 'Wastage over time', type: [ProductionTimeSeriesPoint] })
  wastage?: ProductionTimeSeriesPoint[];

  @ApiProperty({ description: 'Efficiency over time', type: [ProductionTimeSeriesPoint] })
  efficiency?: ProductionTimeSeriesPoint[];
}

export class ProductionDistributionItem {
  @ApiProperty({ description: 'Label', example: 'Bread' })
  label: string;

  @ApiProperty({ description: 'Value', example: 1200 })
  value: number;

  @ApiProperty({ description: 'Percentage', example: 42.5 })
  percentage: number;
}

export class ProductionStatisticsResult {
  @ApiProperty({ description: 'Overall metrics' })
  metrics: ProductionMetricsResult;

  @ApiProperty({ description: 'Time series data' })
  timeSeries: ProductionTimeSeriesData;

  @ApiProperty({ description: 'Production by product', type: [ProductionDistributionItem] })
  byProduct: ProductionDistributionItem[];

  @ApiProperty({ description: 'Production by employee', type: [ProductionDistributionItem] })
  byEmployee?: ProductionDistributionItem[];

  @ApiProperty({ description: 'Production by status', type: [ProductionDistributionItem] })
  byStatus: ProductionDistributionItem[];
}
