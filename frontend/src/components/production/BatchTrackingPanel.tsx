import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Progress, Button, Spin, Typography, Row, Col, Tabs, Modal, Form, Input, DatePicker, message } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { BatchStatus, ProductionRecord } from '../../types/production';
import ProductionService from '../../services/production.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface BatchTrackingPanelProps {
  productionOrderId: string;
  refreshData?: () => void;
}

const BatchTrackingPanel: React.FC<BatchTrackingPanelProps> = ({ productionOrderId, refreshData }) => {
  const [batchStatus, setBatchStatus] = useState<BatchStatus | null>(null);
  const [recordsByBatch, setRecordsByBatch] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [recordForm] = Form.useForm();

  useEffect(() => {
    fetchBatchData();
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
      message.error('Failed to load batch data');
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
        message.success('Production record created successfully');
        recordForm.resetFields();
        setModalVisible(false);
        fetchBatchData();
        if (refreshData) refreshData();
      })
      .catch((error) => {
        console.error('Error creating production record:', error);
        message.error('Failed to create production record');
      });
  };

  if (loading) {
    return <Spin tip="Loading batch data..." />;
  }

  if (!batchStatus) {
    return (
      <Card>
        <Text>No batch tracking data available for this production order.</Text>
      </Card>
    );
  }

  return (
    <div className="batch-tracking-panel">
      <Card title={<Title level={4}>Batch Tracking</Title>}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Total Batches" value={batchStatus.batchCount} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Completed Batches" value={batchStatus.completedBatches} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="In Progress" value={batchStatus.inProgressBatches} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Remaining" value={batchStatus.remainingBatches} />
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 20, marginBottom: 16 }}>
          <Text strong>Completion Progress</Text>
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
              Record Production for Next Batch: {batchStatus.nextBatchNumber}
            </Button>
          </div>
        )}

        <Tabs defaultActiveKey="1">
          <TabPane tab="Batches Overview" key="1">
            <Table 
              dataSource={batchStatus.batches} 
              rowKey="batchNumber"
              pagination={false}
              columns={[
                {
                  title: 'Batch Number',
                  dataIndex: 'batchNumber',
                  key: 'batchNumber',
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'completed' ? 'green' : 'blue'}>
                      {status.toUpperCase()}
                    </Tag>
                  ),
                },
                {
                  title: 'Quality Checked',
                  dataIndex: 'qualityChecked',
                  key: 'qualityChecked',
                  render: (checked) => (
                    checked ? 
                      <Tag icon={<CheckCircleOutlined />} color="green">CHECKED</Tag> : 
                      <Tag icon={<ClockCircleOutlined />} color="orange">PENDING</Tag>
                  ),
                },
              ]}
            />
          </TabPane>
          <TabPane tab="Detailed Records" key="2">
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
                        title: 'Date',
                        dataIndex: 'createdAt',
                        key: 'createdAt',
                        render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
                      },
                      {
                        title: 'Employee',
                        dataIndex: ['employee', 'firstName'],
                        key: 'employee',
                        render: (_, record: ProductionRecord) => 
                          `${record.employee.firstName} ${record.employee.lastName}`,
                      },
                      {
                        title: 'Quantity',
                        dataIndex: 'quantity',
                        key: 'quantity',
                      },
                      {
                        title: 'Wastage',
                        dataIndex: 'wastage',
                        key: 'wastage',
                      },
                      {
                        title: 'Quality Notes',
                        dataIndex: 'qualityNotes',
                        key: 'qualityNotes',
                      },
                    ]}
                  />
                ),
              }}
              columns={[
                {
                  title: 'Batch Number',
                  dataIndex: 'batchNumber',
                  key: 'batchNumber',
                },
                {
                  title: 'Total Quantity',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: 'Quality Checked',
                  dataIndex: 'qualityChecked',
                  key: 'qualityChecked',
                  render: (checked) => (
                    checked ? 
                      <Tag icon={<CheckCircleOutlined />} color="green">CHECKED</Tag> : 
                      <Tag icon={<ClockCircleOutlined />} color="orange">PENDING</Tag>
                  ),
                },
              ]}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={`Record Production for Batch ${batchStatus.nextBatchNumber}`}
        visible={modalVisible}
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
            label="Batch Number"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="employeeId"
            label="Employee"
            rules={[{ required: true, message: 'Please select an employee' }]}
          >
            <EmployeeSelect />
          </Form.Item>

          <Form.Item
            name="bomId"
            label="BOM"
            rules={[{ required: true, message: 'Please select a BOM' }]}
          >
            <BOMSelect />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item
            name="wastage"
            label="Wastage"
          >
            <Input type="number" min={0} />
          </Form.Item>

          <Form.Item
            name="batchExpiryDate"
            label="Expiry Date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="batchLocation"
            label="Storage Location"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="qualityChecked"
            valuePropName="checked"
            label="Quality Check"
          >
            <Checkbox>Quality check performed</Checkbox>
          </Form.Item>

          <Form.Item
            name="qualityNotes"
            label="Quality Notes"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Production Notes"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setModalVisible(false)}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Placeholder components - would need to be implemented
const Statistic = ({ title, value }: { title: string, value: number }) => (
  <div>
    <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)' }}>{title}</div>
    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</div>
  </div>
);

const Checkbox = ({ children, ...props }: any) => (
  <div>
    <input type="checkbox" {...props} /> {children}
  </div>
);

const EmployeeSelect = () => <Input placeholder="Employee ID - implement dropdown" />;
const BOMSelect = () => <Input placeholder="BOM ID - implement dropdown" />;

export default BatchTrackingPanel; 