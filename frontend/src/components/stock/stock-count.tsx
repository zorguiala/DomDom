import React from "react";
import { Table, Button, Card, Typography, Space, Input } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useStock } from "../../hooks/useStock";
import { useStockCount } from "../../hooks/useStockCount";
import { useStockCountForms } from "../../hooks/useStockCountForms";
import { useSearch } from "../../hooks/useSearch";
import { StockCount as StockCountType } from "../../types/stock";
import StockCountDetailsModal from "./stock-count-details-modal";
import StockCountRecordModal from "./stock-count-record-modal";
import StockCountCreateModal from "./stock-count-create-modal";
import { getStockCountColumns } from "./stock-count-columns";

const { Title } = Typography;

const StockCount: React.FC = () => {
  const { t } = useTranslation();
  const { products } = useStock();
  const {
    stockCounts,
    loading,
    createStockCount,
    startStockCount,
    recordQuantities,
  } = useStockCount();

  // Use custom hook for form handling and modal state
  const {
    form,
    recordForm,
    createModalVisible,
    countDetailsVisible,
    recordModalVisible,
    selectedCount,
    setCreateModalVisible,
    setCountDetailsVisible,
    setRecordModalVisible,
    handleViewCount,
    handleRecordQuantities,
    handleCreateCount,
    handleSubmitQuantities,
  } = useStockCountForms(createStockCount, recordQuantities);

  // Use search hook for filtering stock counts
  const {
    searchText,
    setSearchText,
    filteredItems: filteredCounts,
  } = useSearch<StockCountType>(stockCounts, (count, text) =>
    count.name.toLowerCase().includes(text.toLowerCase())
  );

  // Get table columns with handlers
  const columns = getStockCountColumns({
    t,
    handleViewCount,
    handleRecordQuantities,
    startStockCount,
  });

  return (
    <div className="stock-count">
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Title level={3}>{t("stock.inventoryCounts")}</Title>
          <Space>
            <Input
              placeholder={t("common.search")}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              {t("stock.newCount")}
            </Button>
          </Space>
        </div>

        <Table
          dataSource={filteredCounts}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modals */}
      <StockCountCreateModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateCount}
        form={form}
        products={products}
      />

      <StockCountDetailsModal
        visible={countDetailsVisible}
        onClose={() => setCountDetailsVisible(false)}
        stockCount={selectedCount}
      />

      <StockCountRecordModal
        visible={recordModalVisible}
        onClose={() => setRecordModalVisible(false)}
        stockCount={selectedCount}
        onSubmit={handleSubmitQuantities}
        form={recordForm}
      />
    </div>
  );
};

export default StockCount;
