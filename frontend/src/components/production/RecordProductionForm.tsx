import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Spin,
  Space,
  Typography,
  Alert,
} from "antd";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productionApi } from "../../services/productionServices/productionApi";
import { useRecordProduction } from "../../services/productionServices/use-record-production/use-record-production";
import { RecordProductionDto } from "../../types/production";

const { Title, Text } = Typography;

interface RecordProductionFormProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

export function RecordProductionForm({
  open,
  onClose,
  orderId,
  onSuccess,
}: RecordProductionFormProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Get employees for select dropdown
  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: () => productionApi.getEmployees(),
    enabled: open,
  });

  // Get current production order
  const { data: productionOrder, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["production-order-details", orderId],
    queryFn: () => productionApi.getOrderById(orderId),
    enabled: open && Boolean(orderId),
  });

  // Record production hook
  const {
    recordProduction,
    loading,
    error,
    productionOrder: updatedOrder,
  } = useRecordProduction();

  useEffect(() => {
    if (updatedOrder) {
      onSuccess();
    }
  }, [updatedOrder, onSuccess]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const data: RecordProductionDto = {
        employeeId: values.employeeId,
        quantity: values.quantity,
        notes: values.notes,
      };

      recordProduction(orderId, data);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Calculate remaining quantity
  const remainingQuantity =
    productionOrder &&
    productionOrder.quantity - productionOrder.completedQuantity;

  const isLoading = isLoadingEmployees || isLoadingOrder;

  return (
    <Modal
      title={t("production.recordProduction")}
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t("common.cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          disabled={isLoading}
        >
          {t("production.record")}
        </Button>,
      ]}
      width={600}
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
        </div>
      ) : (
        <div>
          {productionOrder && (
            <div style={{ marginBottom: 20 }}>
              <Title level={5}>{t("production.currentProduction")}</Title>
              <Text>
                {t("production.bomName")}: {productionOrder.bom.name}
              </Text>
              <br />
              <Text>
                {t("production.progress")}: {productionOrder.completedQuantity}{" "}
                / {productionOrder.quantity} (
                {remainingQuantity > 0
                  ? t("production.remaining", { count: remainingQuantity })
                  : t("production.completed")}
                )
              </Text>
            </div>
          )}

          {error && (
            <Alert
              message={t("common.error")}
              description={error.message}
              type="error"
              style={{ marginBottom: 16 }}
              showIcon
            />
          )}

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              quantity: 1,
            }}
          >
            <Form.Item
              name="employeeId"
              label={t("production.employee")}
              rules={[
                {
                  required: true,
                  message: t("validation.required", {
                    field: t("production.employee"),
                  }),
                },
              ]}
            >
              <Select placeholder={t("production.selectEmployee")}>
                {employees?.map((employee) => (
                  <Select.Option key={employee.id} value={employee.id}>
                    {employee.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="quantity"
              label={t("production.quantity")}
              rules={[
                {
                  required: true,
                  message: t("validation.required", {
                    field: t("production.quantity"),
                  }),
                },
              ]}
            >
              <InputNumber
                min={1}
                max={productionOrder ? remainingQuantity : undefined}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item name="notes" label={t("common.notes")}>
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  );
}
