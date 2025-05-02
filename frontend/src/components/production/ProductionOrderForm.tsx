import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  InputNumber,
  Row,
  Col,
  Spin,
} from "antd";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { bomApi } from "../../services/bomService";
import { userApi } from "../../services/userService";
import {
  ProductionOrder,
  ProductionOrderPriority,
} from "../../types/production";
import dayjs from "dayjs";

interface ProductionOrderFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: ProductionOrder;
}

export function ProductionOrderForm({
  open,
  onClose,
  onSubmit,
  initialData,
}: ProductionOrderFormProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  // Fetch BOMs for selection
  const { data: boms, isLoading: isLoadingBoms } = useQuery({
    queryKey: ["boms"],
    queryFn: () => bomApi.getBOMs(),
    enabled: open,
  });

  // Fetch users for assignment
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => userApi.getUsers(),
    enabled: open,
  });

  useEffect(() => {
    if (open && initialData) {
      form.setFieldsValue({
        bomId: initialData.bom.id,
        quantity: initialData.quantity,
        priority: initialData.priority,
        plannedStartDate: initialData.plannedStartDate
          ? dayjs(initialData.plannedStartDate)
          : undefined,
        assignedToId: initialData.assignedTo?.id,
        notes: initialData.notes,
      });
    } else if (open) {
      form.resetFields();
      // Set default values
      form.setFieldsValue({
        priority: ProductionOrderPriority.MEDIUM,
        plannedStartDate: dayjs(),
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      // Convert dayjs to ISO string for the date
      const formattedValues = {
        ...values,
        plannedStartDate: values.plannedStartDate.toISOString(),
      };
      onSubmit(formattedValues);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const isLoading = isLoadingBoms || isLoadingUsers;

  return (
    <Modal
      title={
        initialData ? t("production.editOrder") : t("production.createOrder")
      }
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
          disabled={isLoading}
        >
          {t("common.save")}
        </Button>,
      ]}
      width={700}
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            priority: ProductionOrderPriority.MEDIUM,
            plannedStartDate: dayjs(),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="bomId"
                label={t("production.selectBom")}
                rules={[
                  {
                    required: true,
                    message: t("validation.required", {
                      field: t("production.bom"),
                    }),
                  },
                ]}
              >
                <Select placeholder={t("production.selectBom")}>
                  {(boms as { id: string; name: string }[] | undefined)?.map(
                    (bom) => (
                      <Select.Option key={bom.id} value={bom.id}>
                        {bom.name}
                      </Select.Option>
                    )
                  )}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
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
                  style={{ width: "100%" }}
                  min={1}
                  placeholder={t("production.enterQuantity")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label={t("production.priority")}
                rules={[
                  {
                    required: true,
                    message: t("validation.required", {
                      field: t("production.priority"),
                    }),
                  },
                ]}
              >
                <Select placeholder={t("production.selectPriority")}>
                  <Select.Option value={ProductionOrderPriority.LOW}>
                    {t("production.priority.low")}
                  </Select.Option>
                  <Select.Option value={ProductionOrderPriority.MEDIUM}>
                    {t("production.priority.medium")}
                  </Select.Option>
                  <Select.Option value={ProductionOrderPriority.HIGH}>
                    {t("production.priority.high")}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="plannedStartDate"
                label={t("production.plannedStartDate")}
                rules={[
                  {
                    required: true,
                    message: t("validation.required", {
                      field: t("production.plannedStartDate"),
                    }),
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="assignedToId" label={t("production.assignedTo")}>
            <Select placeholder={t("production.selectUser")} allowClear>
              {users?.map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="notes" label={t("common.notes")}>
            <Input.TextArea rows={4} placeholder={t("common.enterNotes")} />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
