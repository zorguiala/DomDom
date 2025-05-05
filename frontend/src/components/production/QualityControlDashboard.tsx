import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, DatePicker, Button, Row, Col, Statistic, Progress, Spin, Typography, Empty } from 'antd';
import { CheckCircleOutlined, WarningOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import ProductionService from '../../services/production.service';
import { QualityControlStats, ProductionRecord, ProductionRecordsFilterDto } from '../../types/production';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

const QualityControlDashboard: React.FC = () => {
  const { t } = useTranslation();
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
          ? t('production.quality.passedNotes') 
          : t('production.quality.failedNotes'),
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
      placeholder={t('production.quality.filterByStatus')}
      allowClear
      onChange={handleQualityStatusChange}
      value={filters.qualityChecked}
    >
      <Option value={true}>{t('production.quality.checked')}</Option>
      <Option value={false}>{t('production.quality.notChecked')}</Option>
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
    return <Spin tip={t('production.quality.loading')} />;
  }

  return (
    <div className="quality-control-dashboard">
      <Card title={<Title level={4}>{t('production.quality.dashboard')}</Title>}>
        <div style={{ marginBottom: 16 }}>
          <Text>{t('production.filterRecords')}: </Text>
          {dateRangeFilter}
          {qualityStatusFilter}
          <Button type="primary" onClick={fetchData}>
            {t('common.refresh')}
          </Button>
        </div>

        {stats ? (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card size="small">
                  <Statistic 
                    title={t('production.quality.totalRecords')} 
                    value={stats.totalRecords} 
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic 
                    title={t('production.quality.checkedRecords')} 
                    value={stats.qualityCheckedRecords} 
                    suffix={<small>({stats.qualityCheckRate.toFixed(1)}%)</small>}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic 
                    title={t('production.quality.issuesFound')} 
                    value={stats.issuesFound} 
                    suffix={<small>({stats.issueRate.toFixed(1)}%)</small>}
                    valueStyle={{ color: stats.issuesFound > 0 ? '#cf1322' : '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic 
                    title={t('production.quality.passingRate')} 
                    value={100 - stats.issueRate} 
                    suffix="%" 
                    valueStyle={{ color: stats.issueRate > 10 ? '#cf1322' : '#3f8600' }}
                  />
                </Card>
              </Col>
            </Row>

            <div style={{ marginBottom: 16 }}>
              <Text strong>{t('production.quality.checkProgress')}</Text>
              <Progress 
                percent={stats.qualityCheckRate} 
                status={stats.qualityCheckRate < 70 ? "exception" : "active"} 
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>{t('production.quality.passRate')}</Text>
              <Progress 
                percent={100 - stats.issueRate} 
                status={stats.issueRate > 10 ? "exception" : "success"} 
              />
            </div>
          </>
        ) : !loading && (
          <Empty description={t('production.quality.noStats')} />
        )}

        <Table
          dataSource={records}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: t('common.date'),
              dataIndex: 'createdAt',
              key: 'createdAt',
              render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
              sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
            },
            {
              title: t('production.bom'),
              dataIndex: ['bom', 'name'],
              key: 'bom',
            },
            {
              title: t('production.batch.number'),
              dataIndex: 'batchNumber',
              key: 'batchNumber',
              render: (batchNumber) => batchNumber || '-',
            },
            {
              title: t('production.quantity'),
              dataIndex: 'quantity',
              key: 'quantity',
              sorter: (a, b) => a.quantity - b.quantity,
            },
            {
              title: t('production.wastage'),
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
              title: t('production.quality.status'),
              dataIndex: 'qualityChecked',
              key: 'qualityStatus',
              render: (checked, record) => {
                if (!checked) {
                  return (
                    <div>
                      <Tag icon={<ClockCircleOutlined />} color="orange">{t('production.quality.pending')}</Tag>
                      <div style={{ marginTop: 5 }}>
                        <Button 
                          type="primary" 
                          size="small" 
                          onClick={() => handleRecordQualityCheck(record, true)}
                          style={{ marginRight: 5 }}
                        >
                          {t('production.quality.pass')}
                        </Button>
                        <Button 
                          danger 
                          size="small" 
                          onClick={() => handleRecordQualityCheck(record, false)}
                        >
                          {t('production.quality.fail')}
                        </Button>
                      </div>
                    </div>
                  );
                }
                
                const hasIssues = record.qualityNotes?.toLowerCase().includes('issue') || 
                                 record.qualityNotes?.toLowerCase().includes('fail');
                                 
                return hasIssues ? (
                  <Tag icon={<CloseCircleOutlined />} color="red">{t('production.quality.failed')}</Tag>
                ) : (
                  <Tag icon={<CheckCircleOutlined />} color="green">{t('production.quality.passed')}</Tag>
                );
              },
              filters: [
                { text: t('production.quality.pending'), value: false },
                { text: t('production.quality.checked'), value: true },
              ],
              onFilter: (value, record) => record.qualityChecked === value,
            },
            {
              title: t('production.qualityNotes'),
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