import React, { useEffect } from 'react';
import { 
  Form, 
  Input, 
  InputNumber, 
  DatePicker, 
  Button, 
  Select,
  Modal,
  message
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../../services/inventoryService';
import { inventoryBatchApi } from '../../../services/inventory-batch-service';
import type { BatchInventoryStatus } from '../../../types/inventory-batch';
import type { Product } from '../../../types/inventory';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface BatchFormProps {
  open: boolean;
  onClose: () => void;
  batch?: BatchInventoryStatus;
}

const BatchForm: React.FC<BatchFormProps> = ({ 
  open, 
  onClose, 
  batch 
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEditing = !!batch;

  // Query products for selection
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => inventoryApi.getProducts({ isActive: true })
  });

  // Set form values when editing
  useEffect(() => {
    if (batch) {
      form.setFieldsValue({
        productId: batch.productId,
        batchNumber: batch.batchNumber,
        quantity: batch.currentQuantity,
        unitCost: batch.unitCost,
        manufactureDate: batch.manufactureDate ? dayjs(batch.manufactureDate) : undefined,
        expiryDate: batch.expiryDate ? dayjs(batch.expiryDate) : undefined,
        receivedDate: dayjs(batch.receivedDate),
        notes: batch.notes
      });
    } else {
      form.resetFields();
      // Set default received date to today
      form.setFieldsValue({
        receivedDate: dayjs()
      });
    }
  }, [batch, form]);

  // Create batch mutation
  const createMutation = useMutation({
    mutationFn: inventoryBatchApi.createBatch,
    onSuccess: () => {
      message.success(t('inventory.batch.createSuccess'));
      queryClient.invalidateQueries({ queryKey: ['batch-inventory-status'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.message || t('common.errorOccurred'));
    }
  });

  // Update batch mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      inventoryBatchApi.updateBatch(id, data),
    onSuccess: () => {
      message.success(t('inventory.batch.updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['batch-inventory-status'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.message || t('common.errorOccurred'));
    }
  });

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Convert dayjs objects to ISO strings
      const formData = {
        ...values,
        manufactureDate: values.manufactureDate?.toISOString(),
        expiryDate: values.expiryDate?.toISOString(),
        receivedDate: values.receivedDate.toISOString()
      };

      if (isEditing && batch) {
        updateMutation.mutate({ 
          id: batch.batchId, 
          data: formData 
        });
      } else {
        createMutation.mutate(formData);
      }
    } catch (error) {
      // Form validation error
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEditing ? t('inventory.batch.editBatch') : t('inventory.batch.addBatch')}
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={createMutation.isPending || updateMutation.isPending}
          onClick={handleSubmit}
        >
          {isEditing ? t('common.update') : t('common.create')}
        </Button>
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        name="batchForm"
      >
        <Form.Item
          name="productId"
          label={t('inventory.product')}
          rules={[{ required: true, message: t('inventory.batch.productRequired') }]}
        >
          <Select
            showSearch
            placeholder={t('inventory.selectProduct')}
            loading={productsLoading}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
            disabled={isEditing} // Don't allow changing product for existing batch
          >
            {products?.map((product: Product) => (
              <Option key={product.id} value={product.id}>
                {product.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="batchNumber"
          label={t('inventory.batch.batchNumber')}
          rules={[{ required: true, message: t('inventory.batch.batchNumberRequired') }]}
        >
          <Input placeholder={t('inventory.batch.enterBatchNumber')} />
        </Form.Item>

        <Form.Item
          name="quantity"
          label={t('inventory.quantity')}
          rules={[{ required: true, message: t('inventory.quantityRequired') }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            placeholder={t('inventory.enterQuantity')}
          />
        </Form.Item>

        <Form.Item
          name="unitCost"
          label={t('inventory.unitCost')}
          rules={[{ required: true, message: t('inventory.unitCostRequired') }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            prefix="$"
            style={{ width: '100%' }}
            placeholder={t('inventory.enterUnitCost')}
          />
        </Form.Item>

        <Form.Item
          name="manufactureDate"
          label={t('inventory.batch.manufactureDate')}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="expiryDate"
          label={t('inventory.batch.expiryDate')}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="receivedDate"
          label={t('inventory.batch.receivedDate')}
          rules={[{ required: true, message: t('inventory.batch.receivedDateRequired') }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="notes"
          label={t('common.notes')}
        >
          <TextArea rows={3} placeholder={t('common.enterNotes')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BatchForm;
