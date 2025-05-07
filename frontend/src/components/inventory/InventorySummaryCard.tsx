import React from "react";

interface InventorySummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const InventorySummaryCard: React.FC<InventorySummaryCardProps> = ({
  title,
  value,
  icon,
  color,
  description,
}) => {
  return (
    <div
      className={`p-4 rounded-lg shadow-md`}
      style={{ backgroundColor: color }}
    >
      <div className="flex items-center mb-2">
        <div className="mr-3 text-white">{icon}</div>
        <div>
          <p className="text-sm font-medium text-white uppercase">
            {description}
          </p>
          <p className="text-2xl font-semibold text-white">{value}</p>
        </div>
      </div>
      <p className="text-xs text-white">{title}</p>
    </div>
  );
};

export default InventorySummaryCard;
