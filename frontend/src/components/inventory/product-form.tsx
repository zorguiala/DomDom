import { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Row,
  Col,
  Space,
  Select,
} from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Product } from "../../types/inventory";
// Import BarcodeScanner
import { BarcodeScanner } from "./BarcodeScanner";

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: Partial<Product>) => void;
  onCancel: () => void;
}

// Make BarcodeScanner nullable to handle possible import failures
const BarcodeScannerComponent: typeof BarcodeScanner | null = BarcodeScanner;

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isScanning, setIsScanning] = useState(false);
  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  const handleSubmit = (values: any) => {
    // Transform the data before submitting
    const transformedData = { ...values };
    
    // If this is an update and initialStock is present, remove it
    // as it shouldn't be sent for updates
    if (isEditing && 'initialStock' in transformedData) {
      delete transformedData.initialStock;
    }

    onSubmit(transformedData);
  };

  const handleBarcodeDetected = (barcode: string) => {
    form.setFieldValue("barcode", barcode);
    setIsScanning(false);
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
          <Input 
            suffix={
              BarcodeScannerComponent && (
                <Button
                  type="text"
                  icon={<QrcodeOutlined />}
                  onClick={() => setIsScanning(true)}
                />
              )
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
              <InputNumber 
                min={0} 
                step={0.01} 
                style={{ width: "100%" }} 
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="unit"
              label={t("inventory.unit")}
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Select>
                <Select.Option value="kg">kg</Select.Option>
                <Select.Option value="g">g</Select.Option>
                <Select.Option value="L">L</Select.Option>
                <Select.Option value="ml">ml</Select.Option>
                <Select.Option value="cl">cl</Select.Option>
                <Select.Option value="unit">unit</Select.Option>
                <Select.Option value="pcs">pcs</Select.Option>
                <Select.Option value="box">box</Select.Option>
                <Select.Option value="pack">pack</Select.Option>
                <Select.Option value="dozen">dozen</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="initialStock"
              label={t("inventory.initialStock")}
              rules={[{ required: !isEditing, message: t("common.required") }]}
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
        <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
          <Switch
            checkedChildren={t("common.active")}
            unCheckedChildren={t("common.inactive")}
          />
        </Form.Item>
        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={onCancel}>{t("common.cancel")}</Button>
          <Button type="primary" htmlType="submit">
            {isEditing ? t("common.update") : t("common.create")}
          </Button>
        </Space>
      </Form>

      {BarcodeScannerComponent && (
        <BarcodeScannerComponent
          isScanning={isScanning}
          onDetected={handleBarcodeDetected}
          onClose={() => setIsScanning(false)}
        />
      )}
    </>
  );
}
