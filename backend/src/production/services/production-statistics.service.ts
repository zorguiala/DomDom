import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { ProductionOrder, ProductionOrderStatus } from '../../entities/production-order.entity';
import { ProductionRecord } from '../../entities/production-record.entity';
import { BOM } from '../../entities/bom.entity';
import { Employee } from '../../entities/employee.entity';
import {
  ProductionStatisticsDto,
  ExportReportDto,
  ProductionMetricsResult,
  ProductionTimeSeriesData,
  ProductionTimeSeriesPoint,
  ProductionDistributionItem,
  ProductionStatisticsResult
} from '../dto/production-report.dto';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import { format, subDays, eachDayOfInterval, differenceInBusinessDays, differenceInHours } from 'date-fns';

@Injectable()
export class ProductionStatisticsService {
  constructor(
    @InjectRepository(ProductionOrder)
    private productionOrderRepository: Repository<ProductionOrder>,
    @InjectRepository(ProductionRecord)
    private productionRecordRepository: Repository<ProductionRecord>,
    @InjectRepository(BOM)
    private bomRepository: Repository<BOM>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  /**
   * Get production statistics and metrics for a given period
   */
  async getProductionStatistics(statsDto: ProductionStatisticsDto): Promise<ProductionStatisticsResult> {
    const { startDate, endDate, bomId, employeeId, includeWastage, groupBy } = statsDto;
    
    // Get metrics
    const metrics = await this.getProductionMetrics(startDate, endDate, bomId, employeeId);
    
    // Get time series data
    const timeSeries = await this.getProductionTimeSeries(startDate, endDate, bomId, employeeId, groupBy, includeWastage);
    
    // Get production distribution by product
    const byProduct = await this.getProductionByProduct(startDate, endDate, employeeId);
    
    // Get production distribution by employee
    const byEmployee = employeeId ? undefined : await this.getProductionByEmployee(startDate, endDate, bomId);
    
    // Get production distribution by status
    const byStatus = await this.getProductionByStatus(startDate, endDate, bomId, employeeId);
    
    return {
      metrics,
      timeSeries,
      byProduct,
      byEmployee,
      byStatus,
    };
  }
  
  /**
   * Export production report based on statistics
   */
  async exportProductionReport(exportDto: ExportReportDto): Promise<Buffer> {
    const { format: exportFormat, title } = exportDto;
    
    // Get statistics
    const statistics = await this.getProductionStatistics(exportDto);
    
    if (exportFormat === 'excel') {
      return this.exportToExcel(statistics, title || 'Production Report');
    } else if (exportFormat === 'pdf') {
      return this.exportToPDF(statistics, title || 'Production Report');
    } else if (exportFormat === 'csv') {
      return this.exportToCSV(statistics, title || 'Production Report');
    }
    
    throw new Error(`Unsupported export format: ${exportFormat}`);
  }
  
  /**
   * Get production metrics for a given period
   */
  private async getProductionMetrics(
    startDate: string,
    endDate: string,
    bomId?: string,
    employeeId?: string,
  ): Promise<ProductionMetricsResult> {
    // Build query conditions
    const conditions: any = {
      createdAt: Between(new Date(startDate), new Date(endDate)),
    };
    
    if (bomId) {
      conditions.bom = { id: bomId };
    }
    
    // Get production orders
    const productionOrders = await this.productionOrderRepository.find({
      where: conditions,
      relations: ['bom', 'assignedTo', 'productionRecords'],
    });
    
    // Get production records
    const recordConditions: any = {
      startTime: Between(new Date(startDate), new Date(endDate)),
    };
    
    if (bomId) {
      recordConditions.bom = { id: bomId };
    }
    
    if (employeeId) {
      recordConditions.employee = { id: employeeId };
    }
    
    const productionRecords = await this.productionRecordRepository.find({
      where: recordConditions,
      relations: ['productionOrder', 'employee'],
    });
    
    // Calculate metrics
    const totalCompleted = productionOrders.filter(
      order => order.status === ProductionOrderStatus.COMPLETED
    ).length;
    
    const totalInProgress = productionOrders.filter(
      order => order.status === ProductionOrderStatus.IN_PROGRESS
    ).length;
    
    const totalPlanned = productionOrders.filter(
      order => order.status === ProductionOrderStatus.PLANNED
    ).length;
    
    // Calculate efficiency
    const totalCompletedOrders = productionOrders.filter(
      order => order.status === ProductionOrderStatus.COMPLETED && order.completedDate
    );
    
    let totalEfficiency = 0;
    let totalCompletionTime = 0;
    let totalQualityChecked = 0;
    let totalQualityPassed = 0;
    
    for (const order of totalCompletedOrders) {
      if (order.actualStartDate && order.completedDate) {
        // Calculate expected completion time based on BOM standard time
        const bom = order.bom as unknown as BOM;
        const plannedDays = bom.productionTimeInHours ?
          Math.ceil(order.quantity * bom.productionTimeInHours / 8) : // 8-hour workday
          differenceInBusinessDays(new Date(order.plannedStartDate), new Date(order.completedDate));
        
        // Calculate actual completion time
        const actualHours = differenceInHours(new Date(order.completedDate), new Date(order.actualStartDate));
        totalCompletionTime += actualHours;
        
        // If we have BOM standard time, calculate efficiency
        if (bom.productionTimeInHours) {
          const expectedHours = order.quantity * bom.productionTimeInHours;
          const efficiency = (expectedHours / actualHours) * 100;
          totalEfficiency += efficiency;
        }
      }
      
      // Quality metrics
      const qualityCheckedRecords = order.productionRecords.filter(record => record.qualityChecked);
      totalQualityChecked += qualityCheckedRecords.length;
      
      const qualityPassedRecords = qualityCheckedRecords.filter(
        record => !record.qualityNotes || !record.qualityNotes.toLowerCase().includes('issue')
      );
      totalQualityPassed += qualityPassedRecords.length;
    }
    
    const efficiency = totalCompletedOrders.length > 0 ? 
      totalEfficiency / totalCompletedOrders.length : 
      null;
    
    const averageCompletionTime = totalCompletedOrders.length > 0 ?
      totalCompletionTime / totalCompletedOrders.length :
      null;
    
    const qualityPassRate = totalQualityChecked > 0 ?
      (totalQualityPassed / totalQualityChecked) * 100 :
      null;
    
    // Wastage percentage
    const totalProduction = productionRecords.reduce((sum, record) => sum + record.quantity, 0);
    const totalWastage = productionRecords.reduce((sum, record) => sum + (record.wastage || 0), 0);
    const wastagePercentage = totalProduction > 0 ? (totalWastage / totalProduction) * 100 : 0;
    
    // On-time completion percentage
    const onTimeOrders = totalCompletedOrders.filter(order => {
      if (!order.completedDate || !order.plannedStartDate) return false;
      
      // Calculate expected completion date based on BOM standard time
      const plannedCompletionDate = new Date(order.plannedStartDate);
      const bom = order.bom as unknown as BOM;
      const days = bom.productionTimeInHours ?
        Math.ceil(order.quantity * bom.productionTimeInHours / 8) : // 8-hour workday
        5; // Default to 5 days if no standard time
      
      plannedCompletionDate.setDate(plannedCompletionDate.getDate() + days);
      
      return new Date(order.completedDate) <= plannedCompletionDate;
    });
    
    const onTimePercentage = totalCompletedOrders.length > 0 ?
      (onTimeOrders.length / totalCompletedOrders.length) * 100 :
      null;
    
    return {
      efficiency: efficiency || 0,
      totalCompleted,
      totalInProgress,
      totalPlanned,
      averageCompletionTime: averageCompletionTime || 0,
      wastagePercentage,
      onTimePercentage: onTimePercentage || 0,
      qualityPassRate: qualityPassRate || 0,
    };
  }
  
  /**
   * Get production time series data
   */
  private async getProductionTimeSeries(
    startDate: string,
    endDate: string,
    bomId?: string,
    employeeId?: string,
    groupBy: 'daily' | 'weekly' | 'monthly' = 'daily',
    includeWastage: boolean = false,
  ): Promise<ProductionTimeSeriesData> {
    // Get date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Build query conditions
    const conditions: any = {
      startTime: Between(start, end),
    };
    
    if (bomId) {
      conditions.bom = { id: bomId };
    }
    
    if (employeeId) {
      conditions.employee = { id: employeeId };
    }
    
    // Get production records
    const records = await this.productionRecordRepository.find({
      where: conditions,
      order: { startTime: 'ASC' },
    });
    
    // Group records by day
    const dateMap = new Map<string, { production: number; wastage: number }>();
    
    // Generate all dates in range
    const dateRange = eachDayOfInterval({ start, end });
    
    for (const date of dateRange) {
      const dateStr = format(date, 'yyyy-MM-dd');
      dateMap.set(dateStr, { production: 0, wastage: 0 });
    }
    
    // Add production data
    for (const record of records) {
      const dateStr = format(record.startTime, 'yyyy-MM-dd');
      const data = dateMap.get(dateStr);
      
      if (data) {
        data.production += record.quantity;
        data.wastage += record.wastage || 0;
      }
    }
    
    // Prepare time series data
    const production: ProductionTimeSeriesPoint[] = [];
    const wastage: ProductionTimeSeriesPoint[] = [];
    const efficiency: ProductionTimeSeriesPoint[] = [];
    
    // Sort dates
    const sortedDates = Array.from(dateMap.keys()).sort();
    
    for (const dateStr of sortedDates) {
      const data = dateMap.get(dateStr);
      
      if (data) {
        production.push({
          date: dateStr,
          value: data.production,
        });
        
        if (includeWastage) {
          wastage.push({
            date: dateStr,
            value: data.wastage,
          });
          
          // Calculate daily efficiency (percentage of non-wastage)
          const totalProduction = data.production + data.wastage;
          const efficiencyValue = totalProduction > 0 ?
            ((data.production / totalProduction) * 100) :
            0;
            
          efficiency.push({
            date: dateStr,
            value: efficiencyValue,
          });
        }
      }
    }
    
    return {
      production,
      ...(includeWastage ? { wastage, efficiency } : {}),
    };
  }
  
  /**
   * Get production distribution by product (BOM)
   */
  private async getProductionByProduct(
    startDate: string,
    endDate: string,
    employeeId?: string,
  ): Promise<ProductionDistributionItem[]> {
    // Build query conditions
    const conditions: any = {
      startTime: Between(new Date(startDate), new Date(endDate)),
    };
    
    if (employeeId) {
      conditions.employee = { id: employeeId };
    }
    
    // Get production records
    const records = await this.productionRecordRepository.find({
      where: conditions,
      relations: ['bom'],
    });
    
    // Group by BOM/product
    const bomMap = new Map<string, { 
      bomId: string; 
      name: string; 
      quantity: number; 
    }>();
    
    for (const record of records) {
      const bomId = record.bom.id;
      const existing = bomMap.get(bomId);
      
      if (existing) {
        existing.quantity += record.quantity;
      } else {
        bomMap.set(bomId, {
          bomId,
          name: record.bom.name,
          quantity: record.quantity,
        });
      }
    }
    
    // Calculate total
    const totalQuantity = Array.from(bomMap.values()).reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    
    // Prepare distribution items
    return Array.from(bomMap.values())
      .map(item => ({
        label: item.name,
        value: item.quantity,
        percentage: totalQuantity > 0 ? (item.quantity / totalQuantity) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value); // Sort by quantity in descending order
  }
  
  /**
   * Get production distribution by employee
   */
  private async getProductionByEmployee(
    startDate: string,
    endDate: string,
    bomId?: string,
  ): Promise<ProductionDistributionItem[]> {
    // Build query conditions
    const conditions: any = {
      startTime: Between(new Date(startDate), new Date(endDate)),
    };
    
    if (bomId) {
      conditions.bom = { id: bomId };
    }
    
    // Get production records
    const records = await this.productionRecordRepository.find({
      where: conditions,
      relations: ['employee'],
    });
    
    // Group by employee
    const employeeMap = new Map<string, { 
      employeeId: string;
      name: string; 
      quantity: number; 
    }>();
    
    for (const record of records) {
      if (!record.employee) continue;
      
      const employeeId = record.employee.id;
      const existing = employeeMap.get(employeeId);
      
      if (existing) {
        existing.quantity += record.quantity;
      } else {
        employeeMap.set(employeeId, {
          employeeId,
          name: `${record.employee.firstName} ${record.employee.lastName}`,
          quantity: record.quantity,
        });
      }
    }
    
    // Calculate total
    const totalQuantity = Array.from(employeeMap.values()).reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    
    // Prepare distribution items
    return Array.from(employeeMap.values())
      .map(item => ({
        label: item.name,
        value: item.quantity,
        percentage: totalQuantity > 0 ? (item.quantity / totalQuantity) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value); // Sort by quantity in descending order
  }
  
  /**
   * Get production distribution by status
   */
  private async getProductionByStatus(
    startDate: string,
    endDate: string,
    bomId?: string,
    employeeId?: string,
  ): Promise<ProductionDistributionItem[]> {
    // Build query conditions
    const conditions: any = {
      createdAt: Between(new Date(startDate), new Date(endDate)),
    };
    
    if (bomId) {
      conditions.bom = { id: bomId };
    }
    
    // Special handling for employee filtering (need to filter production records)
    let orderIdsWithEmployee: string[] = [];
    if (employeeId) {
      const records = await this.productionRecordRepository.find({
        where: { employee: { id: employeeId } },
        select: ['productionOrder'],
        relations: ['productionOrder'],
      });
      
      orderIdsWithEmployee = records.map(record => record.productionOrder.id);
      conditions.id = In(orderIdsWithEmployee);
    }
    
    // Get production orders
    const orders = await this.productionOrderRepository.find({
      where: conditions,
    });
    
    // Group by status
    const statusMap = new Map<ProductionOrderStatus, number>();
    
    // Initialize all statuses with zero
    Object.values(ProductionOrderStatus).forEach(status => {
      statusMap.set(status, 0);
    });
    
    // Count orders by status
    for (const order of orders) {
      const currentCount = statusMap.get(order.status) || 0;
      statusMap.set(order.status, currentCount + 1);
    }
    
    // Calculate total
    const totalOrders = orders.length;
    
    // Prepare distribution items
    return Array.from(statusMap.entries())
      .map(([status, count]) => ({
        label: status, // Could be translated/prettified here
        value: count,
        percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value); // Sort by count in descending order
  }
  
  /**
   * Export statistics to Excel
   */
  private async exportToExcel(statistics: ProductionStatisticsResult, title: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'DomDom';
    workbook.lastModifiedBy = 'DomDom';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Overview sheet
    const overviewSheet = workbook.addWorksheet('Overview');
    
    // Title
    overviewSheet.mergeCells('A1:D1');
    const titleCell = overviewSheet.getCell('A1');
    titleCell.value = title;
    titleCell.font = { size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center' };
    
    // Metrics
    overviewSheet.addRow([]);
    overviewSheet.addRow(['Metrics']);
    overviewSheet.addRow(['Efficiency', `${statistics.metrics.efficiency.toFixed(2)}%`]);
    overviewSheet.addRow(['Total Completed Orders', statistics.metrics.totalCompleted]);
    overviewSheet.addRow(['Total In-Progress Orders', statistics.metrics.totalInProgress]);
    overviewSheet.addRow(['Total Planned Orders', statistics.metrics.totalPlanned]);
    overviewSheet.addRow(['Average Completion Time (hours)', statistics.metrics.averageCompletionTime.toFixed(2)]);
    
    if (statistics.metrics.wastagePercentage !== undefined) {
      overviewSheet.addRow(['Wastage Percentage', `${statistics.metrics.wastagePercentage.toFixed(2)}%`]);
    }
    
    if (statistics.metrics.onTimePercentage !== undefined) {
      overviewSheet.addRow(['On-Time Completion', `${statistics.metrics.onTimePercentage.toFixed(2)}%`]);
    }
    
    if (statistics.metrics.qualityPassRate !== undefined) {
      overviewSheet.addRow(['Quality Pass Rate', `${statistics.metrics.qualityPassRate.toFixed(2)}%`]);
    }
    
    // By product
    if (statistics.byProduct.length > 0) {
      const productSheet = workbook.addWorksheet('By Product');
      productSheet.addRow(['Product', 'Quantity', 'Percentage']);
      
      for (const item of statistics.byProduct) {
        productSheet.addRow([item.label, item.value, `${item.percentage.toFixed(2)}%`]);
      }
    }
    
    // By employee
    if (statistics.byEmployee && statistics.byEmployee.length > 0) {
      const employeeSheet = workbook.addWorksheet('By Employee');
      employeeSheet.addRow(['Employee', 'Quantity', 'Percentage']);
      
      for (const item of statistics.byEmployee) {
        employeeSheet.addRow([item.label, item.value, `${item.percentage.toFixed(2)}%`]);
      }
    }
    
    // By status
    if (statistics.byStatus.length > 0) {
      const statusSheet = workbook.addWorksheet('By Status');
      statusSheet.addRow(['Status', 'Count', 'Percentage']);
      
      for (const item of statistics.byStatus) {
        statusSheet.addRow([item.label, item.value, `${item.percentage.toFixed(2)}%`]);
      }
    }
    
    // Time series
    if (statistics.timeSeries.production.length > 0) {
      const timeSeriesSheet = workbook.addWorksheet('Time Series');
      
      // Headers
      const headers = ['Date', 'Production'];
      
      if (statistics.timeSeries.wastage) {
        headers.push('Wastage');
      }
      
      if (statistics.timeSeries.efficiency) {
        headers.push('Efficiency (%)');
      }
      
      timeSeriesSheet.addRow(headers);
      
      // Data
      for (let i = 0; i < statistics.timeSeries.production.length; i++) {
        const row = [
          statistics.timeSeries.production[i].date,
          statistics.timeSeries.production[i].value,
        ];
        
        if (statistics.timeSeries.wastage) {
          row.push(statistics.timeSeries.wastage[i].value);
        }
        
        if (statistics.timeSeries.efficiency) {
          row.push(statistics.timeSeries.efficiency[i].value);
        }
        
        timeSeriesSheet.addRow(row);
      }
    }
    
    // Generate buffer
    return workbook.xlsx.writeBuffer() as unknown as Buffer;
  }
  
  /**
   * Export statistics to PDF
   */
  private async exportToPDF(statistics: ProductionStatisticsResult, title: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const chunks: Buffer[] = [];
        const doc = new PDFDocument();
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        
        // Title
        doc.fontSize(18).text(title, { align: 'center' });
        doc.moveDown();
        
        // Metrics
        doc.fontSize(14).text('Metrics');
        doc.moveDown(0.5);
        
        doc.fontSize(12).text(`Efficiency: ${statistics.metrics.efficiency.toFixed(2)}%`);
        doc.fontSize(12).text(`Total Completed Orders: ${statistics.metrics.totalCompleted}`);
        doc.fontSize(12).text(`Total In-Progress Orders: ${statistics.metrics.totalInProgress}`);
        doc.fontSize(12).text(`Total Planned Orders: ${statistics.metrics.totalPlanned}`);
        doc.fontSize(12).text(`Average Completion Time: ${statistics.metrics.averageCompletionTime.toFixed(2)} hours`);
        
        if (statistics.metrics.wastagePercentage !== undefined) {
          doc.fontSize(12).text(`Wastage Percentage: ${statistics.metrics.wastagePercentage.toFixed(2)}%`);
        }
        
        if (statistics.metrics.onTimePercentage !== undefined) {
          doc.fontSize(12).text(`On-Time Completion: ${statistics.metrics.onTimePercentage.toFixed(2)}%`);
        }
        
        if (statistics.metrics.qualityPassRate !== undefined) {
          doc.fontSize(12).text(`Quality Pass Rate: ${statistics.metrics.qualityPassRate.toFixed(2)}%`);
        }
        
        doc.moveDown();
        
        // By product
        if (statistics.byProduct.length > 0) {
          doc.fontSize(14).text('Production by Product');
          doc.moveDown(0.5);
          
          for (const item of statistics.byProduct) {
            doc.fontSize(12).text(`${item.label}: ${item.value} (${item.percentage.toFixed(2)}%)`);
          }
          
          doc.moveDown();
        }
        
        // By employee
        if (statistics.byEmployee && statistics.byEmployee.length > 0) {
          doc.fontSize(14).text('Production by Employee');
          doc.moveDown(0.5);
          
          for (const item of statistics.byEmployee) {
            doc.fontSize(12).text(`${item.label}: ${item.value} (${item.percentage.toFixed(2)}%)`);
          }
          
          doc.moveDown();
        }
        
        // By status
        if (statistics.byStatus.length > 0) {
          doc.fontSize(14).text('Production by Status');
          doc.moveDown(0.5);
          
          for (const item of statistics.byStatus) {
            doc.fontSize(12).text(`${item.label}: ${item.value} (${item.percentage.toFixed(2)}%)`);
          }
          
          doc.moveDown();
        }
        
        // Finalize the PDF
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
  
  /**
   * Export statistics to CSV
   */
  private async exportToCSV(statistics: ProductionStatisticsResult, title: string): Promise<Buffer> {
    let csv = `${title}\n\n`;
    
    // Metrics
    csv += 'Metrics\n';
    csv += `Efficiency,${statistics.metrics.efficiency.toFixed(2)}%\n`;
    csv += `Total Completed Orders,${statistics.metrics.totalCompleted}\n`;
    csv += `Total In-Progress Orders,${statistics.metrics.totalInProgress}\n`;
    csv += `Total Planned Orders,${statistics.metrics.totalPlanned}\n`;
    csv += `Average Completion Time (hours),${statistics.metrics.averageCompletionTime.toFixed(2)}\n`;
    
    if (statistics.metrics.wastagePercentage !== undefined) {
      csv += `Wastage Percentage,${statistics.metrics.wastagePercentage.toFixed(2)}%\n`;
    }
    
    if (statistics.metrics.onTimePercentage !== undefined) {
      csv += `On-Time Completion,${statistics.metrics.onTimePercentage.toFixed(2)}%\n`;
    }
    
    if (statistics.metrics.qualityPassRate !== undefined) {
      csv += `Quality Pass Rate,${statistics.metrics.qualityPassRate.toFixed(2)}%\n`;
    }
    
    csv += '\n';
    
    // By product
    if (statistics.byProduct.length > 0) {
      csv += 'Production by Product\n';
      csv += 'Product,Quantity,Percentage\n';
      
      for (const item of statistics.byProduct) {
        csv += `${item.label},${item.value},${item.percentage.toFixed(2)}%\n`;
      }
      
      csv += '\n';
    }
    
    // By employee
    if (statistics.byEmployee && statistics.byEmployee.length > 0) {
      csv += 'Production by Employee\n';
      csv += 'Employee,Quantity,Percentage\n';
      
      for (const item of statistics.byEmployee) {
        csv += `${item.label},${item.value},${item.percentage.toFixed(2)}%\n`;
      }
      
      csv += '\n';
    }
    
    // By status
    if (statistics.byStatus.length > 0) {
      csv += 'Production by Status\n';
      csv += 'Status,Count,Percentage\n';
      
      for (const item of statistics.byStatus) {
        csv += `${item.label},${item.value},${item.percentage.toFixed(2)}%\n`;
      }
      
      csv += '\n';
    }
    
    // Time series
    if (statistics.timeSeries.production.length > 0) {
      csv += 'Time Series\n';
      
      // Headers
      let headers = 'Date,Production';
      
      if (statistics.timeSeries.wastage) {
        headers += ',Wastage';
      }
      
      if (statistics.timeSeries.efficiency) {
        headers += ',Efficiency (%)';
      }
      
      csv += headers + '\n';
      
      // Data
      for (let i = 0; i < statistics.timeSeries.production.length; i++) {
        let row = `${statistics.timeSeries.production[i].date},${statistics.timeSeries.production[i].value}`;
        
        if (statistics.timeSeries.wastage) {
          row += `,${statistics.timeSeries.wastage[i].value}`;
        }
        
        if (statistics.timeSeries.efficiency) {
          row += `,${statistics.timeSeries.efficiency[i].value}`;
        }
        
        csv += row + '\n';
      }
    }
    
    return Buffer.from(csv, 'utf8');
  }
} 