import { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Row,
  Col,
  Space,
} from "antd";
import { useTranslation } from "react-i18next";
import { Product } from "../../types/inventory";

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={initialData}
      autoComplete="off"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label={t("inventory.name")}
            rules={[{ required: true, message: t("common.required") }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="sku"
            label={t("inventory.sku")}
            rules={[{ required: true, message: t("common.required") }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="barcode" label={t("inventory.barcode")}>
        {" "}
        <Input />{" "}
      </Form.Item>
      <Form.Item name="description" label={t("inventory.description")}>
        {" "}
        <Input.TextArea rows={2} />{" "}
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="price"
            label={t("inventory.price")}
            rules={[{ required: true, message: t("common.required") }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="unit"
            label={t("inventory.unit")}
            rules={[{ required: true, message: t("common.required") }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="currentStock"
            label={t("inventory.currentStock")}
            rules={[{ required: true, message: t("common.required") }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="minimumStock"
            label={t("inventory.minimumStock")}
            rules={[{ required: true, message: t("common.required") }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="isRawMaterial" valuePropName="checked">
        <Switch
          checkedChildren={t("inventory.isRawMaterial")}
          unCheckedChildren={t("inventory.isProduct")}
        />
      </Form.Item>
      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
        <Button onClick={onCancel}>{t("common.cancel")}</Button>
        <Button type="primary" htmlType="submit">
          {t("common.save")}
        </Button>
      </Space>
    </Form>
  );
}
