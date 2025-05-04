import React from 'react';
import { Card, Typography, Space, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { UsageTrend } from '../../../types/inventory-forecast';
import { Line } from '@ant-design/plots';

const { Title, Text } = Typography;

interface UsageTrendChartProps {
  data: UsageTrend;
}

const UsageTrendChart: React.FC<UsageTrendChartProps> = ({ data }) => {
  const { t } = useTranslation();

  // Get trend icon based on trend direction
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

  // Get trend color
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'INCREASING':
        return 'error';
      case 'DECREASING':
        return 'success';
      case 'STABLE':
        return 'processing';
      default:
        return 'default';
    }
  };

  // Format chart data
  const chartData = data.historicalData.map(item => ({
    date: item.date,
    value: item.quantity
  }));

  // Chart configuration
  const config = {
    data: chartData,
    xField: 'date',
    yField: 'value',
    smooth: true,
    xAxis: {
      title: {
        text: t('inventory.forecast.date'),
      },
    },
    yAxis: {
      title: {
        text: t('inventory.quantity'),
      },
    },
    meta: {
      value: {
        alias: t('inventory.usageQuantity'),
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: t('inventory.usageQuantity'), value: datum.value };
      },
    },
    point: {
      size: 3,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2,
      },
    },
    annotations: [
      {
        type: 'line',
        start: ['min', data.averageDailyUsage],
        end: ['max', data.averageDailyUsage],
        style: {
          stroke: '#F4664A',
          lineDash: [4, 4],
          lineWidth: 2,
        },
        text: {
          content: `${t('inventory.forecast.avgDailyUsage')}: ${data.averageDailyUsage.toFixed(2)}`,
          position: 'end',
          style: {
            textAlign: 'start',
            fontSize: 12,
            fill: '#F4664A',
          },
        },
      },
    ],
  };

  return (
    <div className="usage-trend-chart">
      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={0}>
          <Space>
            <Title level={5} style={{ margin: 0 }}>
              {t('inventory.forecast.productUsageTrend')}
            </Title>
            <Tag color={getTrendColor(data.trend)}>
              {getTrendIcon(data.trend)} {t(`inventory.forecast.trend.${data.trend.toLowerCase()}`)}
            </Tag>
          </Space>
          <Text type="secondary">
            {t('inventory.forecast.averageDailyUsage')}: {data.averageDailyUsage.toFixed(2)} {t('inventory.perDay')}
          </Text>
          <Text type="secondary">
            {t('inventory.forecast.trendDescription', { trend: t(`inventory.forecast.trend.${data.trend.toLowerCase()}`) })}
          </Text>
        </Space>
      </div>
      
      <div style={{ height: 300 }}>
        <Line {...config} />
      </div>
    </div>
  );
};

export default UsageTrendChart;
