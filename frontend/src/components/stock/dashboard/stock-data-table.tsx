import React from "react";
import { Card, Table } from "antd";
import { LineChartOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";

interface StockDataTableProps<T> {
  title: string;
  dataSource: T[];
  columns: ColumnsType<T>;
  rowKey: string;
}

function StockDataTable<T extends Record<string, any>>({
  title,
  dataSource,
  columns,
  rowKey,
}: StockDataTableProps<T>) {
  return (
    <Card
      title={title}
      extra={<LineChartOutlined />}
      style={{ marginBottom: 16 }}
    >
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        rowKey={rowKey}
      />
    </Card>
  );
}

export default StockDataTable;
