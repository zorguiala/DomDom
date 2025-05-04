import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber,
  Table, 
  Button, 
  message, 
  Space,
  Typography,
  Spin
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../../services/inventoryService';
import { inventoryForecastApi } from '../../../services/inventory-forecast-service';
import type { Product } from '../../../types/inventory';

const { Text } = Typography;
const { Search } = Input;

interface LeadTimeSettingsProps {
  open: boolean;
  onClose: () => void;
}

const LeadTimeSettings: React.FC<LeadTimeSettingsProps> = ({ 
  open, 
  onClose 
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingKey, setEditingKey] = useState('');
  const [form] = Form.useForm();

  // Query products
  const { 
    data: products, 
    isLoading 
  } = useQuery({
    queryKey: ['products-lead-time'],
    queryFn: () => inventoryApi.getProducts({ isActive: true }),
    enabled: open
  });

  // Update lead time mutation
  const updateLeadTimeMutation = useMutation({
    mutationFn: ({ productId, leadTimeDays }: { productId: string, leadTimeDays: number }) => 
      inventoryForecastApi.updateProductLeadTime(productId, leadTimeDays),
    onSuccess: () => {
      message.success(t('inventory.forecast.leadTimeUpdated'));
      queryClient.invalidateQueries({ queryKey: ['products-lead-time'] });
      queryClient.invalidateQueries({ queryKey: ['stock-forecasts'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] });
      setEditingKey('');
    },
    onError: (error: any) => {
      message.error(error.message || t('common.errorOccurred'));
    }
  });

  // Start editing a product
  const edit = (record: Product) => {
    form.setFieldsValue({ 
      leadTimeDays: record.leadTimeDays || 0
    });
    setEditingKey(record.id);
  };

  // Cancel editing
  const cancel = () => {
    setEditingKey('');
  };

  // Save changes
  const save = async (productId: string) => {
    try {
      const row = await form.validateFields();
      updateLeadTimeMutation.mutate({ 
        productId, 
        leadTimeDays: row.leadTimeDays 
      });
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  // Check if product is being edited
  const isEditing = (record: Product) => record.id === editingKey;

  // Filter products based on search
  const filteredProducts = products?.filter(product => {
    if (!search) return true;
    return product.name.toLowerCase().includes(search.toLowerCase());
  });

  // Columns for the products table
  const columns = [
    {
      title: t('inventory.product'),
      dataIndex: 'name',
      key: 'name',
      width: '40%'
    },
    {
      title: t('inventory.forecast.leadTimeDays'),
      dataIndex: 'leadTimeDays',
      key: 'leadTimeDays',
      width: '30%',
      render: (_: any, record: Product) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="leadTimeDays"
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: t('inventory.forecast.leadTimeDaysRequired'),
              },
            ]}
          >
            <InputNumber 
              min={0} 
              max={365}
              step={1}
              style={{ width: '100%' }}
            />
          </Form.Item>
        ) : (
          <span>{record.leadTimeDays || 0} {t('common.days')}</span>
        );
      },
    },
    {
      title: t('common.actions'),
      key: 'action',
      width: '30%',
      render: (_: any, record: Product) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button 
              type="primary" 
              onClick={() => save(record.id)}
              loading={updateLeadTimeMutation.isPending}
              size="small"
            >
              {t('common.save')}
            </Button>
            <Button 
              onClick={cancel}
              size="small"
            >
              {t('common.cancel')}
            </Button>
          </Space>
        ) : (
          <Button 
            disabled={!!editingKey} 
            onClick={() => edit(record)}
            size="small"
            type="link"
          >
            {t('common.edit')}
          </Button>
        );
      },
    },
  ];

  return (
    <Modal
      title={t('inventory.forecast.leadTimeSettings')}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          {t('common.close')}
        </Button>
      ]}
      width={800}
    >
      <div style={{ marginBottom: 16 }}>
        <Text>
          {t('inventory.forecast.leadTimeDescription')}
        </Text>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder={t('common.searchProducts')}
          allowClear
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          style={{ width: 300 }}
        />
      </div>
      
      <Form form={form} component={false}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : (
          <Table
            dataSource={filteredProducts}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        )}
      </Form>
    </Modal>
  );
};

export default LeadTimeSettings;
