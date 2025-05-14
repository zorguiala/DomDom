import React from "react";
import { Modal, Form, Input, DatePicker, Select, Button, Space } from "antd";
import { useTranslation } from "react-i18next";
import { Product } from "../../types/stock";

const { Option } = Select;

interface StockCountCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  form: any; // Form instance
  products: Product[];
}

const StockCountCreateModal: React.FC<StockCountCreateModalProps> = ({
  visible,
  onClose,
  onSubmit,
  form,
  products,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t("stock.createNewCount")}
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label={t("stock.countName")}
          rules={[{ required: true, message: t("validation.required") }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="scheduledDate"
          label={t("stock.scheduledDate")}
          rules={[{ required: true, message: t("validation.required") }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="products"
          label={t("stock.productsToCount")}
          rules={[{ required: true, message: t("validation.required") }]}
        >
          <Select
            mode="multiple"
            placeholder={t("stock.selectProducts")}
            style={{ width: "100%" }}
          >
            {products.map((product) => (
              <Option key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="notes" label={t("common.notes")}>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {t("common.create")}
            </Button>
            <Button onClick={onClose}>{t("common.cancel")}</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StockCountCreateModal;
