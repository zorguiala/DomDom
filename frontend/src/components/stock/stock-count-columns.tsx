import React from "react";
import { Button, Space, Tag, Tooltip, message } from "antd";
import {
  EditOutlined,
  CheckOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { TFunction } from "i18next";
import { StockCount } from "../../types/stock";

interface StockCountColumnsProps {
  t: TFunction;
  handleViewCount: (count: StockCount) => void;
  handleRecordQuantities: (count: StockCount) => void;
  startStockCount: (id: string) => Promise<StockCount | null>;
}

export const getStockCountColumns = ({
  t,
  handleViewCount,
  handleRecordQuantities,
  startStockCount,
}: StockCountColumnsProps) => [
  {
    title: t("stock.countName"),
    dataIndex: "name",
    key: "name",
    sorter: (a: StockCount, b: StockCount) => a.name.localeCompare(b.name),
  },
  {
    title: t("stock.status"),
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      let color = "";
      let text = "";

      switch (status) {
        case "draft":
          color = "default";
          text = t("stock.statusDraft");
          break;
        case "in_progress":
          color = "processing";
          text = t("stock.statusInProgress");
          break;
        case "completed":
          color = "success";
          text = t("stock.statusCompleted");
          break;
        case "reconciled":
          color = "cyan";
          text = t("stock.statusReconciled");
          break;
        default:
          color = "default";
          text = status;
      }

      return <Tag color={color}>{text}</Tag>;
    },
  },
  {
    title: t("stock.scheduledDate"),
    dataIndex: "scheduledDate",
    key: "scheduledDate",
    render: (date: string) => new Date(date).toLocaleDateString(),
    sorter: (a: StockCount, b: StockCount) =>
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime(),
  },
  {
    title: t("stock.createdBy"),
    dataIndex: "createdBy",
    key: "createdBy",
  },
  {
    title: t("common.actions"),
    key: "actions",
    render: (_: any, record: StockCount) => (
      <Space size="small">
        <Tooltip title={t("common.view")}>
          <Button
            type="text"
            icon={<FileTextOutlined />}
            onClick={() => handleViewCount(record)}
          />
        </Tooltip>

        {record.status === "in_progress" && (
          <Tooltip title={t("stock.recordQuantities")}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleRecordQuantities(record)}
            />
          </Tooltip>
        )}

        {record.status === "draft" && (
          <Tooltip title={t("stock.startCount")}>
            <Button
              type="text"
              icon={<CheckOutlined />}
              onClick={async () => {
                try {
                  await startStockCount(record.id);
                  message.success(t("stock.countStarted"));
                } catch (err) {
                  console.error("Error starting count:", err);
                  message.error(t("common.errorOccurred"));
                }
              }}
            />
          </Tooltip>
        )}
      </Space>
    ),
  },
];
