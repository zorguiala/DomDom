import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Spin, 
  Empty,
  Button,
  Select,
  Tooltip,
  Divider,
  Alert
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryForecastApi } from '../../../services/inventory-forecast-service';
import { StockForecast, LowStockAlert } from '../../../types/inventory-forecast';
import UsageTrendChart from './usage-trend-chart';
import LeadTimeSettings from './lead-time-settings';

const { Title, Text } = Typography;
const { Option } = Select;

const ForecastDashboard: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [leadTimeSettingsOpen, setLeadTimeSettingsOpen] = useState(false);

  // Query to get stock forecasts
  const { 
    data: forecasts, 
    isLoading: forecastsLoading 
  } = useQuery({
    queryKey: ['stock-forecasts'],
    queryFn: () => inventoryForecastApi.getStockForecasts()
  });

  // Query to get low stock alerts
  const { 
    data: lowStockAlerts, 
    isLoading: alertsLoading 
  } = useQuery({
    queryKey: ['low-stock-alerts'],
    queryFn: () => inventoryForecastApi.getLowStockAlerts()
  });

  // Query to get inventory optimization metrics
  const { 
    data: optimizationMetrics, 
    isLoading: metricsLoading 
  } = useQuery({
    queryKey: ['inventory-optimization-metrics'],
    queryFn: () => inventoryForecastApi.getOptimizationMetrics()
  });

  // Query to get reorder suggestions
  const { 
    data: reorderSuggestions, 
    isLoading: suggestionsLoading 
  } = useQuery({
    queryKey: ['reorder-suggestions'],
    queryFn: () => inventoryForecastApi.getReorderSuggestions()
  });

  // Query to get usage trend for selected product
  const { 
    data: usageTrend, 
    isLoading: trendLoading 
  } = useQuery({
    queryKey: ['usage-trend', selectedProductId],
    queryFn: () => inventoryForecastApi.getUsageTrend(selectedProductId || ''),
    enabled: !!selectedProductId
  });

  // Handle refresh
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['stock-forecasts'] });
    queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-optimization-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['reorder-suggestions'] });
    if (selectedProductId) {
      queryClient.invalidateQueries({ queryKey: ['usage-trend', selectedProductId] });
    }
  };

  // Handle product selection for trend view
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'error';
      case 'LOW':
        return 'warning';
      case 'NORMAL':
        return 'success';
      case 'EXCESS':
        return 'blue';
      default:
        return 'default';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'INCREASING':
        return <ArrowUpOutlined style={{ color: '#cf1322' }} />;
      case 'DECREASING':
        return <ArrowDownOutlined style={{ color: '#3f8600' }} />;
      case 'STABLE':
        return <MinusOutlined />;
      default:
        return null;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  // Columns for the forecasts table
  const forecastColumns = [
    {
      title: t('inventory.product'),
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: StockForecast) => (
        <Button 
          type="link" 
          onClick={() => handleProductSelect(record.productId)}
        >
          {text}
        </Button>
      )
    },
    {
      title: t('inventory.currentStock'),
      dataIndex: 'currentStock',
      key: 'currentStock',
      sorter: (a: StockForecast, b: StockForecast) => a.currentStock - b.currentStock
    },
    {
      title: t('inventory.forecast.statusLabel'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {t(`inventory.forecast.status.${status.toLowerCase()}`)}
        </Tag>
      ),
      filters: [
        { text: t('inventory.forecast.status.critical'), value: 'CRITICAL' },
        { text: t('inventory.forecast.status.low'), value: 'LOW' },
        { text: t('inventory.forecast.status.normal'), value: 'NORMAL' },
        { text: t('inventory.forecast.status.excess'), value: 'EXCESS' }
      ],
      onFilter: (value: any, record: StockForecast) => record.status === value
    },
    {
      title: t('inventory.forecast.daysRemaining'),
      dataIndex: 'daysUntilStockout',
      key: 'daysUntilStockout',
      render: (days: number) => (
        <Space>
          {days <= 14 ? (
            <Tag color={days <= 7 ? 'error' : 'warning'}>
              <ClockCircleOutlined /> {days} {t('common.days')}
            </Tag>
          ) : (
            <span>{days} {t('common.days')}</span>
          )}
        </Space>
      ),
      sorter: (a: StockForecast, b: StockForecast) => a.daysUntilStockout - b.daysUntilStockout,
      defaultSortOrder: 'ascend' as const
    },
    {
      title: t('inventory.forecast.avgDailyUsage'),
      dataIndex: 'averageDailyUsage',
      key: 'averageDailyUsage',
      render: (usage: number) => usage.toFixed(2),
      sorter: (a: StockForecast, b: StockForecast) => a.averageDailyUsage - b.averageDailyUsage
    },
    {
      title: t('inventory.forecast.reorderPoint'),
      dataIndex: 'reorderPoint',
      key: 'reorderPoint',
      render: (point: number, record: StockForecast) => (
        <Space>
          {point}
          {record.currentStock <= point && (
            <Tooltip title={t('inventory.forecast.belowReorderPoint')}>
              <WarningOutlined style={{ color: '#faad14' }} />
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: t('inventory.forecast.suggestedOrder'),
      dataIndex: 'suggestedOrderQuantity',
      key: 'suggestedOrderQuantity',
      render: (quantity: number) => quantity > 0 ? quantity : '-'
    }
  ];

  // Columns for the low stock alerts table
  const alertColumns = [
    {
      title: t('inventory.product'),
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: LowStockAlert) => (
        <Button 
          type="link" 
          onClick={() => handleProductSelect(record.productId)}
        >
          {text}
        </Button>
      )
    },
    {
      title: t('inventory.forecast.priorityLabel'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {t(`inventory.forecast.priority.${priority.toLowerCase()}`)}
        </Tag>
      ),
      filters: [
        { text: t('inventory.forecast.priority.high'), value: 'HIGH' },
        { text: t('inventory.forecast.priority.medium'), value: 'MEDIUM' },
        { text: t('inventory.forecast.priority.low'), value: 'LOW' }
      ],
      onFilter: (value: any, record: LowStockAlert) => record.priority === value,
      sorter: (a: LowStockAlert, b: LowStockAlert) => {
        const priorityValues = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityValues[a.priority as keyof typeof priorityValues] - 
               priorityValues[b.priority as keyof typeof priorityValues];
      },
      defaultSortOrder: 'descend' as const
    },
    {
      title: t('inventory.currentStock'),
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (stock: number, record: LowStockAlert) => (
        <Space>
          <span>{stock}</span>
          {stock <= record.minimumStock && (
            <WarningOutlined style={{ color: '#cf1322' }} />
          )}
        </Space>
      )
    },
    {
      title: t('inventory.minimumStock'),
      dataIndex: 'minimumStock',
      key: 'minimumStock'
    },
    {
      title: t('inventory.forecast.daysRemaining'),
      dataIndex: 'daysUntilStockout',
      key: 'daysUntilStockout',
      render: (days: number) => (
        <Space>
          <ClockCircleOutlined />
          <span>{days} {t('common.days')}</span>
        </Space>
      ),
      sorter: (a: LowStockAlert, b: LowStockAlert) => a.daysUntilStockout - b.daysUntilStockout
    },
    {
      title: t('inventory.forecast.leadTimeDays'),
      dataIndex: 'leadTimeDays',
      key: 'leadTimeDays',
      render: (days: number) => `${days} ${t('common.days')}`
    },
    {
      title: t('inventory.forecast.trendLabel'),
      dataIndex: 'usageTrend',
      key: 'usageTrend',
      render: (trend: string) => (
        <Space>
          {getTrendIcon(trend)}
          <span>{t(`inventory.forecast.trend.${trend.toLowerCase()}`)}</span>
        </Space>
      )
    }
  ];

  const isLoading = forecastsLoading || alertsLoading || metricsLoading || suggestionsLoading;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!forecasts || !lowStockAlerts || !optimizationMetrics) {
    return (
      <Empty 
        description={t('inventory.forecast.noDataAvailable')} 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  // Critical products that need immediate attention
  const criticalProducts = forecasts.filter(f => f.status === 'CRITICAL');
  const highPriorityAlerts = lowStockAlerts.filter(a => a.priority === 'HIGH');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3}>{t('inventory.forecast.inventoryForecast')}</Title>
        <Space>
          <Button 
            icon={<SettingOutlined />} 
            onClick={() => setLeadTimeSettingsOpen(true)}
          >
            {t('inventory.forecast.leadTimeSettings')}
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
          >
            {t('common.refresh')}
          </Button>
        </Space>
      </div>

      {/* Summary metrics cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('inventory.forecast.stockoutRisk')}
              value={criticalProducts.length}
              suffix={`/ ${forecasts.length}`}
              valueStyle={{ color: criticalProducts.length > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('inventory.forecast.inventoryTurnover')}
              value={optimizationMetrics.inventoryTurnoverRate}
              precision={2}
              valueStyle={{ color: 
                optimizationMetrics.inventoryTurnoverRate < 3 ? '#faad14' : 
                optimizationMetrics.inventoryTurnoverRate > 8 ? '#3f8600' : 
                '#1890ff'
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('inventory.forecast.excessValue')}
              value={optimizationMetrics.excessInventoryValue}
              precision={2}
              prefix="$"
              valueStyle={{ color: optimizationMetrics.excessInventoryValue > 1000 ? '#faad14' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('inventory.forecast.averageStockDays')}
              value={optimizationMetrics.averageInventoryDays}
              precision={1}
              suffix={t('common.days')}
              valueStyle={{ color: 
                optimizationMetrics.averageInventoryDays > 60 ? '#faad14' : 
                optimizationMetrics.averageInventoryDays < 15 ? '#cf1322' : 
                '#3f8600'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Critical alerts section */}
      {highPriorityAlerts.length > 0 && (
        <Alert
          message={t('inventory.forecast.criticalAlerts')}
          description={
            <div>
              <p>{t('inventory.forecast.criticalAlertsDescription')}</p>
              <ul>
                {highPriorityAlerts.slice(0, 3).map(alert => (
                  <li key={alert.productId}>
                    <strong>{alert.productName}</strong>: {t('inventory.forecast.stockoutIn')} <Text type="danger">{alert.daysUntilStockout} {t('common.days')}</Text>
                  </li>
                ))}
                {highPriorityAlerts.length > 3 && (
                  <li>
                    <Text type="secondary">
                      {t('inventory.forecast.andMore', { count: highPriorityAlerts.length - 3 })}
                    </Text>
                  </li>
                )}
              </ul>
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Usage trend chart for selected product */}
      {selectedProductId && (
        <Card 
          title={t('inventory.forecast.usageTrend')}
          style={{ marginBottom: 24 }}
          extra={
            <Button size="small" onClick={() => setSelectedProductId(undefined)}>
              {t('common.close')}
            </Button>
          }
        >
          {trendLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin />
            </div>
          ) : !usageTrend ? (
            <Empty 
              description={t('inventory.forecast.noTrendData')} 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <UsageTrendChart data={usageTrend} />
          )}
        </Card>
      )}

      <Divider orientation="left">{t('inventory.forecast.stockLevels')}</Divider>

      {/* Inventory forecasts table */}
      <Table 
        dataSource={forecasts}
        columns={forecastColumns}
        rowKey="productId"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />

      <Divider orientation="left">{t('inventory.forecast.lowStockAlerts')}</Divider>

      {/* Low stock alerts table */}
      <Table 
        dataSource={lowStockAlerts}
        columns={alertColumns}
        rowKey="productId"
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1000 }}
      />

      {/* Lead time settings modal */}
      <LeadTimeSettings 
        open={leadTimeSettingsOpen}
        onClose={() => setLeadTimeSettingsOpen(false)}
      />
    </div>
  );
};

export default ForecastDashboard;
