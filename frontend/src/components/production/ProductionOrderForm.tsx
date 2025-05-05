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
  Switch,
  Divider,
  Typography,
  Tooltip
} from "antd";
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { bomApi } from "../../services/bomService";
import { userApi } from "../../services/userService";
import {
  ProductionOrder,
  ProductionOrderPriority,
} from "../../types/production";
import dayjs from "dayjs";

const { Text } = Typography;

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
  const [isBatchProduction, setIsBatchProduction] = useState<boolean>(false);

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
        // Batch tracking fields
        isBatchProduction: initialData.isBatchProduction,
        batchPrefix: initialData.batchPrefix,
        batchSize: initialData.batchSize,
        batchCount: initialData.batchCount,
      });
      
      // Set state for conditional rendering
      setIsBatchProduction(initialData.isBatchProduction);
    } else if (open) {
      form.resetFields();
      // Set default values
      form.setFieldsValue({
        priority: ProductionOrderPriority.MEDIUM,
        plannedStartDate: dayjs(),
        isBatchProduction: false,
      });
      setIsBatchProduction(false);
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

  const handleBatchProductionChange = (checked: boolean) => {
    setIsBatchProduction(checked);
    
    if (checked && form.getFieldValue('quantity')) {
      // Default batch size calculation
      const totalQuantity = form.getFieldValue('quantity');
      const defaultBatchSize = Math.ceil(totalQuantity / 5); // Split into 5 batches by default
      const batchCount = Math.ceil(totalQuantity / defaultBatchSize);
      
      form.setFieldsValue({
        batchSize: defaultBatchSize,
        batchCount: batchCount
      });
    }
  };

  // Calculate batch count when quantity or batch size changes
  const updateBatchCount = () => {
    if (isBatchProduction) {
      const totalQuantity = form.getFieldValue('quantity');
      const batchSize = form.getFieldValue('batchSize');
      
      if (totalQuantity && batchSize && batchSize > 0) {
        const batchCount = Math.ceil(totalQuantity / batchSize);
        form.setFieldsValue({ batchCount });
      }
    }
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
            isBatchProduction: false,
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
                  onChange={updateBatchCount}
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
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  placeholder={t("production.selectDate")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assignedToId"
                label={t("production.assignTo")}
              >
                <Select
                  placeholder={t("production.selectUser")}
                  allowClear
                >
                  {(users as { id: string; name: string }[] | undefined)?.map(
                    (user) => (
                      <Select.Option key={user.id} value={user.id}>
                        {user.name}
                      </Select.Option>
                    )
                  )}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="isBatchProduction"
                label={
                  <span>
                    {t("production.batchProduction")}
                    <Tooltip title={t("production.batchProductionHelp")}>
                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                  </span>
                }
                valuePropName="checked"
              >
                <Switch onChange={handleBatchProductionChange} />
              </Form.Item>
            </Col>
          </Row>

          {isBatchProduction && (
            <>
              <Divider>
                <Text strong>{t("production.batchSettings")}</Text>
              </Divider>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="batchPrefix"
                    label={t("production.batchPrefix")}
                    tooltip={t("production.batchPrefixHelp")}
                  >
                    <Input placeholder="PROD-" />
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="batchSize"
                    label={t("production.batchSize")}
                    tooltip={t("production.batchSizeHelp")}
                    rules={[
                      {
                        required: isBatchProduction,
                        message: t("validation.required", {
                          field: t("production.batchSize"),
                        }),
                      },
                    ]}
                  >
                    <InputNumber 
                      style={{ width: "100%" }} 
                      min={1} 
                      onChange={updateBatchCount}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="batchCount"
                    label={t("production.batchCount")}
                    tooltip={t("production.batchCountHelp")}
                  >
                    <InputNumber 
                      style={{ width: "100%" }} 
                      min={1} 
                      disabled 
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          <Form.Item
            name="notes"
            label={t("production.notes")}
          >
            <Input.TextArea
              rows={4}
              placeholder={t("production.enterNotes")}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
