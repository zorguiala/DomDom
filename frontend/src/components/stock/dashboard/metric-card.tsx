import React from "react";
import { Card, Statistic } from "antd";
import { StatisticProps } from "antd/es/statistic/Statistic";

interface MetricCardProps {
  title: string;
  value: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  precision?: number;
  valueStyle?: React.CSSProperties;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision,
  valueStyle,
}) => {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        precision={precision}
        valueStyle={valueStyle}
        prefix={prefix}
        suffix={suffix}
      />
    </Card>
  );
};

export default MetricCard;