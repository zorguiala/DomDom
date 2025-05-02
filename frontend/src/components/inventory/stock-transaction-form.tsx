import { useState } from "react";
import { Form, InputNumber, Input, Button, Space, notification } from "antd";
import { useTranslation } from "react-i18next";
import { inventoryApi } from "../../services/inventoryService";
import { Product } from "../../types/inventory";

interface StockTransactionFormProps {
  product?: Product;
  type: "in" | "out";
  onSuccess: () => void;
  onCancel: () => void;
}

export function StockTransactionForm({
  product,
  type,
  onSuccess,
  onCancel,
}: StockTransactionFormProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values: {
    quantity: number;
    unitPrice: number;
    reference?: string;
    notes?: string;
  }) => {
    if (!product) return;
    setLoading(true);
    try {
      await inventoryApi.getTransactions(); // Optionally validate product exists
      await inventoryApi.createTransaction({
        productId: product.id,
        type: type === "in" ? "IN" : "OUT",
        quantity: values.quantity,
        unitPrice: values.unitPrice,
        reference: values.reference,
        notes: values.notes,
      });
      notification.success({ message: t("inventory.transactionSuccess") });
      onSuccess();
    } catch (e) {
      notification.error({ message: t("common.error") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      autoComplete="off"
    >
      <Form.Item label={t("inventory.product")}>
        <Input value={product?.name} disabled />
      </Form.Item>
      <Form.Item
        name="quantity"
        label={t("inventory.quantity")}
        rules={[{ required: true, message: t("common.required") }]}
      >
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="unitPrice"
        label={t("inventory.unitPrice")}
        rules={[{ required: true, message: t("common.required") }]}
      >
        <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="reference" label={t("inventory.reference")}>
        {" "}
        <Input />{" "}
      </Form.Item>
      <Form.Item name="notes" label={t("inventory.notes")}>
        {" "}
        <Input.TextArea rows={2} />{" "}
      </Form.Item>
      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
        <Button onClick={onCancel}>{t("common.cancel")}</Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {t("common.save")}
        </Button>
      </Space>
    </Form>
  );
}
