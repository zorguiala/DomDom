import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
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
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={label} onChange={handleChange}>
        {products.map((product) => (
          <MenuItem key={product.id} value={product.id}>
            {product.name} ({product.sku})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
