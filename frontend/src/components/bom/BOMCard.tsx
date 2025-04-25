import { Card, Typography, Button, Space, Tag, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { BOM } from "../../types/bom";

interface BOMCardProps {
  bom: BOM;
  onView: (bom: BOM) => void;
  onEdit: (bom: BOM) => void;
  onDelete: (bom: BOM) => void;
}

export function BOMCard({ bom, onView, onEdit, onDelete }: BOMCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      actions={[
        <Tooltip title={t("common.view")}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onView(bom)}
          />
        </Tooltip>,
        <Tooltip title={t("common.edit")}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(bom)}
          />
        </Tooltip>,
        <Tooltip title={t("common.delete")}>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(bom)}
          />
        </Tooltip>,
      ]}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {bom.name}
        </Typography.Title>

        <Typography.Text type="secondary">{bom.description}</Typography.Text>

        <Space>
          <Typography.Text>
            {t("bom.output")}: {bom.outputQuantity} {bom.outputUnit}
          </Typography.Text>
          <Typography.Text>
            {t("bom.materials")}: {bom.items.length}
          </Typography.Text>
        </Space>

        <Tag
          icon={bom.isActive ? <CheckCircleOutlined /> : <WarningOutlined />}
          color={bom.isActive ? "success" : "default"}
        >
          {bom.isActive ? t("common.active") : t("common.inactive")}
        </Tag>
      </Space>
    </Card>
  );
}
