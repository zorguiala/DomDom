import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Space,
  InputNumber,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { BOM, BOMInput, BOMItemInput } from "../../types/bom";
import { Product } from "../../types/inventory";
import { inventoryApi } from "../../services/inventoryService";
import { ProductSelect } from "../inventory/ProductSelect";

interface BOMFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BOMInput) => void;
  initialData?: BOM;
}

const { Title } = Typography;

export function BOMForm({
  open,
  onClose,
  onSubmit,
  initialData,
}: BOMFormProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  // Query for raw materials
  const { data: rawMaterials } = useQuery({
    queryKey: ["products", { isRawMaterial: true }],
    queryFn: () => inventoryApi.getProducts({ isRawMaterial: true }),
  });

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        initialData
          ? {
              name: initialData.name,
              description: initialData.description || "",
              outputQuantity: initialData.outputQuantity,
              outputUnit: initialData.outputUnit,
              items: initialData.items.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
                unit: item.unit,
                wastagePercent: item.wastagePercent,
              })),
            }
          : {
              name: "",
              description: "",
              outputQuantity: 0,
              outputUnit: "",
              items: [],
            }
      );
    }
  }, [initialData, open, form]);

  const handleSubmit = (values: BOMInput) => {
    onSubmit(values);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={initialData ? t("bom.editBom") : t("bom.createBom")}
      width={800}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label={t("bom.name")}
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="outputQuantity"
              label={t("bom.outputQuantity")}
              rules={[{ required: true, message: t("common.required") }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="outputUnit"
              label={t("bom.outputUnit")}
              rules={[{ required: true, message: t("common.required") }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label={t("bom.description")}>
          <Input.TextArea rows={2} />
        </Form.Item>

        {/* BOM Items Section */}
        <div style={{ marginBottom: 16 }}>
          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              {t("bom.materials")}
            </Title>
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  <Button
                    type="dashed"
                    onClick={() => add({ quantity: 0, wastagePercent: 0 })}
                    icon={<PlusOutlined />}
                  >
                    {t("bom.addMaterial")}
                  </Button>

                  {fields.map((field, index) => (
                    <Row
                      gutter={[16, 16]}
                      key={field.key}
                      style={{ marginTop: 16 }}
                    >
                      <Col span={8}>
                        <Form.Item
                          {...field}
                          name={[field.name, "productId"]}
                          rules={[
                            { required: true, message: t("common.required") },
                          ]}
                        >
                          <ProductSelect
                            products={rawMaterials || []}
                            label={t("bom.material")}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={4}>
                        <Form.Item
                          {...field}
                          name={[field.name, "quantity"]}
                          label={t("bom.quantity")}
                          rules={[
                            { required: true, message: t("common.required") },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            step={0.01}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={4}>
                        <Form.Item
                          {...field}
                          name={[field.name, "unit"]}
                          label={t("bom.unit")}
                          rules={[
                            { required: true, message: t("common.required") },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>

                      <Col span={6}>
                        <Form.Item
                          {...field}
                          name={[field.name, "wastagePercent"]}
                          label={t("bom.wastagePercent")}
                        >
                          <InputNumber
                            min={0}
                            max={100}
                            step={0.1}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>

                      <Col
                        span={2}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                        />
                      </Col>
                    </Row>
                  ))}
                </>
              )}
            </Form.List>
          </Space>
        </div>

        <Form.Item>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={onClose}>{t("common.cancel")}</Button>
            <Button type="primary" htmlType="submit">
              {initialData ? t("common.save") : t("common.create")}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
