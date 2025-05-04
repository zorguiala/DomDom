import React from 'react';
import { 
  Drawer, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Spin,
  Empty
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { inventoryBatchApi } from '../../../services/inventory-batch-service';
import type { BatchMovement } from '../../../types/inventory-batch';

const { Title, Text } = Typography;

interface BatchMovementsListProps {
  open: boolean;
  onClose: () => void;
  batchId: string;
}

const BatchMovementsList: React.FC<BatchMovementsListProps> = ({ 
  open, 
  onClose, 
  batchId 
}) => {
  const { t } = useTranslation();

  // Query batch movements
  const { 
    data: movements, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['batch-movements', batchId],
    queryFn: () => inventoryBatchApi.getBatchMovements(batchId),
    enabled: !!batchId && open
  });

  // Get batch information
  const { 
    data: batch, 
    isLoading: batchLoading 
  } = useQuery({
    queryKey: ['batch', batchId],
    queryFn: () => inventoryBatchApi.getBatch(batchId),
    enabled: !!batchId && open
  });

  // Columns for the movements table
  const columns = [
    {
      title: t('inventory.batch.movementDate'),
      dataIndex: 'movementDate',
      key: 'movementDate',
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: (a: BatchMovement, b: BatchMovement) => 
        new Date(a.movementDate).getTime() - new Date(b.movementDate).getTime(),
      defaultSortOrder: 'descend' as 'descend'
    },
    {
      title: t('inventory.batch.movementType'),
      dataIndex: 'movementType',
      key: 'movementType',
      render: (type: string) => {
        let color = 'blue';
        switch (type) {
          case 'IN':
            color = 'green';
            break;
          case 'OUT':
            color = 'orange';
            break;
          case 'ADJUSTMENT':
            color = 'blue';
            break;
          case 'WASTE':
            color = 'red';
            break;
        }
        return <Tag color={color}>{t(`inventory.batch.${type.toLowerCase()}`)}</Tag>;
      }
    },
    {
      title: t('inventory.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: BatchMovement) => {
        const prefix = ['IN', 'ADJUSTMENT'].includes(record.movementType) && quantity > 0 
          ? '+' 
          : '';
        return `${prefix}${quantity}`;
      }
    },
    {
      title: t('inventory.batch.reference'),
      dataIndex: 'reference',
      key: 'reference',
      render: (reference: string) => reference || '-'
    },
    {
      title: t('common.notes'),
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => notes || '-'
    }
  ];

  return (
    <Drawer
      title={
        <Space direction="vertical" size={0}>
          <Title level={4}>{t('inventory.batch.movementHistory')}</Title>
          {!batchLoading && batch && (
            <>
              <Text>{t('inventory.batch.batchNumber')}: {batch.batchNumber}</Text>
              <Text>{t('inventory.product')}: {batch.product?.name}</Text>
            </>
          )}
        </Space>
      }
      width={800}
      open={open}
      onClose={onClose}
      bodyStyle={{ paddingBottom: 80 }}
    >
      {isLoading || batchLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Empty 
          description={t('common.errorLoading')} 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      ) : (
        <Table
          dataSource={movements}
          columns={columns}
          rowKey={(record, index) => `${record.batchId}-${index}`}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <Empty description={t('inventory.batch.noMovements')} />
            )
          }}
        />
      )}
    </Drawer>
  );
};

export default BatchMovementsList;
