import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Edit,
  Delete,
  Visibility,
  Warning,
  CheckCircle,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { BOM } from "../../types/bom";

interface BOMCardProps {
  bom: BOM;
  onView: (bom: BOM) => void;
  onEdit: (bom: BOM) => void;
  onDelete: (bom: BOM) => void;
}

export function BOMCard({ bom, onView, onEdit, onDelete }: BOMCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" component="div">
            {bom.name}
          </Typography>
          <Box>
            <Tooltip title={t("common.view")}>
              <IconButton size="small" onClick={() => onView(bom)}>
                <Visibility />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("common.edit")}>
              <IconButton size="small" onClick={() => onEdit(bom)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("common.delete")}>
              <IconButton size="small" onClick={() => onDelete(bom)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography color="text.secondary" sx={{ mb: 1.5 }}>
          {bom.description}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">
            {t("bom.output")}: {bom.outputQuantity} {bom.outputUnit}
          </Typography>
          <Typography variant="body2">
            {t("bom.materials")}: {bom.items.length}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <Chip
            icon={bom.isActive ? <CheckCircle /> : <Warning />}
            label={bom.isActive ? t("common.active") : t("common.inactive")}
            color={bom.isActive ? "success" : "default"}
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
}
