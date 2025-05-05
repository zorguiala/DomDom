import api from "./api";
import {
  ProductionOrder,
  ProductionRecord,
  ProductionProgress,
  RecordProductionDto,
  ProductionStats,
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  UpdateProductionOrderStatusDto,
  BatchStatus,
  QualityControlStats,
  ProductionRecordsFilterDto,
  FilterProductionOrdersDto,
  NotificationsFilterDto,
  Notification,
  ProductionStatisticsDto,
  ExportReportDto,
  CreateProductionRecordDto,
  ProductionOrderPagination,
} from "../types/production";

class ProductionService {
  // Production Orders
  async getProductionOrders(filters: FilterProductionOrdersDto = {}): Promise<ProductionOrderPagination> {
    const response = await api.get("/production/orders", { params: filters });
    return response.data;
  }

  async getProductionOrder(id: string): Promise<ProductionOrder> {
    const response = await api.get(`/production/orders/${id}`);
    return response.data;
  }

  async createProductionOrder(dto: CreateProductionOrderDto): Promise<ProductionOrder> {
    const response = await api.post("/production/orders", dto);
    return response.data;
  }

  async updateProductionOrder(id: string, dto: UpdateProductionOrderDto): Promise<ProductionOrder> {
    const response = await api.put(`/production/orders/${id}`, dto);
    return response.data;
  }

  async updateProductionOrderStatus(id: string, dto: UpdateProductionOrderStatusDto): Promise<ProductionOrder> {
    const response = await api.put(`/production/orders/${id}/status`, dto);
    return response.data;
  }

  async deleteProductionOrder(id: string): Promise<void> {
    await api.delete(`/production/orders/${id}`);
  }

  async getProductionProgress(id: string): Promise<ProductionProgress> {
    const response = await api.get(`/production/orders/${id}/progress`);
    return response.data;
  }

  async recordProduction(orderId: string, dto: RecordProductionDto): Promise<ProductionOrder> {
    const response = await api.post(`/production/orders/${orderId}/output`, dto);
    return response.data;
  }

  // Batch Tracking
  async getBatchStatus(productionOrderId: string): Promise<BatchStatus> {
    const response = await api.get(`/production/orders/${productionOrderId}/batch-status`);
    return response.data;
  }

  async getRecordsByBatch(productionOrderId: string): Promise<{
    batchNumber: string;
    quantity: number;
    qualityChecked: boolean;
    records: ProductionRecord[];
  }[]> {
    const response = await api.get(`/production/orders/${productionOrderId}/records-by-batch`);
    return response.data;
  }

  // Production Records
  async getProductionRecords(filters: ProductionRecordsFilterDto = {}): Promise<ProductionRecord[]> {
    const response = await api.get("/production/records", { params: filters });
    return response.data;
  }

  async getProductionRecord(id: string): Promise<ProductionRecord> {
    const response = await api.get(`/production/records/${id}`);
    return response.data;
  }

  async createProductionRecord(dto: CreateProductionRecordDto): Promise<ProductionRecord> {
    const response = await api.post("/production/records", dto);
    return response.data;
  }

  async updateProductionRecord(id: string, dto: Partial<CreateProductionRecordDto>): Promise<ProductionRecord> {
    const response = await api.patch(`/production/records/${id}`, dto);
    return response.data;
  }

  async deleteProductionRecord(id: string): Promise<void> {
    await api.delete(`/production/records/${id}`);
  }

  // Quality Control
  async getQualityControlStats(filters: ProductionRecordsFilterDto = {}): Promise<QualityControlStats> {
    const response = await api.get("/production/quality-statistics", { params: filters });
    return response.data;
  }

  // Notifications
  async getNotifications(filters: NotificationsFilterDto = {}): Promise<Notification[]> {
    const response = await api.get("/production/notifications", { params: filters });
    return response.data;
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const response = await api.patch(`/production/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await api.patch(`/production/notifications/mark-all-read/${userId}`);
  }

  // Statistics and Reporting
  async getProductionStatistics(dto: ProductionStatisticsDto): Promise<any> {
    const response = await api.post("/production/statistics", dto);
    return response.data;
  }

  async exportProductionReport(dto: ExportReportDto): Promise<Blob> {
    const response = await api.post("/production/export", dto, {
      responseType: "blob"
    });
    return response.data;
  }
}

export default new ProductionService();
