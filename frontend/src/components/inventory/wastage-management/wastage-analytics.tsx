import React, { useState } from 'react';
import { 
  Drawer, 
  Tabs, 
  Spin, 
  Empty, 
  Typography, 
  Table, 
  Card, 
  Statistic, 
  Row, 
  Col,
  Tag,
  DatePicker,
  Space,
  Select,
  Divider,
  Alert
} from 'antd';
import { 
  PieChartOutlined, 
  BarChartOutlined, 
  LineChartOutlined, 
  TableOutlined,
  WarningOutlined,
  DollarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { inventoryWastageApi } from '../../../services/inventory-wastage-service';
import { WastageReason, WastageReportItem } from '../../../types/inventory-wastage';
import type { WastageAnalytics } from '../../../types/inventory-wastage';

// Define interface for monthly data items
interface MonthlyWastageData {
  month: string;
  count: number;
  quantity: number;
  value: number;
}
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

interface WastageAnalyticsProps {
  open: boolean;
  onClose: () => void;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
}

const WastageAnalytics: React.FC<WastageAnalyticsProps> = ({ 
  open, 
  onClose, 
  dateRange 
}) => {
  const { t } = useTranslation();
  const [localDateRange, setLocalDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(dateRange);
  const [displayMetric, setDisplayMetric] = useState<'value' | 'quantity'>('value');

  // Query wastage analytics data
  const { 
    data: analytics, 
    isLoading: analyticsLoading 
  } = useQuery({
    queryKey: ['wastage-analytics', localDateRange?.[0]?.toISOString(), localDateRange?.[1]?.toISOString()],
    queryFn: () => inventoryWastageApi.getWastageAnalytics(
      localDateRange?.[0]?.toDate(), 
      localDateRange?.[1]?.toDate()
    ),
    enabled: open
  });

  // Query wastage by product data
  const { 
    data: byProduct, 
    isLoading: productLoading 
  } = useQuery({
    queryKey: ['wastage-by-product', localDateRange?.[0]?.toISOString(), localDateRange?.[1]?.toISOString()],
    queryFn: () => inventoryWastageApi.getWastageByProduct(
      localDateRange?.[0]?.toDate(), 
      localDateRange?.[1]?.toDate()
    ),
    enabled: open
  });

  // Query wastage by reason data
  const { 
    data: byReason, 
    isLoading: reasonLoading 
  } = useQuery({
    queryKey: ['wastage-by-reason', localDateRange?.[0]?.toISOString(), localDateRange?.[1]?.toISOString()],
    queryFn: () => inventoryWastageApi.getWastageByReason(
      localDateRange?.[0]?.toDate(), 
      localDateRange?.[1]?.toDate()
    ),
    enabled: open
  });

  // Handle date range change
  const handleDateRangeChange = (dates: any) => {
    setLocalDateRange(dates);
  };

  // Get wastage reason tag color
  const getReasonColor = (reason: string) => {
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

  // Columns for the product wastage table
  const productColumns = [
    {
      title: t('inventory.product'),
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a: WastageReportItem, b: WastageReportItem) => 
        a.productName.localeCompare(b.productName)
    },
    {
      title: t('inventory.wastage.totalQuantity'),
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      sorter: (a: WastageReportItem, b: WastageReportItem) => 
        a.totalQuantity - b.totalQuantity,
      defaultSortOrder: 'descend' as 'descend'
    },
    {
      title: t('inventory.wastage.totalCost'),
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (cost: number) => `$${cost.toFixed(2)}`,
      sorter: (a: WastageReportItem, b: WastageReportItem) => 
        a.totalCost - b.totalCost
    },
    {
      title: t('inventory.wastage.primaryReasons'),
      key: 'reasons',
      render: (_: any, record: WastageReportItem) => (
        <Space size={[0, 4]} wrap>
          {record.wastageReasons
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 3)
            .map(reason => (
              <Tag color={getReasonColor(reason.reason)} key={reason.reason}>
                {t(`inventory.wastage.reasons.${reason.reason}`)} ({reason.quantity})
              </Tag>
            ))}
        </Space>
      )
    }
  ];

  // Columns for the reason wastage table
  const reasonColumns = [
    {
      title: t('inventory.wastage.reason'),
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => (
        <Tag color={getReasonColor(reason)}>
          {t(`inventory.wastage.reasons.${reason}`)}
        </Tag>
      )
    },
    {
      title: t('inventory.wastage.occurrences'),
      dataIndex: 'count',
      key: 'count',
      sorter: (a: any, b: any) => a.count - b.count
    },
    {
      title: t('inventory.wastage.totalQuantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a: any, b: any) => a.quantity - b.quantity,
      defaultSortOrder: 'descend' as 'descend'
    },
    {
      title: t('inventory.wastage.totalValue'),
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => `$${value.toFixed(2)}`,
      sorter: (a: any, b: any) => a.value - b.value
    },
    {
      title: t('inventory.wastage.averageValue'),
      key: 'averageValue',
      render: (_: any, record: any) => 
        `$${(record.value / record.count).toFixed(2)} ${t('inventory.wastage.perOccurrence')}`
    }
  ];

  // Columns for the monthly wastage table
  const monthlyColumns = [
    {
      title: t('inventory.wastage.month'),
      dataIndex: 'month',
      key: 'month'
    },
    {
      title: t('inventory.wastage.occurrences'),
      dataIndex: 'count',
      key: 'count',
      sorter: (a: MonthlyWastageData, b: MonthlyWastageData) => a.count - b.count
    },
    {
      title: t('inventory.wastage.totalQuantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a: MonthlyWastageData, b: MonthlyWastageData) => a.quantity - b.quantity
    },
    {
      title: t('inventory.wastage.totalValue'),
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => `$${value.toFixed(2)}`,
      sorter: (a: MonthlyWastageData, b: MonthlyWastageData) => a.value - b.value,
      defaultSortOrder: 'descend' as 'descend'
    }
  ];

  const isLoading = analyticsLoading || productLoading || reasonLoading;

  if (isLoading) {
    return (
      <Drawer
        title={t('inventory.wastage.analytics')}
        placement="right"
        width={1000}
        onClose={onClose}
        open={open}
      >
        <div style={{ textAlign: 'center', marginTop: 100 }}>
          <Spin size="large" />
          <p>{t('common.loading')}</p>
        </div>
      </Drawer>
    );
  }

  if (!analytics || !byProduct || !byReason) {
    return (
      <Drawer
        title={t('inventory.wastage.analytics')}
        placement="right"
        width={1000}
        onClose={onClose}
        open={open}
      >
        <Empty description={t('inventory.wastage.noDataAvailable')} />
      </Drawer>
    );
  }

  // Calculate top wastage products
  const topWastageProducts = [...byProduct]
    .sort((a, b) => displayMetric === 'value' 
      ? b.totalCost - a.totalCost 
      : b.totalQuantity - a.totalQuantity
    )
    .slice(0, 5);

  // Calculate top wastage reasons
  const topWastageReasons = [...analytics.byReason]
    .sort((a, b) => displayMetric === 'value' 
      ? b.value - a.value 
      : b.quantity - a.quantity
    )
    .slice(0, 5);

  return (
    <Drawer
      title={
        <Space>
          <BarChartOutlined />
          <span>{t('inventory.wastage.analytics')}</span>
        </Space>
      }
      placement="right"
      width={1000}
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <Select
            defaultValue="value"
            onChange={(value: 'value' | 'quantity') => setDisplayMetric(value)}
            style={{ width: 120 }}
          >
            <Option value="value">{t('inventory.wastage.byValue')}</Option>
            <Option value="quantity">{t('inventory.wastage.byQuantity')}</Option>
          </Select>
          <RangePicker 
            value={localDateRange}
            onChange={handleDateRangeChange}
            allowClear
          />
        </Space>
      }
    >
      {/* Summary statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('inventory.wastage.totalRecords')}
              value={analytics.totalRecords}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('inventory.wastage.totalQuantity')}
              value={analytics.totalQuantity}
              precision={2}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('inventory.wastage.totalValue')}
              value={analytics.totalValue}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('inventory.wastage.avgValuePerRecord')}
              value={analytics.totalRecords ? analytics.totalValue / analytics.totalRecords : 0}
              precision={2}
              prefix="$"
            />
          </Card>
        </Col>
      </Row>

      {/* Top wastage summary */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title={t('inventory.wastage.topWastageProducts')}>
            {topWastageProducts.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('inventory.wastage.noData')} />
            ) : (
              <ul className="top-wastage-list">
                {topWastageProducts.map((product, index) => (
                  <li key={product.productId}>
                    <div className="rank">{index + 1}</div>
                    <div className="name">{product.productName}</div>
                    <div className="value">
                      {displayMetric === 'value' 
                        ? `$${product.totalCost.toFixed(2)}` 
                        : `${product.totalQuantity.toFixed(2)}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title={t('inventory.wastage.topWastageReasons')}>
            {topWastageReasons.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('inventory.wastage.noData')} />
            ) : (
              <ul className="top-wastage-list">
                {topWastageReasons.map((reason, index) => (
                  <li key={reason.reason}>
                    <div className="rank">{index + 1}</div>
                    <div className="name">
                      <Tag color={getReasonColor(reason.reason)}>
                        {t(`inventory.wastage.reasons.${reason.reason}`)}
                      </Tag>
                    </div>
                    <div className="value">
                      {displayMetric === 'value' 
                        ? `$${reason.value.toFixed(2)}` 
                        : `${reason.quantity.toFixed(2)}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Col>
      </Row>

      {/* Tabs for detailed reports */}
      <Tabs defaultActiveKey="productTab">
        <TabPane
          tab={
            <span>
              <TableOutlined />
              {t('inventory.wastage.byProduct')}
            </span>
          }
          key="productTab"
        >
          <Table 
            dataSource={byProduct} 
            columns={productColumns} 
            rowKey="productId"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane
          tab={
            <span>
              <PieChartOutlined />
              {t('inventory.wastage.byReason')}
            </span>
          }
          key="reasonTab"
        >
          <Table 
            dataSource={analytics.byReason} 
            columns={reasonColumns} 
            rowKey="reason"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane
          tab={
            <span>
              <LineChartOutlined />
              {t('inventory.wastage.byMonth')}
            </span>
          }
          key="timeTab"
        >
          <Table 
            dataSource={analytics.byMonth} 
            columns={monthlyColumns} 
            rowKey="month"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
      </Tabs>

      <Divider />
      
      {/* Insights and recommendations */}
      <Title level={4}>{t('inventory.wastage.insightsRecommendations')}</Title>
      
      {topWastageProducts.length > 0 && (
        <Alert
          message={t('inventory.wastage.productInsight')}
          description={
            <div>
              {t('inventory.wastage.productInsightDesc')}: 
              <strong> {topWastageProducts[0].productName}</strong> 
              {displayMetric === 'value'
                ? t('inventory.wastage.costingApprox', { 
                    value: topWastageProducts[0].totalCost.toFixed(2) 
                  })
                : t('inventory.wastage.withQuantity', { 
                    quantity: topWastageProducts[0].totalQuantity.toFixed(2) 
                  })
              }
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {topWastageReasons.length > 0 && (
        <Alert
          message={t('inventory.wastage.reasonInsight')}
          description={
            <div>
              {t('inventory.wastage.reasonInsightDesc')}: 
              <strong> {t(`inventory.wastage.reasons.${topWastageReasons[0].reason}`)}</strong>.
              {t('inventory.wastage.recommendedAction', {
                reason: t(`inventory.wastage.reasons.${topWastageReasons[0].reason}`)
              })}
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <style>{`
        .top-wastage-list {
          list-style: none;
          padding: 0;
        }

        .top-wastage-list li {
          display: flex;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .top-wastage-list li:last-child {
          border-bottom: none;
        }

        .top-wastage-list .rank {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #1890ff;
          color: white;
          font-weight: bold;
          margin-right: 16px;
        }

        .top-wastage-list li:nth-child(1) .rank {
          background-color: #cf1322;
        }

        .top-wastage-list li:nth-child(2) .rank {
          background-color: #fa8c16;
        }

        .top-wastage-list li:nth-child(3) .rank {
          background-color: #faad14;
        }

        .top-wastage-list .name {
          flex: 1;
        }

        .top-wastage-list .value {
          font-weight: bold;
          color: #cf1322;
        }
      `}</style>
    </Drawer>
  );
};

export default WastageAnalytics;
