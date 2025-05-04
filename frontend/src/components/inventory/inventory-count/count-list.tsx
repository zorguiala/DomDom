import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Modal,
  Input 
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  FileTextOutlined,
  CheckOutlined,
  ReconciliationOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryCountApi } from '../../../services/inventory-count-service';
import { InventoryCount, CountStatus } from '../../../types/inventory-count';
import CountForm from './count-form';
import CountDetails from './count-details';
import ReconciliationForm from './reconciliation-form';

const { Title } = Typography;
// Will add date filtering in a future enhancement

const CountList: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter] = useState<CountStatus | undefined>();
  const [countFormOpen, setCountFormOpen] = useState(false);
  const [selectedCount, setSelectedCount] = useState<InventoryCount | undefined>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reconciliationOpen, setReconciliationOpen] = useState(false);

  // Query to get all inventory counts
  const { data: counts, isLoading } = useQuery({
    queryKey: ['inventory-counts', statusFilter],
    queryFn: () => inventoryCountApi.getInventoryCounts(statusFilter)
  });

  // Filter counts based on search
  const filteredCounts = counts?.filter(count => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      count.reference.toLowerCase().includes(searchLower)
    );
  });

  // Mutation to delete an inventory count
  const deleteMutation = useMutation({
    mutationFn: (countId: string) => inventoryCountApi.deleteInventoryCount(countId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-counts'] });
    }
  });

  // Handle delete confirmation
  const handleDelete = (countId: string) => {
    Modal.confirm({
      title: t('inventory.count.deleteConfirmation'),
      content: t('inventory.count.deleteWarning'),
      okText: t('common.yes'),
      cancelText: t('common.no'),
      onOk: () => deleteMutation.mutate(countId)
    });
  };

  // Mutation to update count status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: CountStatus }) => 
      inventoryCountApi.updateCountStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-counts'] });
    }
  });

  // Handle status update
  const handleUpdateStatus = (countId: string, status: CountStatus) => {
    updateStatusMutation.mutate({ id: countId, status });
  };

  // Handle opening details
  const handleViewDetails = (count: InventoryCount) => {
    setSelectedCount(count);
    setDetailsOpen(true);
  };

  // Handle opening reconciliation
  const handleReconcile = (count: InventoryCount) => {
    setSelectedCount(count);
    setReconciliationOpen(true);
  };

  // Get status tag color
  const getStatusColor = (status: CountStatus) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'in_progress':
        return 'processing';
      case 'completed':
        return 'warning';
      case 'reconciled':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get status display text
  const getStatusText = (status: CountStatus) => {
    return t(`inventory.count.status.${status}`);
  };

  // Columns for the count table
  const columns = [
    {
      title: t('inventory.count.reference'),
      dataIndex: 'reference',
      key: 'reference',
      sorter: (a: InventoryCount, b: InventoryCount) => 
        a.reference.localeCompare(b.reference)
    },
    {
      title: t('inventory.count.countDate'),
      dataIndex: 'countDate',
      key: 'countDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: InventoryCount, b: InventoryCount) => 
        new Date(a.countDate).getTime() - new Date(b.countDate).getTime()
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: CountStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: t('inventory.count.status.pending'), value: CountStatus.PENDING },
        { text: t('inventory.count.status.in_progress'), value: CountStatus.IN_PROGRESS },
        { text: t('inventory.count.status.completed'), value: CountStatus.COMPLETED },
        { text: t('inventory.count.status.reconciled'), value: CountStatus.RECONCILED }
      ],
      onFilter: (value: any, record: InventoryCount) => record.status === value
    },
    {
      title: t('inventory.count.itemCount'),
      key: 'itemCount',
      render: (_: any, record: InventoryCount) => record.items.length
    },
    {
      title: t('inventory.count.createdBy'),
      dataIndex: 'createdBy',
      key: 'createdBy'
    },
    {
      title: t('common.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: InventoryCount) => (
        <Space>
          <Button 
            icon={<FileTextOutlined />} 
            onClick={() => handleViewDetails(record)}
            title={t('inventory.count.viewDetails')}
          />
          
          {record.status === 'pending' && (
            <>
              <Button 
                icon={<EditOutlined />} 
                onClick={() => {
                  setSelectedCount(record);
                  setCountFormOpen(true);
                }}
                title={t('common.edit')}
              />
              <Button 
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleUpdateStatus(record.id, CountStatus.IN_PROGRESS)}
                title={t('inventory.count.startCount')}
              />
              <Button 
                icon={<DeleteOutlined />} 
                danger
                onClick={() => handleDelete(record.id)}
                title={t('common.delete')}
              />
            </>
          )}
          
          {record.status === CountStatus.IN_PROGRESS && (
            <Button 
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleUpdateStatus(record.id, CountStatus.COMPLETED)}
              title={t('inventory.count.completeCount')}
            />
          )}
          
          {record.status === CountStatus.COMPLETED && (
            <Button 
              type="primary"
              icon={<ReconciliationOutlined />}
              onClick={() => handleReconcile(record)}
              title={t('inventory.count.reconcile')}
            />
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>{t('inventory.count.inventoryCounts')}</Title>
        <Space>
          <Input 
            placeholder={t('common.search')}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedCount(undefined);
              setCountFormOpen(true);
            }}
          >
            {t('inventory.count.newCount')}
          </Button>
        </Space>
      </div>

      <Table 
        dataSource={filteredCounts} 
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      {countFormOpen && (
        <CountForm 
          open={countFormOpen}
          onClose={() => setCountFormOpen(false)}
          count={selectedCount}
        />
      )}

      {detailsOpen && selectedCount && (
        <CountDetails 
          open={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedCount(undefined);
          }}
          countId={selectedCount.id}
        />
      )}

      {reconciliationOpen && selectedCount && (
        <ReconciliationForm 
          open={reconciliationOpen}
          onClose={() => {
            setReconciliationOpen(false);
            setSelectedCount(undefined);
          }}
          countId={selectedCount.id}
        />
      )}
    </div>
  );
};

export default CountList;
