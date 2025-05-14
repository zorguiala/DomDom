import React from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import { StockCount, StockCountItem } from "../../types/stock";

const { Text } = Typography;

interface StockCountRecordModalProps {
  visible: boolean;
  onClose: () => void;
  stockCount: StockCount | null;
  onSubmit: (values: any) => Promise<void>;
  form: any; // Form instance
}

const StockCountRecordModal: React.FC<StockCountRecordModalProps> = ({
  visible,
  onClose,
  stockCount,
  onSubmit,
  form,
}) => {
  const { t } = useTranslation();

  if (!stockCount) return null;

  return (
    <Modal
      title={t("stock.recordQuantities")}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <div style={{ marginBottom: 16 }}>
          <Text>{t("stock.recordInstructions")}</Text>
        </div>

        {stockCount.items.map((item) => (
          <div
            key={item.id}
            style={{
              marginBottom: 24,
              border: "1px solid #f0f0f0",
              padding: 16,
              borderRadius: 4,
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <Text strong>{item.productName}</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {item.sku}
              </Text>
            </div>

            <Form.Item
              name={`quantity-${item.id}`}
              label={t("stock.actualQuantity")}
              rules={[{ required: true, message: t("validation.required") }]}
              extra={`${t("stock.expected")}: ${item.expectedQuantity} ${
                item.unit
              }`}
            >
              <InputNumber
                min={0}
                step={1}
                style={{ width: "100%" }}
                addonAfter={item.unit}
              />
            </Form.Item>

            <Form.Item name={`notes-${item.id}`} label={t("common.notes")}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </div>
        ))}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {t("common.submit")}
            </Button>
            <Button onClick={onClose}>{t("common.cancel")}</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StockCountRecordModal;
