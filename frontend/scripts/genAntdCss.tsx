import { writeFileSync } from "node:fs";
import React from "react";
import { extractStyle } from "@ant-design/static-style-extract";
import { ConfigProvider } from "antd";

const outputPath = "./public/antd.min.css";

const css = extractStyle((node) => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: "#D4AF37", // Gold color for Dom Dom's brand
        borderRadius: 6,
      },
    }}
  >
    {node}
  </ConfigProvider>
));

writeFileSync(outputPath, css);
