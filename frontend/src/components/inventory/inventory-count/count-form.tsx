import React, { useEffect, useState } from 'react';
import { 
  Form, 
  Input, 
  DatePicker, 
  Button, 
  Modal,
  message,
  Table,
  InputNumber,
  Typography,
  Space
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryCountApi } from '../../../services/inventory-count-service';
import type { InventoryCount, InventoryCountItemDto } from '../../../types/inventory-count';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title } = Typography;

interface CountFormProps {
  open: boolean;
  onClose: () => void;
  count?: InventoryCount;
}

const CountForm: React.FC<CountFormProps> = ({ 
  open, 
  onClose, 
  count 
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEditing = !!count;
  const [itemsData, setItemsData] = useState<any[]>([]);

  // Query template with expected quantities
  const { 
    data: template, 
    isLoading: templateLoading 
  } = useQuery({
    queryKey: ['inventory-count-template'],
    queryFn: () => inventoryCountApi.generateCountSheet(),
    enabled: !isEditing && open
  });

  // Set form values and items when editing or creating
  useEffect(() => {
    if (count) {
      form.setFieldsValue({
        reference: count.reference,
        countDate: count.countDate ? dayjs(count.countDate) : undefined,
        notes: count.notes
      });
      setItemsData(count.items.map(item => ({
        key: item.id || item.productId,
        productId: item.productId,
        productName: item.productName,
        expectedQuantity: item.expectedQuantity,
        actualQuantity: item.actualQuantity,
        unit: item.unit || '',
        notes: item.notes || ''
      })));
    } else {
      form.resetFields();
      // Set default count date to today
      form.setFieldsValue({
        countDate: dayjs()
      });
      
      if (template) {
        setItemsData(template.map((item: any) => ({
          key: item.productId,
          productId: item.productId,
          productName: item.productName,
          expectedQuantity: item.expectedQuantity,
          actualQuantity: undefined,
          unit: item.unit,
          notes: ''
        })));
      }
    }
  }, [count, form, template]);

  // Create count mutation
  const createMutation = useMutation({
    mutationFn: inventoryCountApi.createInventoryCount,
    onSuccess: () => {
      message.success(t('inventory.count.createSuccess'));
      queryClient.invalidateQueries({ queryKey: ['inventory-counts'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.message || t('common.errorOccurred'));
    }
  });

  // Update count mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      inventoryCountApi.updateInventoryCount(id, data),
    onSuccess: () => {
      message.success(t('inventory.count.updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['inventory-counts'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.message || t('common.errorOccurred'));
    }
  });

  // Handle actual quantity change
  const handleQuantityChange = (value: number | null, productId: string) => {
    setItemsData(prevItems => 
      prevItems.map(item => 
        item.productId === productId 
          ? { ...item, actualQuantity: value || 0 } 
          : item
      )
    );
  };

  // Handle notes change
  const handleNotesChange = (value: string, productId: string) => {
    setItemsData(prevItems => 
      prevItems.map(item => 
        item.productId === productId 
          ? { ...item, notes: value } 
          : item
      )
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Prepare items data
      const items: InventoryCountItemDto[] = itemsData
        .filter(item => item.actualQuantity !== undefined)
        .map(item => ({
          productId: item.productId,
          expectedQuantity: item.expectedQuantity,
          actualQuantity: item.actualQuantity || 0,
          notes: item.notes
        }));
      
      // Convert dayjs object to ISO string
      const formData = {
        ...values,
        countDate: values.countDate?.toISOString(),
        items
      };

      if (isEditing && count) {
        updateMutation.mutate({ 
          id: count.id, 
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

  // Columns for the items table
  const columns = [
    {
      title: t('inventory.product'),
      dataIndex: 'productName',
      key: 'productName',
      width: '25%'
    },
    {
      title: t('inventory.count.expectedQuantity'),
      dataIndex: 'expectedQuantity',
      key: 'expectedQuantity',
      width: '15%',
      render: (value: number) => `${value} ${itemsData.find(item => item.expectedQuantity === value)?.unit || ''}`
    },
    {
      title: t('inventory.count.actualQuantity'),
      key: 'actualQuantity',
      width: '20%',
      render: (_: any, record: any) => (
        <InputNumber
          min={0}
          step={0.01}
          style={{ width: '100%' }}
          value={record.actualQuantity}
          onChange={(value) => handleQuantityChange(value, record.productId)}
          placeholder={t('inventory.count.enterActualQuantity')}
        />
      )
    },
    {
      title: t('common.notes'),
      key: 'notes',
      width: '40%',
      render: (_: any, record: any) => (
        <Input
          value={record.notes}
          onChange={(e) => handleNotesChange(e.target.value, record.productId)}
          placeholder={t('common.enterNotes')}
        />
      )
    }
  ];

  return (
    <Modal
      title={isEditing ? t('inventory.count.editCount') : t('inventory.count.newCount')}
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
      width={900}
    >
      <Form
        form={form}
        layout="vertical"
        name="countForm"
      >
        <Form.Item
          name="reference"
          label={t('inventory.count.reference')}
          rules={[{ required: true, message: t('inventory.count.referenceRequired') }]}
        >
          <Input placeholder={t('inventory.count.enterReference')} />
        </Form.Item>

        <Form.Item
          name="countDate"
          label={t('inventory.count.countDate')}
          rules={[{ required: true, message: t('inventory.count.countDateRequired') }]}
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

      <div style={{ marginTop: 24, marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={5}>{t('inventory.count.items')}</Title>
          <Table
            dataSource={itemsData}
            columns={columns}
            rowKey="key"
            pagination={{ pageSize: 10 }}
            loading={templateLoading}
            scroll={{ y: 300 }}
          />
        </Space>
      </div>
    </Modal>
  );
};

export default CountForm;
