import React from "react";
import InventorySummaryCard from "./InventorySummaryCard";
import {
  ArchiveBoxIcon,
  BanknotesIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline"; // Example icons

// Mock data - replace with actual data fetching logic
const metricsData = [
  {
    title: "Lowest stock",
    value: "None",
    icon: <ArchiveBoxIcon className="h-8 w-8" />,
    color: "#F472B6", // Pink
    description: "Item with the lowest stock level",
  },
  {
    title: "Stock Value",
    value: "0.000 TND",
    icon: <BanknotesIcon className="h-8 w-8" />,
    color: "#FFFFFF", // White with a border or shadow for visibility
    description: "Total value of current stock",
  },
  {
    title: "Most profitable",
    value: "None",
    icon: <ChartPieIcon className="h-8 w-8" />,
    color: "#34D399", // Green
    description: "Item generating the most profit",
  },
  {
    title: "Top sold item",
    value: "None",
    icon: <ArrowTrendingUpIcon className="h-8 w-8" />,
    color: "#EFF6FF", // Light blue, similar to the image border
    description: "Best-selling item by quantity",
  },
];

const InventoryMetricsDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {metricsData.map((metric, index) => (
        <InventorySummaryCard
          key={index}
          title={metric.description} // Using description as main title as per image
          value={metric.value}
          icon={metric.icon}
          color={metric.color}
          description={metric.title} // Using title as sub-description
        />
      ))}
    </div>
  );
};

export default InventoryMetricsDashboard;
