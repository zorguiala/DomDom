import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  BOM,
  MaterialRequirement,
  AvailabilityCheck,
  ProductionCost,
} from "../../types/bom";
import { bomApi } from "../../services/bomService";

interface BOMDetailsProps {
  open: boolean;
  onClose: () => void;
  bom: BOM;
}

export function BOMDetails({ open, onClose, bom }: BOMDetailsProps) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState<number>(bom.outputQuantity);

  const { data: requirements, isLoading: loadingRequirements } = useQuery({
    queryKey: ["bom-requirements", bom.id, quantity],
    queryFn: () => bomApi.getMaterialRequirements(bom.id, quantity),
    enabled: open,
  });

  const { data: availability, isLoading: loadingAvailability } = useQuery({
    queryKey: ["bom-availability", bom.id, quantity],
    queryFn: () => bomApi.checkAvailability(bom.id, quantity),
    enabled: open,
  });

  const { data: cost, isLoading: loadingCost } = useQuery({
    queryKey: ["bom-cost", bom.id, quantity],
    queryFn: () => bomApi.calculateCost(bom.id, quantity),
    enabled: open,
  });

  const isLoading = loadingRequirements || loadingAvailability || loadingCost;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {t("bom.details")}: {bom.name}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {bom.description}
          </Typography>

          <TextField
            type="number"
            label={t("bom.desiredQuantity")}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            sx={{ mt: 2 }}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Material Requirements */}
            <Typography variant="h6" gutterBottom>
              {t("bom.materialRequirements")}
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("bom.material")}</TableCell>
                    <TableCell align="right">
                      {t("bom.requiredQuantity")}
                    </TableCell>
                    <TableCell>{t("bom.unit")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requirements?.map((req: MaterialRequirement) => (
                    <TableRow key={req.product.id}>
                      <TableCell>{req.product.name}</TableCell>
                      <TableCell align="right">
                        {req.requiredQuantity}
                      </TableCell>
                      <TableCell>{req.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Availability Check */}
            <Typography variant="h6" gutterBottom>
              {t("bom.availability")}
            </Typography>
            {availability && (
              <>
                <Alert
                  severity={availability.isAvailable ? "success" : "warning"}
                  sx={{ mb: 2 }}
                >
                  {availability.isAvailable
                    ? t("bom.materialsAvailable")
                    : t("bom.materialsShortage")}
                </Alert>
                {!availability.isAvailable && (
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("bom.material")}</TableCell>
                          <TableCell align="right">
                            {t("bom.required")}
                          </TableCell>
                          <TableCell align="right">
                            {t("bom.available")}
                          </TableCell>
                          <TableCell align="right">
                            {t("bom.shortage")}
                          </TableCell>
                          <TableCell>{t("bom.unit")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {availability.shortages.map((shortage) => (
                          <TableRow key={shortage.product.id}>
                            <TableCell>{shortage.product.name}</TableCell>
                            <TableCell align="right">
                              {shortage.required}
                            </TableCell>
                            <TableCell align="right">
                              {shortage.available}
                            </TableCell>
                            <TableCell align="right">
                              {shortage.shortage}
                            </TableCell>
                            <TableCell>{shortage.unit}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}

            {/* Cost Breakdown */}
            {cost && (
              <>
                <Typography variant="h6" gutterBottom>
                  {t("bom.costBreakdown")}
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("bom.material")}</TableCell>
                        <TableCell align="right">{t("bom.quantity")}</TableCell>
                        <TableCell>{t("bom.unit")}</TableCell>
                        <TableCell align="right">{t("bom.unitCost")}</TableCell>
                        <TableCell align="right">
                          {t("bom.totalCost")}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cost.costBreakdown.map((item) => (
                        <TableRow key={item.product.id}>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell align="right">
                            ${item.unitCost.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            ${item.totalCost.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} align="right">
                          <strong>{t("bom.totalMaterialCost")}:</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>${cost.materialCost.toFixed(2)}</strong>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} align="right">
                          <strong>{t("bom.totalProductionCost")}:</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>${cost.totalCost.toFixed(2)}</strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t("common.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}
