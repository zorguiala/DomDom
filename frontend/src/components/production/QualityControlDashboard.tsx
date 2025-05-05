import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, DatePicker, Button, Row, Col, Statistic, Progress, Spin, Typography, Empty } from 'antd';
import { CheckCircleOutlined, WarningOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import ProductionService from '../../services/production.service';
import { QualityControlStats, ProductionRecord, ProductionRecordsFilterDto } from '../../types/production';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

const QualityControlDashboard: React.FC = () => {
  const [stats, setStats] = useState<QualityControlStats | null>(null);
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<ProductionRecordsFilterDto>({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    qualityChecked: undefined,
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const qualityStats = await ProductionService.getQualityControlStats(filters);
      setStats(qualityStats);
      
      const productionRecords = await ProductionService.getProductionRecords(filters);
      setRecords(productionRecords);
    } catch (error) {
      console.error('Error fetching quality control data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters({
        ...filters,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      });
    }
  };

  const handleQualityStatusChange = (value: boolean | undefined) => {
    setFilters({
      ...filters,
      qualityChecked: value,
    });
  };

  const handleRecordQualityCheck = async (record: ProductionRecord, qualityPassed: boolean) => {
    try {
      await ProductionService.updateProductionRecord(record.id, {
        qualityChecked: true,
        qualityNotes: qualityPassed 
          ? 'Quality check passed' 
          : 'Quality check failed - issues found',
      });
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error updating quality check:', error);
    }
  };

  const qualityStatusFilter = (
    <Select
      style={{ width: 200, marginRight: 16 }}
      placeholder="Filter by quality status"
      allowClear
      onChange={handleQualityStatusChange}
      value={filters.qualityChecked}
    >
      <Option value={true}>Quality Checked</Option>
      <Option value={false}>Not Checked</Option>
    </Select>
  );

  const dateRangeFilter = (
    <RangePicker
      value={[
        filters.startDate ? dayjs(filters.startDate) : null,
        filters.endDate ? dayjs(filters.endDate) : null,
      ]}
      onChange={handleDateChange}
      style={{ marginRight: 16 }}
    />
  );

  if (loading && !stats) {
    return <Spin tip="Loading quality control data..." />;
  }

  return (
    <div className="quality-control-dashboard">
      <Card title={<Title level={4}>Quality Control Dashboard</Title>}>
        <div style={{ marginBottom: 16 }}>
          <Text>Filter records: </Text>
          {dateRangeFilter}
          {qualityStatusFilter}
          <Button type="primary" onClick={fetchData}>
            Refresh
          </Button>
        </div>

        {stats ? (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card size="small">
                  <Statistic 
                    title="Total Records" 
                    value={stats.totalRecords} 
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic 
                    title="Quality Checked" 
                    value={stats.qualityCheckedRecords} 
                    suffix={<small>({stats.qualityCheckRate.toFixed(1)}%)</small>}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic 
                    title="Issues Found" 
                    value={stats.issuesFound} 
                    suffix={<small>({stats.issueRate.toFixed(1)}%)</small>}
                    valueStyle={{ color: stats.issuesFound > 0 ? '#cf1322' : '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic 
                    title="Passing Rate" 
                    value={100 - stats.issueRate} 
                    suffix="%" 
                    valueStyle={{ color: stats.issueRate > 10 ? '#cf1322' : '#3f8600' }}
                  />
                </Card>
              </Col>
            </Row>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Quality Check Progress</Text>
              <Progress 
                percent={stats.qualityCheckRate} 
                status={stats.qualityCheckRate < 70 ? "exception" : "active"} 
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Quality Pass Rate</Text>
              <Progress 
                percent={100 - stats.issueRate} 
                status={stats.issueRate > 10 ? "exception" : "success"} 
              />
            </div>
          </>
        ) : !loading && (
          <Empty description="No quality control statistics available" />
        )}

        <Table
          dataSource={records}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: 'Date',
              dataIndex: 'createdAt',
              key: 'createdAt',
              render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
              sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
            },
            {
              title: 'BOM',
              dataIndex: ['bom', 'name'],
              key: 'bom',
            },
            {
              title: 'Batch Number',
              dataIndex: 'batchNumber',
              key: 'batchNumber',
              render: (batchNumber) => batchNumber || '-',
            },
            {
              title: 'Quantity',
              dataIndex: 'quantity',
              key: 'quantity',
              sorter: (a, b) => a.quantity - b.quantity,
            },
            {
              title: 'Wastage',
              dataIndex: 'wastage',
              key: 'wastage',
              render: (wastage, record) => (
                <span>
                  {wastage} 
                  {record.quantity > 0 && 
                    <small style={{ marginLeft: 5 }}>
                      ({((wastage / record.quantity) * 100).toFixed(1)}%)
                    </small>
                  }
                </span>
              ),
            },
            {
              title: 'Quality Status',
              dataIndex: 'qualityChecked',
              key: 'qualityStatus',
              render: (checked, record) => {
                if (!checked) {
                  return (
                    <div>
                      <Tag icon={<ClockCircleOutlined />} color="orange">PENDING</Tag>
                      <div style={{ marginTop: 5 }}>
                        <Button 
                          type="primary" 
                          size="small" 
                          onClick={() => handleRecordQualityCheck(record, true)}
                          style={{ marginRight: 5 }}
                        >
                          Pass
                        </Button>
                        <Button 
                          danger 
                          size="small" 
                          onClick={() => handleRecordQualityCheck(record, false)}
                        >
                          Fail
                        </Button>
                      </div>
                    </div>
                  );
                }
                
                const hasIssues = record.qualityNotes?.toLowerCase().includes('issue') || 
                                 record.qualityNotes?.toLowerCase().includes('fail');
                                 
                return hasIssues ? (
                  <Tag icon={<CloseCircleOutlined />} color="red">FAILED</Tag>
                ) : (
                  <Tag icon={<CheckCircleOutlined />} color="green">PASSED</Tag>
                );
              },
              filters: [
                { text: 'Pending', value: false },
                { text: 'Checked', value: true },
              ],
              onFilter: (value, record) => record.qualityChecked === value,
            },
            {
              title: 'Quality Notes',
              dataIndex: 'qualityNotes',
              key: 'qualityNotes',
              render: (notes) => notes || '-',
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default QualityControlDashboard; 