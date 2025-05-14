import { useState, useCallback } from "react";
import { Form, message } from "antd";
import { useTranslation } from "react-i18next";
import { StockCount } from "../types/stock";

interface UseStockCountFormsResult {
  form: any;
  recordForm: any;
  createModalVisible: boolean;
  countDetailsVisible: boolean;
  recordModalVisible: boolean;
  selectedCount: StockCount | null;
  setCreateModalVisible: (visible: boolean) => void;
  setCountDetailsVisible: (visible: boolean) => void;
  setRecordModalVisible: (visible: boolean) => void;
  handleViewCount: (count: StockCount) => void;
  handleRecordQuantities: (count: StockCount) => void;
  handleCreateCount: (values: any) => Promise<void>;
  handleSubmitQuantities: (values: any) => Promise<void>;
}

export const useStockCountForms = (
  createStockCount: (data: {
    name: string;
    scheduledDate: string;
    products: string[];
    notes?: string;
  }) => Promise<StockCount | null>,
  recordQuantities: (
    id: string,
    items: Array<{ itemId: string; actualQuantity: number; notes?: string }>
  ) => Promise<StockCount | null>
): UseStockCountFormsResult => {
  const { t } = useTranslation();

  // UI state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [countDetailsVisible, setCountDetailsVisible] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [selectedCount, setSelectedCount] = useState<StockCount | null>(null);

  // Forms
  const [form] = Form.useForm();
  const [recordForm] = Form.useForm();

  // Handle creating a new stock count
  const handleCreateCount = useCallback(
    async (values: any) => {
      try {
        await createStockCount({
          name: values.name,
          scheduledDate: values.scheduledDate.toISOString(),
          products: values.products,
          notes: values.notes,
        });

        message.success(t("stock.countCreated"));
        setCreateModalVisible(false);
        form.resetFields();
      } catch (err) {
        console.error("Error creating stock count:", err);
        message.error(t("common.errorOccurred"));
      }
    },
    [createStockCount, form, t]
  );

  // Handle viewing count details
  const handleViewCount = useCallback((count: StockCount) => {
    setSelectedCount(count);
    setCountDetailsVisible(true);
  }, []);

  // Handle recording actual quantities
  const handleRecordQuantities = useCallback(
    (count: StockCount) => {
      setSelectedCount(count);
      setRecordModalVisible(true);

      // Initialize form with current values
      const initialValues = {};
      count.items.forEach((item) => {
        initialValues[`quantity-${item.id}`] =
          item.actualQuantity || item.expectedQuantity;
        initialValues[`notes-${item.id}`] = item.notes || "";
      });

      recordForm.setFieldsValue(initialValues);
    },
    [recordForm]
  );

  // Handle submitting recorded quantities
  const handleSubmitQuantities = useCallback(
    async (values: any) => {
      try {
        if (!selectedCount) return;

        // Prepare data for submission
        const itemUpdates = selectedCount.items.map((item) => ({
          itemId: item.id,
          actualQuantity: values[`quantity-${item.id}`],
          notes: values[`notes-${item.id}`],
        }));

        await recordQuantities(selectedCount.id, itemUpdates);
        message.success(t("stock.quantitiesRecorded"));
        setRecordModalVisible(false);
      } catch (err) {
        console.error("Error recording quantities:", err);
        message.error(t("common.errorOccurred"));
      }
    },
    [recordQuantities, selectedCount, t]
  );

  return {
    form,
    recordForm,
    createModalVisible,
    countDetailsVisible,
    recordModalVisible,
    selectedCount,
    setCreateModalVisible,
    setCountDetailsVisible,
    setRecordModalVisible,
    handleViewCount,
    handleRecordQuantities,
    handleCreateCount,
    handleSubmitQuantities,
  };
};
