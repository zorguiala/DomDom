import React from "react";
import { Table, Space, Button, Input, Switch, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Product } from "../../types/inventory";
import { productApi } from "../../services/productService";
import useDebounce from "../../hooks/useDebounce";

interface ProductListProps {
  onEdit: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ onEdit }) => {
  const [search, setSearch] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery(
    ["products", debouncedSearch, showInactive],
    () =>
      productApi.getProducts({
        search: debouncedSearch,
        isActive: !showInactive,
      })
  );

  const deleteMutation = useMutation(
    (id: string) => productApi.deleteProduct(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("products");
      },
    }
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      render: (stock: number) => stock.toFixed(2),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <span style={{ color: isActive ? "green" : "red" }}>
          {isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Product) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Switch
          checked={showInactive}
          onChange={setShowInactive}
          checkedChildren="Show Inactive"
          unCheckedChildren="Hide Inactive"
        />
      </Space>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={isLoading}
      />
    </div>
  );
};
