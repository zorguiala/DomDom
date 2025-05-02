import React from "react";
import { Form, Input, InputNumber, Switch, Button, Space } from "antd";
import { Product } from "../../types/inventory";
import { useMutation, useQueryClient } from "react-query";
import { productApi } from "../../services/productService";

interface ProductFormProps {
  initialValues?: Product;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialValues,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEditing = !!initialValues;

  const { mutate, isLoading } = useMutation(
    (values: Partial<Product>) =>
      isEditing
        ? productApi.updateProduct(initialValues.id, values)
        : productApi.createProduct(values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("products");
        onCancel();
      },
    }
  );

  const onFinish = (values: any) => {
    mutate(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
    >
      <Form.Item
        name="name"
        label="Product Name"
        rules={[{ required: true, message: "Please enter product name" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="sku"
        label="SKU"
        rules={[{ required: true, message: "Please enter SKU" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item
        name="price"
        label="Price"
        rules={[{ required: true, message: "Please enter price" }]}
      >
        <InputNumber
          min={0}
          precision={2}
          style={{ width: "100%" }}
          formatter={(value) =>
            `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
        />
      </Form.Item>

      <Form.Item
        name="minStockLevel"
        label="Minimum Stock Level"
        rules={[
          { required: true, message: "Please enter minimum stock level" },
        ]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="isActive" label="Active" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {isEditing ? "Update" : "Create"} Product
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
