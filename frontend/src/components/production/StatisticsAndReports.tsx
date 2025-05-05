import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Button, Select, Spin, Tabs, Row, Col, Radio, Form, message, Divider, Typography } from 'antd';
import { DownloadOutlined, BarChartOutlined, LineChartOutlined, PieChartOutlined } from '@ant-design/icons';
import ProductionService from '../../services/production.service';
import { ProductionStatisticsDto, ExportReportDto } from '../../types/production';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

// Define chart props interface
interface ChartProps {
  data: any[];
  [key: string]: any;
}

// Check if charts are available, if not use placeholders
let Line: React.FC<ChartProps>, Bar: React.FC<ChartProps>, Pie: React.FC<ChartProps>;
try {
  const charts = require('@ant-design/charts');
  Line = charts.Line;
  Bar = charts.Bar;
  Pie = charts.Pie;
} catch (error) {
  // Create placeholder components if the charts package is not available
  Line = ({ data }: ChartProps) => (
    <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed #ccc' }}>
      <p>Line Chart Placeholder</p>
      <p>Install @ant-design/charts to see actual charts</p>
    </div>
  );
  Bar = Line;
  Pie = Line;
}

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface ChartData {
  date: string;
  value: number;
  category: string;
}

interface PieChartData {
  type: string;
  value: number;
}

