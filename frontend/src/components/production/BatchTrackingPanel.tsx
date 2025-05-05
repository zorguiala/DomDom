import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Progress, Button, Spin, Typography, Row, Col, Tabs, Modal, Form, Input, DatePicker, message, Checkbox, Select } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { BatchStatus, ProductionRecord } from '../../types/production';
import ProductionService from '../../services/production.service';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface BatchTrackingPanelProps {
  productionOrderId: string;
  refreshData?: () => void;
}

const BatchTrackingPanel: React.FC<BatchTrackingPanelProps> = ({ productionOrderId, refreshData }) => {
  const { t } = useTranslation();
  const [batchStatus, setBatchStatus] = useState<BatchStatus | null>(null);
  const [recordsByBatch, setRecordsByBatch] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [recordForm] = Form.useForm();
  const [employees, setEmployees] = useState<any[]>([]);
  const [boms, setBoms] = useState<any[]>([]);

  useEffect(() => {
    fetchBatchData();
    // In a real implementation, you would fetch employees and BOMs here
    // For now, we'll use placeholder data
    setEmployees([
      { id: 'emp1', firstName: 'John', lastName: 'Doe' },
      { id: 'emp2', firstName: 'Jane', lastName: 'Smith' }
    ]);
    setBoms([
      { id: 'bom1', name: 'Product A' },
      { id: 'bom2', name: 'Product B' }
    ]);
  }, [productionOrderId]);

  const fetchBatchData = async () => {
    setLoading(true);
    try {
      const status = await ProductionService.getBatchStatus(productionOrderId);
      setBatchStatus(status);
      
      const records = await ProductionService.getRecordsByBatch(productionOrderId);
      setRecordsByBatch(records);
    } catch (error) {
      console.error('Error fetching batch data:', error);
      message.error(t('production.batchData.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRecordBatch = (values: any) => {
    const formData = {
      ...values,
      productionOrderId,
      batchExpiryDate: values.batchExpiryDate?.format('YYYY-MM-DD'),
    };

    ProductionService.createProductionRecord(formData)
      .then(() => {
        message.success(t('production.record.success'));
        recordForm.resetFields();
        setModalVisible(false);
        fetchBatchData();
        if (refreshData) refreshData();
      })
      .catch((error) => {
        console.error('Error creating production record:', error);
        message.error(t('production.record.error'));
      });
  };

  if (loading) {
    return <Spin tip={t('production.batchData.loading')} />;
  }

  if (!batchStatus) {
    return (
      <Card>
        <Text>{t('production.batchData.notAvailable')}</Text>
      </Card>
    );
  }

  return (
    <div className="batch-tracking-panel">
      <Card title={<Title level={4}>{t('production.batchTracking')}</Title>}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card size="small">
              <Statistic title={t('production.batch.totalBatches')} value={batchStatus.batchCount} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title={t('production.batch.completedBatches')} value={batchStatus.completedBatches} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title={t('production.batch.inProgress')} value={batchStatus.inProgressBatches} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title={t('production.batch.remaining')} value={batchStatus.remainingBatches} />
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 20, marginBottom: 16 }}>
          <Text strong>{t('production.batch.completionProgress')}</Text>
          <Progress 
            percent={Math.round((batchStatus.completedBatches / batchStatus.batchCount) * 100)} 
            status="active" 
          />
        </div>

        {batchStatus.nextBatchNumber && (
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              onClick={() => setModalVisible(true)}
            >
              {t('production.batch.recordNextBatch', { batchNumber: batchStatus.nextBatchNumber })}
            </Button>
          </div>
        )}

        <Tabs defaultActiveKey="1">
          <TabPane tab={t('production.batch.overview')} key="1">
            <Table 
              dataSource={batchStatus.batches} 
              rowKey="batchNumber"
              pagination={false}
              columns={[
                {
                  title: t('production.batch.number'),
                  dataIndex: 'batchNumber',
                  key: 'batchNumber',
                },
                {
                  title: t('production.quantity'),
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: t('production.status'),
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'completed' ? 'green' : 'blue'}>
                      {status.toUpperCase()}
                    </Tag>
                  ),
                },
                {
                  title: t('production.qualityChecked'),
                  dataIndex: 'qualityChecked',
                  key: 'qualityChecked',
                  render: (checked) => (
                    checked ? 
                      <Tag icon={<CheckCircleOutlined />} color="green">{t('production.quality.checked')}</Tag> : 
                      <Tag icon={<ClockCircleOutlined />} color="orange">{t('production.quality.pending')}</Tag>
                  ),
                },
              ]}
            />
          </TabPane>
          <TabPane tab={t('production.batch.detailedRecords')} key="2">
            <Table
              dataSource={recordsByBatch}
              rowKey="batchNumber"
              expandable={{
                expandedRowRender: (record) => (
                  <Table
                    dataSource={record.records}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      {
                        title: t('common.date'),
                        dataIndex: 'createdAt',
                        key: 'createdAt',
                        render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
                      },
                      {
                        title: t('production.employee'),
                        dataIndex: ['employee', 'firstName'],
                        key: 'employee',
                        render: (_, record: ProductionRecord) => 
                          `${record.employee.firstName} ${record.employee.lastName}`,
                      },
                      {
                        title: t('production.quantity'),
                        dataIndex: 'quantity',
                        key: 'quantity',
                      },
                      {
                        title: t('production.wastage'),
                        dataIndex: 'wastage',
                        key: 'wastage',
                      },
                      {
                        title: t('production.qualityNotes'),
                        dataIndex: 'qualityNotes',
                        key: 'qualityNotes',
                      },
                    ]}
                  />
                ),
              }}
              columns={[
                {
                  title: t('production.batch.number'),
                  dataIndex: 'batchNumber',
                  key: 'batchNumber',
                },
                {
                  title: t('production.totalQuantity'),
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: t('production.qualityChecked'),
                  dataIndex: 'qualityChecked',
                  key: 'qualityChecked',
                  render: (checked) => (
                    checked ? 
                      <Tag icon={<CheckCircleOutlined />} color="green">{t('production.quality.checked')}</Tag> : 
                      <Tag icon={<ClockCircleOutlined />} color="orange">{t('production.quality.pending')}</Tag>
                  ),
                },
              ]}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={t('production.batch.recordProduction', { batchNumber: batchStatus.nextBatchNumber })}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={recordForm}
          layout="vertical"
          onFinish={handleRecordBatch}
          initialValues={{
            batchNumber: batchStatus.nextBatchNumber,
          }}
        >
          <Form.Item
            name="batchNumber"
            label={t('production.batch.number')}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="employeeId"
            label={t('production.employee')}
            rules={[{ required: true, message: t('validation.required', { field: t('production.employee') }) }]}
          >
            <Select placeholder={t('production.selectEmployee')}>
              {employees.map(emp => (
                <Option key={emp.id} value={emp.id}>
                  {`${emp.firstName} ${emp.lastName}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="bomId"
            label={t('production.bom')}
            rules={[{ required: true, message: t('validation.required', { field: t('production.bom') }) }]}
          >
            <Select placeholder={t('production.selectBom')}>
              {boms.map(bom => (
                <Option key={bom.id} value={bom.id}>
                  {bom.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label={t('production.quantity')}
            rules={[{ required: true, message: t('validation.required', { field: t('production.quantity') }) }]}
          >
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item
            name="wastage"
            label={t('production.wastage')}
          >
            <Input type="number" min={0} />
          </Form.Item>

          <Form.Item
            name="batchExpiryDate"
            label={t('production.batch.expiryDate')}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="batchLocation"
            label={t('production.batch.storageLocation')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="qualityChecked"
            valuePropName="checked"
            label={t('production.qualityCheck')}
          >
            <Checkbox>{t('production.quality.performCheck')}</Checkbox>
          </Form.Item>

          <Form.Item
            name="qualityNotes"
            label={t('production.qualityNotes')}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="notes"
            label={t('production.notes')}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('common.submit')}
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setModalVisible(false)}>
              {t('common.cancel')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Statistic component implementation
const Statistic = ({ title, value }: { title: string, value: number }) => (
  <div>
    <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)' }}>{title}</div>
    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</div>
  </div>
);

export default BatchTrackingPanel; 