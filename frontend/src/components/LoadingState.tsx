import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography>{message || t("common.loading")}</Typography>
    </Box>
  );
}
