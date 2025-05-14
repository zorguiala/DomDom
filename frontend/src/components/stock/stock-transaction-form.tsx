import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  InputNumber,
  Card,
  Typography,
  message,
  Divider,
  Space,
} from "antd";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useStock } from "../../hooks/useStock";

const { Title } = Typography;
const { Option } = Select;

interface StockTransactionFormProps {
  onSuccess?: () => void;
  initialProductId?: string;
}

type TransactionType = "addition" | "removal" | "transfer" | "adjustment";

interface TransactionFormValues {
  productId: string;
  type: TransactionType;
  quantity: number;
  date: Date;
  notes: string;
  reason?: string;
  sourceLocation?: string;
  destinationLocation?: string;
  referenceNumber?: string;
}

const StockTransactionForm: React.FC<StockTransactionFormProps> = ({
  onSuccess,
  initialProductId,
}) => {
  const { t } = useTranslation();
  const { products, loading } = useStock();
  const [form] = Form.useForm<TransactionFormValues>();
  const [transactionType, setTransactionType] =
    useState<TransactionType>("addition");
  const [submitting, setSubmitting] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);

  // Set initial values if product ID is provided
  useEffect(() => {
    if (initialProductId) {
      form.setFieldsValue({ productId: initialProductId });
    }
  }, [initialProductId, form]);

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // This would be replaced with actual API call when backend is ready
        // const response = await axios.get('/api/locations');
        // setLocations(response.data);

        // Mock data for now
        setLocations([
          "Main Warehouse",
          "Production Floor",
          "Shipping Area",
          "Cold Storage",
        ]);
      } catch (err) {
        console.error("Error fetching locations:", err);
        message.error(t("common.errorOccurred"));
      }
    };

    fetchLocations();
  }, [t]);

  const handleTypeChange = (value: TransactionType) => {
    setTransactionType(value);
    form.setFieldsValue({ reason: undefined }); // Reset reason when type changes
  };

  const handleSubmit = async (values: TransactionFormValues) => {
    try {
      setSubmitting(true);

      // Prepare the transaction data
      const transactionData = {
        ...values,
        date: values.date.toISOString(),
      };

      // Send to API
      await axios.post("/api/stock/transactions", transactionData);

      message.success(t("stock.transactionSuccess"));
      form.resetFields();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error submitting transaction:", err);
      message.error(t("common.errorOccurred"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="stock-transaction-form">
      <Title level={3}>{t("stock.recordTransaction")}</Title>
      <Divider />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: "addition",
          date: new Date(),
          quantity: 1,
        }}
      >
        <Form.Item
          name="productId"
          label={t("stock.product")}
          rules={[{ required: true, message: t("validation.required") }]}
        >
          <Select
            placeholder={t("stock.selectProduct")}
            loading={loading}
            showSearch
            optionFilterProp="children"
          >
            {products.map((product) => (
              <Option key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="type"
          label={t("stock.transactionType")}
          rules={[{ required: true, message: t("validation.required") }]}
        >
          <Select
            onChange={(value) => handleTypeChange(value as TransactionType)}
          >
            <Option value="addition">{t("stock.addition")}</Option>
            <Option value="removal">{t("stock.removal")}</Option>
            <Option value="transfer">{t("stock.transfer")}</Option>
            <Option value="adjustment">{t("stock.adjustment")}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label={t("stock.quantity")}
          rules={[{ required: true, message: t("validation.required") }]}
        >
          <InputNumber
            min={0.01}
            step={0.01}
            style={{ width: "100%" }}
            precision={2}
          />
        </Form.Item>

        {transactionType === "removal" && (
          <Form.Item
            name="reason"
            label={t("stock.removalReason")}
            rules={[{ required: true, message: t("validation.required") }]}
          >
            <Select>
              <Option value="sale">{t("stock.reasons.sale")}</Option>
              <Option value="wastage">{t("stock.reasons.wastage")}</Option>
              <Option value="production">
                {t("stock.reasons.production")}
              </Option>
              <Option value="return">{t("stock.reasons.return")}</Option>
              <Option value="other">{t("stock.reasons.other")}</Option>
            </Select>
          </Form.Item>
        )}

        {transactionType === "transfer" && (
          <>
            <Form.Item
              name="sourceLocation"
              label={t("stock.sourceLocation")}
              rules={[{ required: true, message: t("validation.required") }]}
            >
              <Select>
                {locations.map((location) => (
                  <Option key={location} value={location}>
                    {location}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="destinationLocation"
              label={t("stock.destinationLocation")}
              rules={[{ required: true, message: t("validation.required") }]}
            >
              <Select>
                {locations.map((location) => (
                  <Option key={location} value={location}>
                    {location}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}

        <Form.Item
          name="date"
          label={t("stock.transactionDate")}
          rules={[{ required: true, message: t("validation.required") }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="referenceNumber" label={t("stock.referenceNumber")}>
          <Input placeholder={t("stock.referenceNumberPlaceholder")} />
        </Form.Item>

        <Form.Item name="notes" label={t("common.notes")}>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {t("common.submit")}
            </Button>
            <Button onClick={() => form.resetFields()}>
              {t("common.reset")}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default StockTransactionForm;
