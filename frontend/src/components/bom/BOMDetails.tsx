import { useState } from "react";
import {
  Modal,
  Typography,
  InputNumber,
  Alert,
  Table,
  Space,
  Spin,
  Button,
} from "antd";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  BOM,
  MaterialRequirement,
  AvailabilityCheck,
  ProductionCost,
} from "../../types/bom";
import { bomApi } from "../../services/bomService";

const { Title, Text } = Typography;

interface BOMDetailsProps {
  open: boolean;
  onClose: () => void;
  bom: BOM;
}

export function BOMDetails({ open, onClose, bom }: BOMDetailsProps) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState<number>(bom.outputQuantity);

  const { data: requirements, isLoading: loadingRequirements } = useQuery({
    queryKey: ["bom-requirements", bom.id, quantity],
    queryFn: () => bomApi.getMaterialRequirements(bom.id, quantity),
    enabled: open,
  });

  const { data: availability, isLoading: loadingAvailability } = useQuery({
    queryKey: ["bom-availability", bom.id, quantity],
    queryFn: () => bomApi.checkAvailability(bom.id, quantity),
    enabled: open,
  });

  const { data: cost, isLoading: loadingCost } = useQuery({
    queryKey: ["bom-cost", bom.id, quantity],
    queryFn: () => bomApi.calculateCost(bom.id, quantity),
    enabled: open,
  });

  const isLoading = loadingRequirements || loadingAvailability || loadingCost;

  const materialReqColumns = [
    { title: t("bom.material"), dataIndex: ["product", "name"] },
    {
      title: t("bom.requiredQuantity"),
      dataIndex: "requiredQuantity",
      align: "right" as const,
    },
    { title: t("bom.unit"), dataIndex: "unit" },
  ];

  const shortageColumns = [
    { title: t("bom.material"), dataIndex: ["product", "name"] },
    {
      title: t("bom.required"),
      dataIndex: "required",
      align: "right" as const,
    },
    {
      title: t("bom.available"),
      dataIndex: "available",
      align: "right" as const,
    },
    {
      title: t("bom.shortage"),
      dataIndex: "shortage",
      align: "right" as const,
    },
    { title: t("bom.unit"), dataIndex: "unit" },
  ];

  const costColumns = [
    { title: t("bom.material"), dataIndex: ["product", "name"] },
    {
      title: t("bom.quantity"),
      dataIndex: "quantity",
      align: "right" as const,
    },
    { title: t("bom.unit"), dataIndex: "unit" },
    {
      title: t("bom.unitCost"),
      dataIndex: "unitCost",
      align: "right" as const,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: t("bom.totalCost"),
      dataIndex: "totalCost",
      align: "right" as const,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={`${t("bom.details")}: ${bom.name}`}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          {t("common.close")}
        </Button>,
      ]}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Text>{bom.description}</Text>

        <div>
          <Text>{t("bom.desiredQuantity")}</Text>
          <InputNumber
            value={quantity}
            onChange={(value) => setQuantity(Number(value))}
            min={0}
            step={0.01}
            style={{ marginLeft: 16 }}
          />
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Material Requirements */}
            <div>
              <Title level={5}>{t("bom.materialRequirements")}</Title>
              <Table
                columns={materialReqColumns}
                dataSource={requirements}
                pagination={false}
                rowKey={(record) => record.product.id}
              />
            </div>

            {/* Availability Check */}
            <div>
              <Title level={5}>{t("bom.availability")}</Title>
              {availability && (
                <>
                  <Alert
                    type={availability.isAvailable ? "success" : "warning"}
                    message={
                      availability.isAvailable
                        ? t("bom.materialsAvailable")
                        : t("bom.materialsShortage")
                    }
                    style={{ marginBottom: 16 }}
                  />
                  {!availability.isAvailable && (
                    <Table
                      columns={shortageColumns}
                      dataSource={availability.shortages}
                      pagination={false}
                      rowKey={(record) => record.product.id}
                    />
                  )}
                </>
              )}
            </div>

            {/* Cost Breakdown */}
            {cost && (
              <div>
                <Title level={5}>{t("bom.costBreakdown")}</Title>
                <Table
                  columns={costColumns}
                  dataSource={cost.costBreakdown}
                  pagination={false}
                  rowKey={(record) => record.product.id}
                  summary={() => (
                    <Table.Summary>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4} align="right">
                          <strong>{t("bom.totalMaterialCost")}:</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <strong>${cost.materialCost.toFixed(2)}</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4} align="right">
                          <strong>{t("bom.totalProductionCost")}:</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <strong>${cost.totalCost.toFixed(2)}</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              </div>
            )}
          </>
        )}
      </Space>
    </Modal>
  );
}
