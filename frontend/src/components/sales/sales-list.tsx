import { Table, Spin, Button, Modal, message } from "antd";
import {
  useSales,
  useDeleteSale,
  useCreateSale,
  useUpdateSale,
} from "../../hooks/use-sales";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { SalesForm } from "./sales-form";
import { Sale, CreateSaleDto } from "../../types/sales";

export function SalesList() {
  const { t } = useTranslation();
  const { data, isLoading } = useSales();
  const { mutate: deleteSale } = useDeleteSale();
  const { mutate: createSale, isLoading: isCreating } = useCreateSale();
  const { mutate: updateSale, isLoading: isUpdating } = useUpdateSale();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | undefined>();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: t("sales.deleteConfirmation"),
      content: t("sales.deleteWarning"),
      onOk: () => deleteSale(id),
    });
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingSale(undefined);
    setFormOpen(true);
  };

  const handleFormSubmit = (values: CreateSaleDto) => {
    if (editingSale) {
      updateSale({ id: editingSale.id, update: values });
      message.success(t("sales.updated"));
    } else {
      createSale(values);
      message.success(t("sales.created"));
    }
    setFormOpen(false);
  };

  const columns = [
    { title: t("sales.id"), dataIndex: "id", key: "id" },
    {
      title: t("sales.customer"),
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: t("sales.totalAmount"),
      dataIndex: "totalAmount",
      key: "totalAmount",
    },
    { title: t("sales.status"), dataIndex: "status", key: "status" },
    { title: t("sales.createdAt"), dataIndex: "createdAt", key: "createdAt" },
    {
      title: t("common.actions"),
      key: "actions",
      render: (_: any, record: Sale) => (
        <span>
          <Button onClick={() => handleEdit(record)}>{t("common.edit")}</Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            {t("common.delete")}
          </Button>
        </span>
      ),
    },
  ];

  return (
    <>
      <Button
        type="primary"
        onClick={handleCreate}
        style={{ marginBottom: 16 }}
      >
        {t("sales.createSale")}
      </Button>
      {isLoading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          pagination={{
            total: data?.total,
            pageSize: data?.limit,
            current: data?.page,
          }}
        />
      )}
      <SalesForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingSale}
        loading={isCreating || isUpdating}
      />
    </>
  );
}
