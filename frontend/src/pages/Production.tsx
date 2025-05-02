import { useState } from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Tabs,
  Button,
  Input,
  Select,
  Spin,
  notification,
  Space,
  Modal,
} from "antd";
import { PlusOutlined, FilterOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductionOrderList } from "../components/production/ProductionOrderList";
import { ProductionOrderForm } from "../components/production/ProductionOrderForm";
import { ProductionOrderDetails } from "../components/production/ProductionOrderDetails";
import { RecordProductionForm } from "../components/production/RecordProductionForm";
import { productionApi } from "../services/productionServices/productionApi";
import { ProductionOrder, ProductionOrderStatus } from "../types/production";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

export default function Production() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    ProductionOrderStatus | undefined
  >(undefined);
  const [selectedOrder, setSelectedOrder] = useState<
    ProductionOrder | undefined
  >();
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [recordFormOpen, setRecordFormOpen] = useState(false);

  // Queries
  const { data: { data: orders } = { data: [] }, isLoading } = useQuery({
    queryKey: ["production-orders", search, statusFilter],
    queryFn: () => productionApi.getAllOrders(statusFilter),
  });

  // Always use an array for orders, regardless of API response shape
  const orderList: ProductionOrder[] = Array.isArray(orders) ? orders : [];

  // Mutations
  const createOrder = useMutation({
    mutationFn: productionApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-orders"] });
      notification.success({ message: t("production.orderCreated") });
      handleCloseForm();
    },
    onError: () => {
      notification.error({ message: t("common.error") });
    },
  });

  const updateOrder = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productionApi.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-orders"] });
      notification.success({ message: t("production.orderUpdated") });
      handleCloseForm();
    },
    onError: () => {
      notification.error({ message: t("common.error") });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: ProductionOrderStatus;
    }) => productionApi.updateOrderStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-orders"] });
      notification.success({ message: t("production.statusUpdated") });
    },
    onError: () => {
      notification.error({ message: t("common.error") });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: productionApi.deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-orders"] });
      notification.success({ message: t("production.orderDeleted") });
    },
    onError: () => {
      notification.error({ message: t("common.error") });
    },
  });

  // Event Handlers
  const handleAddOrder = () => {
    setSelectedOrder(undefined);
    setFormOpen(true);
  };

  const handleEditOrder = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setFormOpen(true);
  };

  const handleViewOrder = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleRecordProduction = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setRecordFormOpen(true);
  };

  const handleDeleteOrder = (order: ProductionOrder) => {
    Modal.confirm({
      title: t("production.deleteConfirmation"),
      content: t("production.deleteWarning"),
      onOk: () => deleteOrder.mutate(order.id),
    });
  };

  const handleUpdateStatus = (
    order: ProductionOrder,
    status: ProductionOrderStatus
  ) => {
    updateOrderStatus.mutate({ id: order.id, status });
  };

  const handleSubmitOrder = (orderData: any) => {
    if (selectedOrder) {
      updateOrder.mutate({
        id: selectedOrder.id,
        data: orderData,
      });
    } else {
      createOrder.mutate(orderData);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedOrder(undefined);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedOrder(undefined);
  };

  const handleCloseRecordForm = () => {
    setRecordFormOpen(false);
  };

  const handleProductionRecorded = () => {
    queryClient.invalidateQueries({ queryKey: ["production-orders"] });
    queryClient.invalidateQueries({
      queryKey: ["production-order-details", selectedOrder?.id],
    });
    handleCloseRecordForm();
  };

  // Tabs items array for Ant Design v5+
  const tabItems = [
    {
      key: "all",
      label: t("production.allOrders"),
      children: (
        <>
          <div style={{ marginBottom: 16 }}>
            <Row gutter={16} align="middle">
              <Col xs={24} md={8}>
                <Search
                  placeholder={t("common.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} md={8}>
                <Select
                  style={{ width: "100%" }}
                  placeholder={t("production.filterByStatus")}
                  allowClear
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                >
                  <Option value={ProductionOrderStatus.PLANNED}>
                    {t("production.status.planned")}
                  </Option>
                  <Option value={ProductionOrderStatus.IN_PROGRESS}>
                    {t("production.status.inProgress")}
                  </Option>
                  <Option value={ProductionOrderStatus.COMPLETED}>
                    {t("production.status.completed")}
                  </Option>
                </Select>
              </Col>
            </Row>
          </div>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
            </div>
          ) : (
            <ProductionOrderList
              orders={orderList}
              onView={handleViewOrder}
              onEdit={handleEditOrder}
              onDelete={handleDeleteOrder}
              onUpdateStatus={handleUpdateStatus}
              onRecordProduction={handleRecordProduction}
            />
          )}
        </>
      ),
    },
    {
      key: "inProgress",
      label: t("production.inProgress"),
      children: isLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <ProductionOrderList
          orders={orderList.filter(
            (order) => order.status === ProductionOrderStatus.IN_PROGRESS
          )}
          onView={handleViewOrder}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
          onUpdateStatus={handleUpdateStatus}
          onRecordProduction={handleRecordProduction}
        />
      ),
    },
    {
      key: "planned",
      label: t("production.planned"),
      children: isLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <ProductionOrderList
          orders={orderList.filter(
            (order) => order.status === ProductionOrderStatus.PLANNED
          )}
          onView={handleViewOrder}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
          onUpdateStatus={handleUpdateStatus}
          onRecordProduction={handleRecordProduction}
        />
      ),
    },
    {
      key: "completed",
      label: t("production.completed"),
      children: isLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <ProductionOrderList
          orders={orderList.filter(
            (order) => order.status === ProductionOrderStatus.COMPLETED
          )}
          onView={handleViewOrder}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
          onUpdateStatus={handleUpdateStatus}
          onRecordProduction={handleRecordProduction}
        />
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={2}>{t("production.title")}</Title>

        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddOrder}>
          {t("production.createOrder")}
        </Button>
      </div>

      <Card>
        <Tabs defaultActiveKey="all" items={tabItems} />
      </Card>

      {/* Production Order Form Modal */}
      <ProductionOrderForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitOrder}
        initialData={selectedOrder}
      />

      {/* Production Order Details Modal */}
      {selectedOrder && detailsOpen && (
        <ProductionOrderDetails
          open={detailsOpen}
          onClose={handleCloseDetails}
          orderId={selectedOrder.id}
          onRecordProduction={handleRecordProduction}
          onUpdateStatus={(status) => handleUpdateStatus(selectedOrder, status)}
        />
      )}

      {/* Record Production Modal */}
      {selectedOrder && recordFormOpen && (
        <RecordProductionForm
          open={recordFormOpen}
          onClose={handleCloseRecordForm}
          orderId={selectedOrder.id}
          onSuccess={handleProductionRecorded}
        />
      )}
    </Space>
  );
}
