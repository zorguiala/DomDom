import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Input, 
  DatePicker, 
  Modal, 
  Card,
  Statistic,
  Row,
  Col
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  AreaChartOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryWastageApi } from '../../../services/inventory-wastage-service';
import { WastageRecord, WastageReason } from '../../../types/inventory-wastage';
import WastageForm from './wastage-form';
import WastageAnalytics from './wastage-analytics';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const WastageList: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [wastageFormOpen, setWastageFormOpen] = useState(false);
  const [selectedWastage, setSelectedWastage] = useState<WastageRecord | undefined>();
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // Query to get all wastage records
  const { data: wastageRecords, isLoading } = useQuery({
    queryKey: ['wastage-records', dateRange?.[0]?.toISOString(), dateRange?.[1]?.toISOString()],
    queryFn: () => inventoryWastageApi.getWastageRecords(
      undefined, 
      dateRange?.[0]?.toDate(), 
      dateRange?.[1]?.toDate()
    )
  });

  // Query analytics summary for display
  const { data: analytics } = useQuery({
    queryKey: ['wastage-analytics-summary', dateRange?.[0]?.toISOString(), dateRange?.[1]?.toISOString()],
    queryFn: () => inventoryWastageApi.getWastageAnalytics(
      dateRange?.[0]?.toDate(), 
      dateRange?.[1]?.toDate()
    )
  });

  // Filter wastage records based on search
  const filteredWastage = wastageRecords?.filter(record => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      record.productName.toLowerCase().includes(searchLower) ||
      (record.batchNumber && record.batchNumber.toLowerCase().includes(searchLower))
    );
  });

  // Mutation to delete a wastage record
  const deleteMutation = useMutation({
    mutationFn: (id: string) => inventoryWastageApi.deleteWastageRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wastage-records'] });
      queryClient.invalidateQueries({ queryKey: ['wastage-analytics-summary'] });
    }
  });

  // Handle delete confirmation
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: t('inventory.wastage.confirmDelete'),
      content: t('inventory.wastage.deleteWarning'),
      okText: t('common.yes'),
      cancelText: t('common.no'),
      onOk: () => deleteMutation.mutate(id)
    });
  };

  // Get wastage reason tag color
  const getReasonColor = (reason: WastageReason) => {
    switch (reason) {
      case WastageReason.EXPIRED:
        return 'orange';
      case WastageReason.DAMAGED:
        return 'red';
      case WastageReason.QUALITY_ISSUES:
        return 'volcano';
      case WastageReason.SPILLAGE:
        return 'gold';
      case WastageReason.PRODUCTION_ERROR:
        return 'purple';
      case WastageReason.OTHER:
        return 'default';
      default:
        return 'default';
    }
  };

  // Columns for the wastage table
  const columns = [
    {
      title: t('inventory.wastage.date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: WastageRecord, b: WastageRecord) => 
        new Date(a.date).getTime() - new Date(b.date).getTime(),
      defaultSortOrder: 'descend' as 'descend'
    },
    {
      title: t('inventory.product'),
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a: WastageRecord, b: WastageRecord) => 
        a.productName.localeCompare(b.productName)
    },
    {
      title: t('inventory.batch.batchNumber'),
      key: 'batchNumber',
      render: (record: WastageRecord) => record.batchNumber || '-'
    },
    {
      title: t('inventory.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a: WastageRecord, b: WastageRecord) => a.quantity - b.quantity
    },
    {
      title: t('inventory.wastage.reason'),
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: WastageReason) => (
        <Tag color={getReasonColor(reason)}>
          {t(`inventory.wastage.reasons.${reason}`)}
        </Tag>
      ),
      filters: [
        { text: t(`inventory.wastageManagement.wastageReasons.expired`), value: WastageReason.EXPIRED },
        { text: t(`inventory.wastageManagement.wastageReasons.damaged`), value: WastageReason.DAMAGED },
        { text: t(`inventory.wastageManagement.wastageReasons.qualityIssue`), value: WastageReason.QUALITY_ISSUES },
        { text: t(`inventory.wastageManagement.wastageReasons.contamination`), value: WastageReason.SPILLAGE },
        { text: t(`inventory.wastageManagement.wastageReasons.processingLoss`), value: WastageReason.PRODUCTION_ERROR },
        { text: t(`inventory.wastageManagement.wastageReasons.other`), value: WastageReason.OTHER }
      ],
      onFilter: (value: any, record: WastageRecord) => record.reason === value
    },
    {
      title: t('inventory.wastage.reportedBy'),
      dataIndex: 'reportedBy',
      key: 'reportedBy'
    },
    {
      title: t('common.notes'),
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => notes || '-'
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: WastageRecord) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setSelectedWastage(record);
              setWastageFormOpen(true);
            }}
            title={t('common.edit')}
          />
          <Button 
            icon={<DeleteOutlined />} 
            danger
            onClick={() => handleDelete(record.id)}
            title={t('common.delete')}
          />
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>{t('inventory.wastage.wastageManagement')}</Title>
        <Space>
          <RangePicker 
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            allowClear
          />
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
              setSelectedWastage(undefined);
              setWastageFormOpen(true);
            }}
          >
            {t('inventory.wastage.recordWastage')}
          </Button>
          <Button 
            icon={<AreaChartOutlined />}
            onClick={() => setAnalyticsOpen(true)}
          >
            {t('inventory.wastage.viewAnalytics')}
          </Button>
        </Space>
      </div>

      {/* Summary statistics */}
      {analytics && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('inventory.wastage.totalRecords')}
                value={analytics.totalRecords}
                precision={0}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('inventory.wastage.totalQuantity')}
                value={analytics.totalQuantity}
                precision={2}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('inventory.wastage.totalValue')}
                value={analytics.totalValue}
                precision={2}
                prefix="$"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('inventory.wastage.topReason')}
                value={analytics.byReason.length > 0 ? 
                  t(`inventory.wastage.reasons.${analytics.byReason[0].reason}`) 
                  : '-'
                }
                valueStyle={{ fontSize: '16px' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Table 
        dataSource={filteredWastage} 
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      {wastageFormOpen && (
        <WastageForm 
          open={wastageFormOpen}
          onClose={() => {
            setWastageFormOpen(false);
            setSelectedWastage(undefined);
          }}
          wastageRecord={selectedWastage}
        />
      )}

      <WastageAnalytics 
        open={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        dateRange={dateRange}
      />
    </div>
  );
};

export default WastageList;
