import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  Button,
  Space,
  InputNumber,
  Row,
  Col,
} from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Product } from "../../types/inventory";
import { BarcodeScanner } from "./BarcodeScanner";

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Product) => void;
  initialData?: Product;
}

const defaultProduct: Product = {
  name: "",
  sku: "",
  description: "",
  barcode: "",
  price: 0,
  currentStock: 0,
  minimumStock: 0,
  unit: "",
  isRawMaterial: false,
  id: "",
  isActive: false,
  createdAt: "",
  updatedAt: "",
};

export function ProductForm({
  open,
  onClose,
  onSubmit,
  initialData,
}: ProductFormProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = (values: any) => {
    onSubmit({
      ...defaultProduct,
      ...initialData,
      ...values,
    });
  };

  const handleBarcodeDetected = (barcode: string) => {
    form.setFieldValue("barcode", barcode);
    setIsScanning(false);
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        title={
          initialData ? t("inventory.editProduct") : t("inventory.addProduct")
        }
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={initialData || defaultProduct}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label={t("inventory.productName")}
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
            <Input
              suffix={
                <Button
                  type="text"
                  icon={<QrcodeOutlined />}
                  onClick={() => setIsScanning(true)}
                />
              }
            />
          </Form.Item>

          <Form.Item name="description" label={t("inventory.description")}>
            <Input.TextArea rows={3} />
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
            <Button onClick={onClose}>{t("common.cancel")}</Button>
            <Button type="primary" htmlType="submit">
              {initialData ? t("common.save") : t("common.create")}
            </Button>
          </Space>
        </Form>
      </Modal>

      <BarcodeScanner
        isScanning={isScanning}
        onDetected={handleBarcodeDetected}
        onClose={() => setIsScanning(false)}
      />
    </>
  );
}
