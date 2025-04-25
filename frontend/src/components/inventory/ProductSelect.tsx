import { Select, Form } from "antd";
import { Product } from "../../types/inventory";

interface ProductSelectProps {
  value: string;
  onChange: (value: string) => void;
  products: Product[];
  label: string;
}

export function ProductSelect({
  value,
  onChange,
  products,
  label,
}: ProductSelectProps) {
  return (
    <Form.Item label={label}>
      <Select value={value} onChange={onChange} style={{ width: "100%" }}>
        {products.map((product) => (
          <Select.Option key={product.id} value={product.id}>
            {product.name} ({product.sku})
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
