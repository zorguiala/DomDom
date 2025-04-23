import { useEffect, useRef } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Quagga from "quagga";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  isScanning: boolean;
  onClose: () => void;
}

export function BarcodeScanner({
  onDetected,
  isScanning,
  onClose,
}: BarcodeScannerProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isScanning && videoRef.current) {
      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: videoRef.current,
            constraints: {
              facingMode: "environment",
            },
          },
          decoder: {
            readers: [
              "ean_reader",
              "ean_8_reader",
              "code_128_reader",
              "upc_reader",
            ],
          },
        },
        (err) => {
          if (err) {
            console.error("Failed to initialize barcode scanner:", err);
            return;
          }

          Quagga.start();
        }
      );

      Quagga.onDetected((result) => {
        if (result.codeResult.code) {
          onDetected(result.codeResult.code);
          Quagga.stop();
        }
      });

      return () => {
        Quagga.stop();
      };
    }
  }, [isScanning, onDetected]);

  if (!isScanning) return null;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      <div ref={videoRef} style={{ width: "100%", height: 480 }} />
      {isScanning && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Button
        variant="contained"
        color="secondary"
        onClick={onClose}
        sx={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {t("common.cancel")}
      </Button>
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          bottom: -24,
          left: 0,
          width: "100%",
          textAlign: "center",
        }}
      >
        {t("inventory.scanBarcode")}
      </Typography>
    </Box>
  );
}
