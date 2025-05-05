import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Button, Select, Spin, Tabs, Row, Col, Radio, Form, message, Divider, Typography } from 'antd';
import { DownloadOutlined, BarChartOutlined, LineChartOutlined, PieChartOutlined } from '@ant-design/icons';
import { Line, Bar, Pie } from '@ant-design/charts';
import ProductionService from '../../services/production.service';
import { ProductionStatisticsDto, ExportReportDto } from '../../types/production';
import dayjs from 'dayjs';

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
          category: 'Production',
        });
      });
      
      if (data.timeSeries.wastage) {
        data.timeSeries.wastage.forEach((point: any) => {
          timeSeriesData.push({
            date: point.date,
            value: point.value,
            category: 'Wastage',
          });
        });
      }
      
      if (data.timeSeries.efficiency) {
        data.timeSeries.efficiency.forEach((point: any) => {
          timeSeriesData.push({
            date: point.date,
            value: point.value,
            category: 'Efficiency (%)',
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
      message.error('Failed to load production statistics');
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
        title: `Production Report ${filters.startDate} to ${filters.endDate}`,
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
      
      message.success(`Report exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting report:', error);
      message.error('Failed to export report');
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
    data: productionData.filter(item => item.category === 'Production'),
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
        alias: 'Production Quantity',
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
      <Card title={<Title level={4}>Production Statistics & Reports</Title>}>
        <Form
          layout="inline"
          style={{ marginBottom: 16 }}
          initialValues={filters}
          onValuesChange={handleFilterChange}
        >
          <Form.Item label="Date Range" name="dateRange">
            <RangePicker
              value={[dayjs(filters.startDate), dayjs(filters.endDate)]}
              onChange={handleDateRangeChange}
            />
          </Form.Item>
          
          <Form.Item name="groupBy" label="Group By">
            <Select style={{ width: 120 }}>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="bomId" label="Product">
            <Select
              style={{ width: 150 }}
              placeholder="All Products"
              allowClear
            >
              {/* This would be populated from a fetch call */}
              <Option value="product-1">Bread</Option>
              <Option value="product-2">Cake</Option>
              <Option value="product-3">Pastry</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="employeeId" label="Employee">
            <Select
              style={{ width: 150 }}
              placeholder="All Employees"
              allowClear
            >
              {/* This would be populated from a fetch call */}
              <Option value="emp-1">John Doe</Option>
              <Option value="emp-2">Jane Smith</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="includeWastage" valuePropName="checked">
            <Radio.Group>
              <Radio.Button value={true}>Include Wastage</Radio.Button>
              <Radio.Button value={false}>Production Only</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" onClick={fetchStatistics} loading={loading}>
              Update
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
                    title="Efficiency"
                    value={statistics.metrics.efficiency}
                    suffix="%"
                    precision={1}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Completed Orders"
                    value={statistics.metrics.totalCompleted}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Avg. Completion Time"
                    value={statistics.metrics.averageCompletionTime}
                    suffix="hrs"
                    precision={1}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Wastage"
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
                Export PDF
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => exportReport('excel')}
                loading={exporting}
                style={{ marginRight: 8 }}
              >
                Export Excel
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => exportReport('csv')}
                loading={exporting}
              >
                Export CSV
              </Button>
            </div>
            
            <Tabs defaultActiveKey="1">
              <TabPane 
                tab={<span><LineChartOutlined /> Time Series</span>}
                key="1"
              >
                <Title level={5}>Production Over Time</Title>
                <div style={{ height: 400 }}>
                  <Line {...lineConfig} />
                </div>
              </TabPane>
              
              <TabPane 
                tab={<span><BarChartOutlined /> Production Volume</span>}
                key="2"
              >
                <Title level={5}>Daily Production Volume</Title>
                <div style={{ height: 400 }}>
                  <Bar {...barConfig} />
                </div>
              </TabPane>
              
              <TabPane 
                tab={<span><PieChartOutlined /> Distribution</span>}
                key="3"
              >
                <Title level={5}>Production by Product</Title>
                <div style={{ height: 400 }}>
                  <Pie {...pieConfig} />
                </div>
              </TabPane>
            </Tabs>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Text>No data available. Select a date range and click Update.</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

// Placeholder component for Statistic
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