import { useEffect, useRef } from "react";
import { Modal, Button, Spin, Typography } from "antd";
import Quagga from "quagga";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

interface BarcodeScannerProps {
  isScanning: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
}

export function BarcodeScanner({
  isScanning,
  onClose,
  onDetected,
}: BarcodeScannerProps) {
  const { t } = useTranslation();
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isScanning && scannerRef.current) {
      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              facingMode: "environment",
            },
          },
          decoder: {
            readers: ["ean_reader", "ean_8_reader", "code_128_reader"],
          },
        },
        (err) => {
          if (err) {
            console.error("Error initializing Quagga:", err);
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

  return (
    <Modal
      open={isScanning}
      onCancel={onClose}
      title={t("inventory.scanBarcode")}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t("common.cancel")}
        </Button>,
      ]}
    >
      <div style={{ position: "relative", minHeight: 300 }}>
        <div
          ref={scannerRef}
          style={{
            position: "relative",
            width: "100%",
            height: 300,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1,
            }}
          >
            <Spin size="large" />
          </div>
        </div>
      </div>
    </Modal>
  );
}
