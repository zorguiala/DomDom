import React from "react";
import { Modal, Button, Typography, Space, Tag, Table, Tabs } from "antd";
import { useTranslation } from "react-i18next";
import { StockCount, StockCountItem } from "../../types/stock";

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface StockCountDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  stockCount: StockCount | null;
}

const StockCountDetailsModal: React.FC<StockCountDetailsModalProps> = ({
  visible,
  onClose,
  stockCount,
}) => {
  const { t } = useTranslation();

  if (!stockCount) return null;

  return (
    <Modal
      title={stockCount.name}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          {t("common.close")}
        </Button>,
      ]}
      width={800}
    >
      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="small">
          <Text strong>{t("stock.status")}:</Text>
          <Tag
            color={
              stockCount.status === "draft"
                ? "default"
                : stockCount.status === "in_progress"
                ? "processing"
                : stockCount.status === "completed"
                ? "success"
                : "cyan"
            }
          >
            {t(
              `stock.status${
                stockCount.status.charAt(0).toUpperCase() +
                stockCount.status.slice(1)
              }`
            )}
          </Tag>

          <Text strong>{t("stock.scheduledDate")}:</Text>
          <Text>{new Date(stockCount.scheduledDate).toLocaleDateString()}</Text>

          <Text strong>{t("stock.createdBy")}:</Text>
          <Text>{stockCount.createdBy}</Text>

          {stockCount.completedBy && (
            <>
              <Text strong>{t("stock.completedBy")}:</Text>
              <Text>{stockCount.completedBy}</Text>
            </>
          )}

          {stockCount.notes && (
            <>
              <Text strong>{t("common.notes")}:</Text>
              <Text>{stockCount.notes}</Text>
            </>
          )}
        </Space>
      </div>

      <Tabs defaultActiveKey="items">
        <TabPane tab={t("stock.countItems")} key="items">
          <Table
            dataSource={stockCount.items}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: t("stock.product"),
                dataIndex: "productName",
                key: "productName",
              },
              {
                title: t("stock.sku"),
                dataIndex: "sku",
                key: "sku",
              },
              {
                title: t("stock.expectedQuantity"),
                dataIndex: "expectedQuantity",
                key: "expectedQuantity",
                render: (qty: number, record: StockCountItem) => (
                  <span>
                    {qty} {record.unit}
                  </span>
                ),
              },
              {
                title: t("stock.actualQuantity"),
                dataIndex: "actualQuantity",
                key: "actualQuantity",
                render: (qty: number | undefined, record: StockCountItem) => (
                  <span>
                    {qty !== undefined ? `${qty} ${record.unit}` : "-"}
                  </span>
                ),
              },
              {
                title: t("stock.variance"),
                dataIndex: "variance",
                key: "variance",
                render: (
                  variance: number | undefined,
                  record: StockCountItem
                ) => {
                  if (variance === undefined) return "-";

                  const color =
                    variance < 0 ? "red" : variance > 0 ? "green" : "";
                  return (
                    <span style={{ color }}>
                      {variance > 0 ? "+" : ""}
                      {variance} {record.unit}
                      {record.variancePercentage !== undefined && (
                        <span style={{ marginLeft: 8 }}>
                          ({variance > 0 ? "+" : ""}
                          {record.variancePercentage.toFixed(2)}%)
                        </span>
                      )}
                    </span>
                  );
                },
              },
              {
                title: t("common.notes"),
                dataIndex: "notes",
                key: "notes",
                render: (notes: string | undefined) => notes || "-",
              },
            ]}
          />
        </TabPane>

        {stockCount.status === "completed" && (
          <TabPane tab={t("stock.summary")} key="summary">
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>{t("stock.countSummary")}</Title>

              <Space direction="vertical" size="small">
                <Text>
                  {t("stock.totalItems")}: {stockCount.items.length}
                </Text>

                <Text>
                  {t("stock.itemsWithVariance")}:{" "}
                  {
                    stockCount.items.filter(
                      (item) =>
                        item.variance !== 0 && item.variance !== undefined
                    ).length
                  }
                </Text>

                <Text>
                  {t("stock.significantVariances")}:{" "}
                  {
                    stockCount.items.filter(
                      (item) =>
                        item.variancePercentage !== undefined &&
                        Math.abs(item.variancePercentage) > 5
                    ).length
                  }
                </Text>
              </Space>
            </div>
          </TabPane>
        )}
      </Tabs>
    </Modal>
  );
};

export default StockCountDetailsModal;
