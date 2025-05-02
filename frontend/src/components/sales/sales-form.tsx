import { Modal, Form, Input, Button, InputNumber, Select } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sale, CreateSaleDto } from "../../types/sales";

interface SalesFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSaleDto) => void;
  initialData?: Sale;
  loading?: boolean;
}

export function SalesForm({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}: SalesFormProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && initialData) {
      form.setFieldsValue({
        customerName: initialData.customerName,
        items:
          initialData.items?.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })) || [],
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialData, form]);

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={initialData ? t("sales.editSale") : t("sales.createSale")}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t("common.cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          loading={loading}
        >
          {t("common.save")}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="customerName"
          label={t("sales.customer")}
          rules={[
            {
              required: true,
              message: t("validation.required", { field: t("sales.customer") }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.List
          name="items"
          rules={[
            {
              validator: async (_, items) => {
                if (!items || items.length === 0)
                  throw new Error(t("sales.atLeastOneItem"));
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, idx) => (
                <div
                  key={field.key}
                  style={{ display: "flex", gap: 8, marginBottom: 8 }}
                >
                  <Form.Item
                    {...field}
                    name={[field.name, "productId"]}
                    fieldKey={[field.fieldKey, "productId"]}
                    rules={[
                      {
                        required: true,
                        message: t("validation.required", {
                          field: t("sales.product"),
                        }),
                      },
                    ]}
                    style={{ flex: 2 }}
                  >
                    <Input placeholder={t("sales.productId")} />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, "quantity"]}
                    fieldKey={[field.fieldKey, "quantity"]}
                    rules={[
                      {
                        required: true,
                        message: t("validation.required", {
                          field: t("sales.quantity"),
                        }),
                      },
                    ]}
                    style={{ flex: 1 }}
                  >
                    <InputNumber min={1} placeholder={t("sales.quantity")} />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, "unitPrice"]}
                    fieldKey={[field.fieldKey, "unitPrice"]}
                    rules={[
                      {
                        required: true,
                        message: t("validation.required", {
                          field: t("sales.unitPrice"),
                        }),
                      },
                    ]}
                    style={{ flex: 1 }}
                  >
                    <InputNumber
                      min={0}
                      step={0.01}
                      placeholder={t("sales.unitPrice")}
                    />
                  </Form.Item>
                  <Button danger onClick={() => remove(field.name)}>
                    {t("common.delete")}
                  </Button>
                </div>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block>
                  {t("sales.addItem")}
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
