import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Button, 
  Modal,
  message,
  Table,
  InputNumber,
  Checkbox,
  Typography,
  Space,
  Select,
  Input,
  Spin,
  Empty,
  Divider,
  Alert
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryCountApi } from '../../../services/inventory-count-service';
import type { InventoryReconciliation } from '../../../types/inventory-count';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface ReconciliationFormProps {
  open: boolean;
  onClose: () => void;
  countId: string;
}

// Predefined reasons for adjustments
const ADJUSTMENT_REASONS = [
  'count_error',
  'damaged_goods',
  'theft',
  'admin_error',
  'supplier_error',
  'other'
];

const ReconciliationForm: React.FC<ReconciliationFormProps> = ({ 
  open, 
  onClose, 
  countId 
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [adjustmentData, setAdjustmentData] = useState<any[]>([]);

  // Query variance report
  const { 
    data: varianceReport,
    isLoading: varianceLoading,
    error
  } = useQuery({
    queryKey: ['inventory-count-variance', countId],
    queryFn: () => inventoryCountApi.getVarianceReport(countId),
    enabled: !!countId && open
  });

  // Query inventory count details
  const { 
    data: countDetails, 
    isLoading: countLoading 
  } = useQuery({
    queryKey: ['inventory-count', countId],
    queryFn: () => inventoryCountApi.getInventoryCount(countId),
    enabled: !!countId && open
  });

  // Initialize adjustment data when variance report is loaded
  useEffect(() => {
    if (varianceReport && varianceReport.items) {
      const initialData = varianceReport.items
        .filter(item => item.variance !== 0)
        .map(item => ({
          productId: item.productId,
          productName: item.productName,
          variance: item.variance,
          variancePercentage: item.variancePercentage,
          varianceValue: item.varianceValue,
          approved: Math.abs(item.variancePercentage) <= 3, // Auto-approve small variances
          adjustmentQuantity: item.variance,
          reason: Math.abs(item.variancePercentage) <= 3 ? 'count_error' : undefined
        }));
      
      setAdjustmentData(initialData);
    }
  }, [varianceReport]);

  // Reconcile mutation
  const reconcileMutation = useMutation({
    mutationFn: (data: InventoryReconciliation) => 
      inventoryCountApi.reconcileCount(countId, data),
    onSuccess: () => {
      message.success(t('inventory.count.reconcileSuccess'));
      queryClient.invalidateQueries({ queryKey: ['inventory-counts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-count', countId] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.message || t('common.errorOccurred'));
    }
  });

  // Handle approved checkbox change
  const handleApprovedChange = (e: any, productId: string) => {
    const approved = e.target.checked;
    setAdjustmentData(prevData => 
      prevData.map(item => 
        item.productId === productId 
          ? { 
              ...item, 
              approved,
              // Reset reason if not approved
              reason: approved ? item.reason : undefined
            } 
          : item
      )
    );
  };

  // Handle adjustment quantity change
  const handleQuantityChange = (value: number | null, productId: string) => {
    setAdjustmentData(prevData => 
      prevData.map(item => 
        item.productId === productId 
          ? { ...item, adjustmentQuantity: value || 0 } 
          : item
      )
    );
  };

  // Handle reason change
  const handleReasonChange = (value: string, productId: string) => {
    setAdjustmentData(prevData => 
      prevData.map(item => 
        item.productId === productId 
          ? { ...item, reason: value } 
          : item
      )
    );
  };

  // Handle reconciliation
  const handleReconcile = () => {
    // Validate that all approved adjustments have a reason
    const isValid = adjustmentData.every(item => !item.approved || item.reason);
    
    if (!isValid) {
      message.error(t('inventory.count.reasonRequired'));
      return;
    }
    
    const reconciliation: InventoryReconciliation = {
      countId,
      adjustments: adjustmentData.map(item => ({
        productId: item.productId,
        productName: item.productName,
        variance: item.variance,
        approved: item.approved,
        adjustmentQuantity: item.approved ? item.adjustmentQuantity : undefined,
        reason: item.approved ? item.reason : undefined
      }))
    };
    
    Modal.confirm({
      title: t('inventory.count.confirmReconciliation'),
      content: t('inventory.count.reconciliationWarning'),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk: () => reconcileMutation.mutate(reconciliation)
    });
  };

  // Columns for the adjustments table
  const columns = [
    {
      title: t('inventory.product'),
      dataIndex: 'productName',
      key: 'productName',
      width: '20%'
    },
    {
      title: t('inventory.count.variance'),
      key: 'variance',
      width: '10%',
      render: (_: any, record: any) => (
        <Text 
          type={record.variance === 0 ? undefined : (record.variance > 0 ? 'success' : 'danger')}
          strong
        >
          {record.variance > 0 ? '+' : ''}{record.variance}
          <br/>
          <small>({record.variancePercentage.toFixed(2)}%)</small>
        </Text>
      )
    },
    {
      title: t('inventory.count.varianceValue'),
      key: 'varianceValue',
      width: '10%',
      render: (_: any, record: any) => (
        <Text 
          type={record.varianceValue === 0 ? undefined : (record.varianceValue > 0 ? 'success' : 'danger')}
        >
          ${Math.abs(record.varianceValue).toFixed(2)}
        </Text>
      )
    },
    {
      title: t('inventory.count.approve'),
      key: 'approved',
      width: '10%',
      render: (_: any, record: any) => (
        <Checkbox 
          checked={record.approved} 
          onChange={(e) => handleApprovedChange(e, record.productId)}
        />
      )
    },
    {
      title: t('inventory.count.adjustmentQuantity'),
      key: 'adjustmentQuantity',
      width: '15%',
      render: (_: any, record: any) => (
        <InputNumber
          disabled={!record.approved}
          value={record.adjustmentQuantity}
          onChange={(value) => handleQuantityChange(value, record.productId)}
          min={-999999}
          max={999999}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: t('inventory.count.reason'),
      key: 'reason',
      width: '20%',
      render: (_: any, record: any) => (
        <Select
          disabled={!record.approved}
          value={record.reason}
          onChange={(value) => handleReasonChange(value, record.productId)}
          style={{ width: '100%' }}
          placeholder={t('inventory.count.selectReason')}
        >
          {ADJUSTMENT_REASONS.map(reason => (
            <Option key={reason} value={reason}>
              {t(`inventory.count.reasons.${reason}`)}
            </Option>
          ))}
        </Select>
      )
    }
  ];

  if (varianceLoading || countLoading) {
    return (
      <Modal
        title={t('inventory.count.reconcileInventory')}
        open={open}
        onCancel={onClose}
        footer={null}
        width={900}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      </Modal>
    );
  }

  if (error || !varianceReport || !countDetails) {
    return (
      <Modal
        title={t('inventory.count.reconcileInventory')}
        open={open}
        onCancel={onClose}
        footer={null}
        width={900}
      >
        <Empty 
          description={t('common.errorLoading')} 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      </Modal>
    );
  }

  const hasVariances = adjustmentData.length > 0;

  return (
    <Modal
      title={
        <Space>
          <span>{t('inventory.count.reconcileInventory')}</span>
          <Text type="secondary">({countDetails.reference})</Text>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={reconcileMutation.isPending}
          onClick={handleReconcile}
          disabled={!hasVariances || adjustmentData.every(item => !item.approved)}
        >
          {t('inventory.count.confirmReconciliation')}
        </Button>
      ]}
      width={900}
    >
      <Alert
        message={t('inventory.count.reconciliationInstructions')}
        description={t('inventory.count.reconciliationDescription')}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {!hasVariances ? (
        <Empty description={t('inventory.count.noVariancesFound')} />
      ) : (
        <>
          <Divider>{t('inventory.count.itemsRequiringReconciliation')}</Divider>
          
          <Table
            dataSource={adjustmentData}
            columns={columns}
            rowKey="productId"
            pagination={false}
            scroll={{ y: 400 }}
          />
          
          <Divider />
          
          <div style={{ textAlign: 'right' }}>
            <Text type="secondary">
              {t('inventory.count.approvedAdjustments')}: {adjustmentData.filter(item => item.approved).length} / {adjustmentData.length}
            </Text>
          </div>
        </>
      )}
    </Modal>
  );
};

export default ReconciliationForm;
