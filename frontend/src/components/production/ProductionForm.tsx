import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  InputNumber, 
  Card, 
  DatePicker, 
  Divider, 
  Alert, 
  Spin, 
  Typography,
  Space,
  Modal
} from 'antd';
import { 
  PlusOutlined, 
  CheckOutlined, 
  ExclamationCircleOutlined, 
  WarningOutlined 
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productionService } from '../../services/production.service';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

interface BOM {
  id: string;
  name: string;
  description?: string;
  finalProduct: {
    id: string;
    name: string;
    sku: string;
  };
  items: Array<{
    id: string;
    productId: string;
    product: {
      id: string;
      name: string;
      sku: string;
    };
    quantity: number;
    unit: string;
  }>;
}

interface ProductionFormProps {
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  initialValues?: any;
}

interface ProductionFormData {
  bomId: string;
  quantity: number;
  startDate?: moment.Moment;
  notes?: string;
}

const ProductionForm: React.FC<ProductionFormProps> = ({ 
  onSuccess, 
  onCancel,
  initialValues 
}) => {
  const [form] = Form.useForm();
  const [selectedBomId, setSelectedBomId] = useState<string | null>(initialValues?.bomId || null);
  const queryClient = useQueryClient();

  // Fetch BOMs
  const { 
    data: boms, 
    isLoading: isLoadingBoms, 
    error: bomsError 
  } = useQuery({
    queryKey: ['boms'],
    queryFn: () => productionService.getAllBOMs(),
  });

  // Fetch selected BOM details
  const { 
    data: selectedBom, 
    isLoading: isLoadingBomDetails 
  } = useQuery({
    queryKey: ['bom', selectedBomId],
    queryFn: () => productionService.getBOMById(selectedBomId!),
    enabled: !!selectedBomId,
  });

  // Check stock availability for the selected BOM
  const { 
    data: stockAvailability, 
    isLoading: isCheckingStock,
    refetch: recheckStock
  } = useQuery({
    queryKey: ['bomStockCheck', selectedBomId, form.getFieldValue('quantity')],
    queryFn: () => productionService.checkBOMStockAvailability(
      selectedBomId!, 
      form.getFieldValue('quantity') || 1
    ),
    enabled: !!selectedBomId && form.getFieldValue('quantity') > 0,
  });

  // Create production order mutation
  const createProductionMutation = useMutation({
    mutationFn: (data: ProductionFormData) => productionService.createProductionOrder(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['productionOrders'] });
      if (onSuccess) onSuccess(data);
    },
  });

  const handleBomChange = (bomId: string) => {
    setSelectedBomId(bomId);
    form.setFieldsValue({ bomId });
    
    // Reset quantity to trigger stock check
    const currentQty = form.getFieldValue('quantity');
    if (currentQty) {
      setTimeout(() => {
        recheckStock();
      }, 100);
    }
  };

  const handleQuantityChange = (value: number | null) => {
    if (value && selectedBomId) {
      setTimeout(() => {
        recheckStock();
      }, 100);
    }
  };

  const handleSubmit = (values: ProductionFormData) => {
    // Check if there's any stock issues
    const hasStockIssues = stockAvailability?.some(item => !item.isAvailable);
    
    if (hasStockIssues) {
      confirm({
        title: 'Insufficient stock for some materials',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>Some materials don't have enough stock for this production order:</p>
            <ul>
              {stockAvailability?.filter(item => !item.isAvailable).map(item => (
                <li key={item.productId}>
                  <Text type="danger">
                    {item.productName}: Required {item.requiredQuantity}, Available {item.availableQuantity}
                  </Text>
                </li>
              ))}
            </ul>
            <p>Do you want to continue anyway?</p>
          </div>
        ),
        okText: 'Continue',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk() {
          submitProductionOrder(values);
        },
      });
    } else {
      submitProductionOrder(values);
    }
  };

  const submitProductionOrder = (values: ProductionFormData) => {
    // Format the date if provided
    const formattedValues = {
      ...values,
      startDate: values.startDate?.toISOString(),
    };
    
    createProductionMutation.mutate(formattedValues);
  };

  const isLoading = isLoadingBoms || isLoadingBomDetails || isCheckingStock;
  const isSubmitting = createProductionMutation.isPending;

  return (
    <Card title="Create Production Order" loading={isLoading}>
      {bomsError ? (
        <Alert
          message="Error loading BOMs"
          description="Failed to load Bill of Materials. Please try again later."
          type="error"
          showIcon
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues || {
            quantity: 1,
            startDate: moment(),
          }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="bomId"
            label="Bill of Materials"
            rules={[{ required: true, message: 'Please select a BOM' }]}
          >
            <Select
              placeholder="Select a Bill of Materials"
              onChange={handleBomChange}
              loading={isLoadingBoms}
              disabled={isSubmitting}
            >
              {boms?.map((bom: BOM) => (
                <Option key={bom.id} value={bom.id}>
                  {bom.name} - {bom.finalProduct.name} ({bom.finalProduct.sku})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedBom && (
            <>
              <Divider orientation="left">Product Information</Divider>
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <Title level={5}>{selectedBom.finalProduct.name}</Title>
                <Text type="secondary">SKU: {selectedBom.finalProduct.sku}</Text>
                {selectedBom.description && (
                  <p className="mt-2">{selectedBom.description}</p>
                )}
              </div>

              <Divider orientation="left">Required Materials</Divider>
              <div className="mb-4">
                {selectedBom.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center mb-2 p-2 border-b">
                    <div>
                      <div>{item.product.name}</div>
                      <div className="text-xs text-gray-500">{item.product.sku}</div>
                    </div>
                    <div>
                      <Text strong>
                        {item.quantity} {item.unit} per unit
                      </Text>
                      {stockAvailability?.find(stock => stock.productId === item.productId)?.isAvailable === false && (
                        <div className="text-red-500 flex items-center mt-1">
                          <WarningOutlined className="mr-1" /> Insufficient stock
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <Form.Item
            name="quantity"
            label="Production Quantity"
            rules={[
              { required: true, message: 'Please enter quantity' },
              { type: 'number', min: 1, message: 'Quantity must be at least 1' }
            ]}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }} 
              onChange={handleQuantityChange}
              disabled={isSubmitting}
            />
          </Form.Item>

          {selectedBomId && stockAvailability && (
            <div className="mb-4">
              {stockAvailability.some(item => !item.isAvailable) ? (
                <Alert
                  message="Insufficient Materials"
                  description={
                    <div>
                      <p>There is not enough stock for the following materials:</p>
                      <ul>
                        {stockAvailability
                          .filter(item => !item.isAvailable)
                          .map(item => (
                            <li key={item.productId}>
                              {item.productName}: Required {item.requiredQuantity}, Available {item.availableQuantity}
                            </li>
                          ))}
                      </ul>
                    </div>
                  }
                  type="warning"
                  showIcon
                />
              ) : (
                <Alert
                  message="Materials Available"
                  description="All required materials are available in stock."
                  type="success"
                  showIcon
                />
              )}
            </div>
          )}

          <Form.Item
            name="startDate"
            label="Start Date"
          >
            <DatePicker 
              style={{ width: '100%' }} 
              disabled={isSubmitting}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea 
              rows={4} 
              placeholder="Add any notes about this production order" 
              disabled={isSubmitting}
            />
          </Form.Item>

          {createProductionMutation.isError && (
            <Alert
              message="Error creating production order"
              description={(createProductionMutation.error as Error)?.message || "An unknown error occurred"}
              type="error"
              showIcon
              className="mb-4"
            />
          )}

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<CheckOutlined />} 
                loading={isSubmitting}
              >
                Create Production Order
              </Button>
              {onCancel && (
                <Button onClick={onCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
};

export default ProductionForm;