const StatisticsAndReports: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [productionData, setProductionData] = useState<ChartData[]>([]);
  const [distributionData, setDistributionData] = useState<PieChartData[]>([]);
  const [filters, setFilters] = useState<ProductionStatisticsDto>({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    includeWastage: true,
    groupBy: 'daily',
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const data = await ProductionService.getProductionStatistics(filters);
      setStatistics(data);
      
      // Transform time series data for charts
      const timeSeriesData: ChartData[] = [];
      
      data.timeSeries.production.forEach((point: any) => {
        timeSeriesData.push({
          date: point.date,
          value: point.value,
          category: t('production.stats.production'),
        });
      });
      
      if (data.timeSeries.wastage) {
        data.timeSeries.wastage.forEach((point: any) => {
          timeSeriesData.push({
            date: point.date,
            value: point.value,
            category: t('production.stats.wastage'),
          });
        });
      }
      
      if (data.timeSeries.efficiency) {
        data.timeSeries.efficiency.forEach((point: any) => {
          timeSeriesData.push({
            date: point.date,
            value: point.value,
            category: t('production.stats.efficiency'),
          });
        });
      }
      
      setProductionData(timeSeriesData);
      
      // Transform distribution data for pie charts
      const productDistribution: PieChartData[] = data.byProduct.map((item: any) => ({
        type: item.label,
        value: item.value,
      }));
      
      setDistributionData(productDistribution);
      
    } catch (error) {
      console.error('Error fetching statistics:', error);
      message.error(t('production.stats.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (values: any) => {
    setFilters({
      ...filters,
      ...values,
    });
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters({
        ...filters,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      });
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    setExporting(true);
    try {
      const exportDto: ExportReportDto = {
        ...filters,
        format,
        title: t('production.stats.reportTitle', { 
          startDate: filters.startDate,
          endDate: filters.endDate
        }),
      };
      
      const blob = await ProductionService.exportProductionReport(exportDto);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `production-report-${dayjs().format('YYYY-MM-DD')}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success(t('production.stats.exportSuccess', { format: format.toUpperCase() }));
    } catch (error) {
      console.error('Error exporting report:', error);
      message.error(t('production.stats.exportError'));
    } finally {
      setExporting(false);
    }
  };

  const lineConfig = {
    data: productionData,
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    point: {
      size: 5,
      shape: 'diamond',
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: datum.category, value: datum.value };
      },
    },
  };

  const barConfig = {
    data: productionData.filter(item => item.category === t('production.stats.production')),
    xField: 'date',
    yField: 'value',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      value: {
        alias: t('production.stats.productionQuantity'),
      },
    },
  };

  const pieConfig = {
    data: distributionData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  return (
    <div className="statistics-and-reports">
      <Card title={<Title level={4}>{t('production.stats.title')}</Title>}>
        <Form
          layout="inline"
          style={{ marginBottom: 16 }}
          initialValues={filters}
          onValuesChange={handleFilterChange}
        >
          <Form.Item label={t('production.stats.dateRange')} name="dateRange">
            <RangePicker
              value={[dayjs(filters.startDate), dayjs(filters.endDate)]}
              onChange={handleDateRangeChange}
            />
          </Form.Item>
          
          <Form.Item name="groupBy" label={t('production.stats.groupBy')}>
            <Select style={{ width: 120 }}>
              <Option value="daily">{t('production.stats.daily')}</Option>
              <Option value="weekly">{t('production.stats.weekly')}</Option>
              <Option value="monthly">{t('production.stats.monthly')}</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="bomId" label={t('production.stats.product')}>
            <Select
              style={{ width: 150 }}
              placeholder={t('production.stats.allProducts')}
              allowClear
            >
              {/* This would be populated from a fetch call */}
              <Option value="product-1">{t('production.stats.productBread')}</Option>
              <Option value="product-2">{t('production.stats.productCake')}</Option>
              <Option value="product-3">{t('production.stats.productPastry')}</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="employeeId" label={t('production.stats.employee')}>
            <Select
              style={{ width: 150 }}
              placeholder={t('production.stats.allEmployees')}
              allowClear
            >
              {/* This would be populated from a fetch call */}
              <Option value="emp-1">John Doe</Option>
              <Option value="emp-2">Jane Smith</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="includeWastage" valuePropName="checked">
            <Radio.Group>
              <Radio.Button value={true}>{t('production.stats.includeWastage')}</Radio.Button>
              <Radio.Button value={false}>{t('production.stats.productionOnly')}</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" onClick={fetchStatistics} loading={loading}>
              {t('production.stats.update')}
            </Button>
          </Form.Item>
        </Form>
        
        <Divider />
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin size="large" />
          </div>
        ) : statistics ? (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title={t('production.stats.efficiency')}
                    value={statistics.metrics.efficiency}
                    suffix="%"
                    precision={1}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title={t('production.stats.completedOrders')}
                    value={statistics.metrics.totalCompleted}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title={t('production.stats.avgCompletionTime')}
                    value={statistics.metrics.averageCompletionTime}
                    suffix="hrs"
                    precision={1}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title={t('production.stats.wastage')}
                    value={statistics.metrics.wastagePercentage || 0}
                    suffix="%"
                    precision={1}
                    valueStyle={{ color: (statistics.metrics.wastagePercentage || 0) > 5 ? '#cf1322' : '#3f8600' }}
                  />
                </Card>
              </Col>
            </Row>
            
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => exportReport('pdf')}
                loading={exporting}
                style={{ marginRight: 8 }}
              >
                {t('production.stats.exportPdf')}
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => exportReport('excel')}
                loading={exporting}
                style={{ marginRight: 8 }}
              >
                {t('production.stats.exportExcel')}
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => exportReport('csv')}
                loading={exporting}
              >
                {t('production.stats.exportCsv')}
              </Button>
            </div>
            
            <Tabs defaultActiveKey="1">
              <TabPane 
                tab={<span><LineChartOutlined /> {t('production.stats.timeSeries')}</span>}
                key="1"
              >
                <Title level={5}>{t('production.stats.productionOverTime')}</Title>
                <div style={{ height: 400 }}>
                  <Line {...lineConfig} />
                </div>
              </TabPane>
              
              <TabPane 
                tab={<span><BarChartOutlined /> {t('production.stats.productionVolume')}</span>}
                key="2"
              >
                <Title level={5}>{t('production.stats.dailyProductionVolume')}</Title>
                <div style={{ height: 400 }}>
                  <Bar {...barConfig} />
                </div>
              </TabPane>
              
              <TabPane 
                tab={<span><PieChartOutlined /> {t('production.stats.distribution')}</span>}
                key="3"
              >
                <Title level={5}>{t('production.stats.productionByProduct')}</Title>
                <div style={{ height: 400 }}>
                  <Pie {...pieConfig} />
                </div>
              </TabPane>
            </Tabs>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Text>{t('production.stats.noData')}</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

// Statistic component implementation
const Statistic = ({ title, value, suffix, precision, valueStyle }: any) => (
  <div>
    <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)' }}>{title}</div>
    <div style={{ fontSize: '24px', fontWeight: 'bold', ...valueStyle }}>
      {precision ? Number(value).toFixed(precision) : value}
      {suffix && <span style={{ fontSize: '16px', marginLeft: 4 }}>{suffix}</span>}
    </div>
  </div>
);

export default StatisticsAndReports; 