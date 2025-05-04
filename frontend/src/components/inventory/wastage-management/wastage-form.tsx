import React, { useEffect, useState } from 'react';
import { 
  Form, 
  Input, 
  InputNumber, 
  DatePicker, 
  Button, 
  Select,
  Modal,
  message,
  Space
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../../services/inventoryService';
import { inventoryBatchApi } from '../../../services/inventory-batch-service';
import { inventoryWastageApi } from '../../../services/inventory-wastage-service';
import type { WastageRecord, WastageReason } from '../../../types/inventory-wastage';
import type { Product } from '../../../types/inventory';
import type { BatchInventoryStatus } from '../../../types/inventory-batch';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface WastageFormProps {
  open: boolean;
  onClose: () => void;
  wastageRecord?: WastageRecord;
}

const WastageForm: React.FC<WastageFormProps> = ({ 
  open, 
  onClose, 
  wastageRecord 
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEditing = !!wastageRecord;
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(
    wastageRecord?.productId
  );

  // Query products for selection
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => inventoryApi.getProducts({ isActive: true })
  });

  // Query batches for the selected product
  const { data: batches, isLoading: batchesLoading } = useQuery({
    queryKey: ['product-batches', selectedProductId],
    queryFn: () => inventoryBatchApi.getBatches(selectedProductId),
    enabled: !!selectedProductId
  });

  // Set form values when editing
  useEffect(() => {
    if (wastageRecord) {
      form.setFieldsValue({
        productId: wastageRecord.productId,
        batchId: wastageRecord.batchId,
        quantity: wastageRecord.quantity,
        reason: wastageRecord.reason,
        date: wastageRecord.date ? dayjs(wastageRecord.date) : undefined,
        reportedBy: wastageRecord.reportedBy,
        notes: wastageRecord.notes
      });
    } else {
      form.resetFields();
      // Set default date to today
      form.setFieldsValue({
        date: dayjs()
      });
    }
  }, [wastageRecord, form]);

  // Create wastage record mutation
  const createMutation = useMutation({
    mutationFn: inventoryWastageApi.createWastageRecord,
    onSuccess: () => {
      message.success(t('inventory.wastage.createSuccess'));
      queryClient.invalidateQueries({ queryKey: ['wastage-records'] });
      queryClient.invalidateQueries({ queryKey: ['wastage-analytics-summary'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.message || t('common.errorOccurred'));
    }
  });

  // Update wastage record mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      inventoryWastageApi.updateWastageRecord(id, data),
    onSuccess: () => {
      message.success(t('inventory.wastage.updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['wastage-records'] });
      queryClient.invalidateQueries({ queryKey: ['wastage-analytics-summary'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.message || t('common.errorOccurred'));
    }
  });

  // Handle product selection change
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    form.setFieldsValue({ batchId: undefined });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Convert dayjs object to ISO string
      const formData = {
        ...values,
        date: values.date?.toISOString()
      };

      if (isEditing && wastageRecord) {
        updateMutation.mutate({ 
          id: wastageRecord.id, 
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
      title={isEditing ? t('inventory.wastage.editRecord') : t('inventory.wastage.recordWastage')}
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
        name="wastageForm"
      >
        <Form.Item
          name="productId"
          label={t('inventory.product')}
          rules={[{ required: true, message: t('inventory.productRequired') }]}
        >
          <Select
            showSearch
            placeholder={t('inventory.selectProduct')}
            loading={productsLoading}
            onChange={handleProductChange}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
            disabled={isEditing} // Don't allow changing product when editing
          >
            {products?.map((product: Product) => (
              <Option key={product.id} value={product.id}>
                {product.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="batchId"
          label={t('inventory.batch.selectBatch')}
        >
          <Select
            showSearch
            placeholder={t('inventory.batch.selectBatch')}
            loading={batchesLoading}
            disabled={!selectedProductId || isEditing}
            allowClear
          >
            {batches?.map((batch: BatchInventoryStatus) => (
              <Option key={batch.batchId} value={batch.batchId}>
                {batch.batchNumber} - {t('inventory.quantity')}: {batch.currentQuantity}
                {batch.expiryDate && 
                  ` - ${t('inventory.batch.expiry')}: ${new Date(batch.expiryDate).toLocaleDateString()}`
                }
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label={t('inventory.quantity')}
          rules={[{ required: true, message: t('inventory.quantityRequired') }]}
        >
          <InputNumber
            min={0.01}
            step={0.01}
            style={{ width: '100%' }}
            placeholder={t('inventory.enterQuantity')}
          />
        </Form.Item>

        <Form.Item
          name="reason"
          label={t('inventory.wastage.reason')}
          rules={[{ required: true, message: t('inventory.wastage.reasonRequired') }]}
        >
          <Select placeholder={t('inventory.wastage.selectReason')}>
            {Object.values(WastageReason).map(reason => (
              <Option key={reason} value={reason}>
                {t(`inventory.wastage.reasons.${reason}`)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="date"
          label={t('inventory.wastage.date')}
          rules={[{ required: true, message: t('inventory.wastage.dateRequired') }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="reportedBy"
          label={t('inventory.wastage.reportedBy')}
          rules={[{ required: true, message: t('inventory.wastage.reportedByRequired') }]}
        >
          <Input placeholder={t('inventory.wastage.enterReportedBy')} />
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

export default WastageForm;
