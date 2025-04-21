import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay error={this.state.error} onReset={this.handleReset} />
      );
    }

    return this.props.children;
  }
}

interface ErrorDisplayProps {
  error?: Error;
  onReset: () => void;
}

function ErrorDisplay({ error, onReset }: ErrorDisplayProps) {
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
        minHeight: "400px",
      }}
    >
      <Typography variant="h5" color="error" gutterBottom>
        {t("common.error")}
      </Typography>

      <Typography color="text.secondary" align="center" sx={{ mb: 2 }}>
        {error?.message || t("common.unexpectedError")}
      </Typography>

      <Button variant="contained" onClick={onReset}>
        {t("common.retry")}
      </Button>
    </Box>
  );
}
