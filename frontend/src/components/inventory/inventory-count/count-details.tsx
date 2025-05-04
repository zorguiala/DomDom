import React from 'react';
import { 
  Drawer, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Spin, 
  Empty,
  Descriptions,
  Divider,
  Button,
  Statistic,
  Row,
  Col,
  Card
} from 'antd';
import { 
  FileTextOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { inventoryCountApi } from '../../../services/inventory-count-service';
import type { InventoryCount, InventoryCountItem } from '../../../types/inventory-count';

const { Title, Text } = Typography;

interface CountDetailsProps {
  open: boolean;
  onClose: () => void;
  countId: string;
}

const CountDetails: React.FC<CountDetailsProps> = ({ 
  open, 
  onClose, 
  countId 
}) => {
  const { t } = useTranslation();

  // Query count details
  const { 
    data: count, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['inventory-count', countId],
    queryFn: () => inventoryCountApi.getInventoryCount(countId),
    enabled: !!countId && open
  });

  // Query variance report
  const { 
    data: varianceReport,
    isLoading: varianceLoading
  } = useQuery({
    queryKey: ['inventory-count-variance', countId],
    queryFn: () => inventoryCountApi.getVarianceReport(countId),
    enabled: !!countId && open && !!count && count.status !== 'pending'
  });

  // Get status tag color
  const getStatusColor = (status: string) => {
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
  const getStatusText = (status: string) => {
    return t(`inventory.count.status.${status}`);
  };

  // Get variance class based on value
  const getVarianceClass = (variance: number) => {
    if (variance === 0) return 'normal';
    if (variance > 0) return 'positive';
    return 'negative';
  };

  // Get variance percentage class
  const getVariancePercentageClass = (percentage: number) => {
    if (percentage === 0) return 'normal';
    if (Math.abs(percentage) <= 5) return 'minor';
    if (Math.abs(percentage) <= 15) return 'moderate';
    return 'significant';
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
      title: t('inventory.unit'),
      dataIndex: 'unit',
      key: 'unit',
      width: '10%'
    },
    {
      title: t('inventory.count.expectedQuantity'),
      dataIndex: 'expectedQuantity',
      key: 'expectedQuantity',
      width: '15%'
    },
    {
      title: t('inventory.count.actualQuantity'),
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      width: '15%',
      render: (value: number, record: InventoryCountItem) => (
        <Text>{value || 0}</Text>
      )
    },
    {
      title: t('inventory.count.variance'),
      key: 'variance',
      width: '15%',
      render: (_: any, record: InventoryCountItem) => {
        const variance = record.variance || 0;
        const className = getVarianceClass(variance);
        return (
          <Text 
            type={variance === 0 ? undefined : (variance > 0 ? 'success' : 'danger')}
            strong={variance !== 0}
          >
            {variance > 0 ? '+' : ''}{variance}
          </Text>
        );
      },
      sorter: (a: InventoryCountItem, b: InventoryCountItem) => 
        (a.variance || 0) - (b.variance || 0)
    },
    {
      title: t('inventory.count.variancePercentage'),
      key: 'variancePercentage',
      width: '15%',
      render: (_: any, record: InventoryCountItem) => {
        const percentage = record.variancePercentage || 0;
        const className = getVariancePercentageClass(percentage);
        return (
          <Space>
            <Text 
              type={percentage === 0 ? undefined : (percentage > 0 ? 'success' : 'danger')}
              strong={Math.abs(percentage) > 5}
            >
              {percentage > 0 ? '+' : ''}{percentage.toFixed(2)}%
            </Text>
            {Math.abs(percentage) > 15 && <WarningOutlined style={{ color: 'orange' }} />}
          </Space>
        );
      },
      sorter: (a: InventoryCountItem, b: InventoryCountItem) => 
        (a.variancePercentage || 0) - (b.variancePercentage || 0)
    },
    {
      title: t('common.notes'),
      dataIndex: 'notes',
      key: 'notes',
      width: '20%',
      render: (notes: string) => notes || '-'
    }
  ];

  if (isLoading) {
    return (
      <Drawer
        title={t('inventory.count.countDetails')}
        width={900}
        open={open}
        onClose={onClose}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      </Drawer>
    );
  }

  if (error || !count) {
    return (
      <Drawer
        title={t('inventory.count.countDetails')}
        width={900}
        open={open}
        onClose={onClose}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Empty 
          description={t('common.errorLoading')} 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      </Drawer>
    );
  }

  return (
    <Drawer
      title={
        <Space>
          <FileTextOutlined />
          <span>{t('inventory.count.countDetails')}</span>
          <Tag color={getStatusColor(count.status)}>
            {getStatusText(count.status)}
          </Tag>
        </Space>
      }
      width={900}
      open={open}
      onClose={onClose}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <Button type="primary" onClick={() => window.print()}>
          {t('common.print')}
        </Button>
      }
    >
      <Descriptions title={t('inventory.count.information')} bordered column={2}>
        <Descriptions.Item label={t('inventory.count.reference')}>
          {count.reference}
        </Descriptions.Item>
        <Descriptions.Item label={t('inventory.count.countDate')}>
          {new Date(count.countDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label={t('common.createdBy')}>
          {count.createdBy}
        </Descriptions.Item>
        <Descriptions.Item label={t('common.createdAt')}>
          {new Date(count.createdAt).toLocaleString()}
        </Descriptions.Item>
        {count.completedAt && (
          <Descriptions.Item label={t('inventory.count.completedAt')}>
            {new Date(count.completedAt).toLocaleString()}
          </Descriptions.Item>
        )}
        {count.reconciledAt && (
          <Descriptions.Item label={t('inventory.count.reconciledAt')}>
            {new Date(count.reconciledAt).toLocaleString()}
          </Descriptions.Item>
        )}
        <Descriptions.Item label={t('common.notes')} span={2}>
          {count.notes || '-'}
        </Descriptions.Item>
      </Descriptions>

      {varianceReport && count.status !== 'pending' && (
        <>
          <Divider />
          <Title level={5}>{t('inventory.count.varianceSummary')}</Title>
          
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title={t('inventory.count.totalItemsCounted')}
                  value={varianceReport.totalItemsCounted}
                  precision={0}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title={t('inventory.count.itemsWithVariance')}
                  value={varianceReport.itemsWithVariance}
                  precision={0}
                  valueStyle={varianceReport.itemsWithVariance > 0 ? { color: '#cf1322' } : undefined}
                  suffix={varianceReport.itemsWithVariance > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title={t('inventory.count.totalVarianceValue')}
                  value={varianceReport.totalVarianceValue}
                  precision={2}
                  prefix="$"
                  valueStyle={varianceReport.totalVarianceValue !== 0 ? 
                    (varianceReport.totalVarianceValue > 0 ? { color: '#3f8600' } : { color: '#cf1322' }) 
                    : undefined
                  }
                />
              </Card>
            </Col>
          </Row>
        </>
      )}

      <Divider />
      <Title level={5}>{t('inventory.count.countItems')}</Title>
      <Table
        dataSource={count.items}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={varianceLoading}
      />
    </Drawer>
  );
};

export default CountDetails;
