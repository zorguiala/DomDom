import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Input, 
  Modal,
  Tooltip 
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  HistoryOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryBatchApi } from '../../../services/inventory-batch-service';
import type { BatchInventoryStatus } from '../../../types/inventory-batch';
import BatchForm from './batch-form';
import BatchMovementsList from './batch-movements-list';

const { Title } = Typography;

const BatchList: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedProductId] = useState<string | undefined>();
  const [batchFormOpen, setBatchFormOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchInventoryStatus | undefined>();
  const [movementsOpen, setMovementsOpen] = useState(false);
  const [batchForMovements, setBatchForMovements] = useState<string | undefined>();

  // Query to get all batches
  const { data: batches, isLoading } = useQuery({
    queryKey: ['batch-inventory-status', selectedProductId],
    queryFn: () => inventoryBatchApi.getBatchInventoryStatus()
  });

  // Filter batches based on search
  const filteredBatches = batches?.filter(batch => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      batch.batchNumber.toLowerCase().includes(searchLower) ||
      batch.productName.toLowerCase().includes(searchLower)
    );
  });

  // Mutation to deactivate a batch
  const deactivateMutation = useMutation({
    mutationFn: (batchId: string) => inventoryBatchApi.deactivateBatch(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-inventory-status'] });
    }
  });

  // Handle deactivate confirmation
  const handleDeactivate = (batchId: string) => {
    Modal.confirm({
      title: t('inventory.batch.confirmDeactivate'),
      content: t('inventory.batch.deactivateWarning'),
      okText: t('common.yes'),
      cancelText: t('common.no'),
      onOk: () => deactivateMutation.mutate(batchId)
    });
  };

  // Handle opening the movements history
  const handleViewMovements = (batchId: string) => {
    setBatchForMovements(batchId);
    setMovementsOpen(true);
  };

  // Handle editing a batch
  const handleEditBatch = (batch: BatchInventoryStatus) => {
    setSelectedBatch(batch);
    setBatchFormOpen(true);
  };

  // Columns for the batch table
  const columns = [
    {
      title: t('inventory.batch.batchNumber'),
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      sorter: (a: BatchInventoryStatus, b: BatchInventoryStatus) => 
        a.batchNumber.localeCompare(b.batchNumber)
    },
    {
      title: t('inventory.product'),
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a: BatchInventoryStatus, b: BatchInventoryStatus) => 
        a.productName.localeCompare(b.productName)
    },
    {
      title: t('inventory.quantity'),
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      sorter: (a: BatchInventoryStatus, b: BatchInventoryStatus) => 
        a.currentQuantity - b.currentQuantity,
      render: (quantity: number, record: BatchInventoryStatus) => (
        <Space>
          {quantity} 
          {record.isLow && (
            <Tooltip title={t('inventory.batch.lowQuantity')}>
              <Tag color="warning"><WarningOutlined /> {t('inventory.lowStock')}</Tag>
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: t('inventory.cost'),
      dataIndex: 'unitCost',
      key: 'unitCost',
      render: (cost: number) => `$${cost.toFixed(2)}`
    },
    {
      title: t('inventory.batch.totalValue'),
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    {
      title: t('inventory.batch.received'),
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: t('inventory.batch.expiry'),
      key: 'expiryDate',
      render: (_: unknown, record: BatchInventoryStatus) => {
        if (!record.expiryDate) return t('inventory.batch.noExpiry');
        
        if (record.isExpired) {
          return (
            <Tag color="error">
              {t('inventory.batch.expired')} ({new Date(record.expiryDate).toLocaleDateString()})
            </Tag>
          );
        }
        
        return (
          <>
            {new Date(record.expiryDate).toLocaleDateString()}
            {record.daysUntilExpiry && record.daysUntilExpiry < 30 && (
              <Tag color="warning" style={{ marginLeft: 8 }}>
                {t('inventory.batch.expiresIn', { days: record.daysUntilExpiry })}
              </Tag>
            )}
          </>
        );
      }
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: BatchInventoryStatus) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEditBatch(record)}
            title={t('common.edit')}
          />
          <Button 
            icon={<HistoryOutlined />} 
            onClick={() => handleViewMovements(record.batchId)}
            title={t('inventory.batch.viewMovements')}
          />
          <Button 
            icon={<DeleteOutlined />} 
            danger
            onClick={() => handleDeactivate(record.batchId)}
            title={t('common.deactivate')}
          />
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>{t('inventory.batch.batchTracking')}</Title>
        <Space>
          <Input 
            placeholder={t('common.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedBatch(undefined);
              setBatchFormOpen(true);
            }}
          >
            {t('inventory.batch.addBatch')}
          </Button>
        </Space>
      </div>

      <Table 
        dataSource={filteredBatches} 
        columns={columns}
        rowKey="batchId"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      {batchFormOpen && (
        <BatchForm 
          open={batchFormOpen}
          onClose={() => setBatchFormOpen(false)}
          batch={selectedBatch}
        />
      )}

      {movementsOpen && batchForMovements && (
        <BatchMovementsList 
          open={movementsOpen}
          onClose={() => {
            setMovementsOpen(false);
            setBatchForMovements(undefined);
          }}
          batchId={batchForMovements}
        />
      )}
    </div>
  );
};

export default BatchList;
