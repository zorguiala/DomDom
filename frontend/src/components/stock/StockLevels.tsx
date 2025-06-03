import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Card, Badge, Input, Select, Button, Tooltip, Progress, Empty, Spin, Alert } from 'antd';
import { SearchOutlined, ReloadOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { stockService } from '../../services/stock-service';
import { formatNumber } from '../../utils/formatters';

const { Option } = Select;

interface StockItem {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category?: string;
    minStockLevel?: number;
  };
  quantity: number;
  location?: string;
  batchNumber?: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  minStockLevel: number;
  totalQuantity: number;
}

const StockLevels: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Fetch all stock items
  const { data: stockItems, isLoading: isLoadingStock, error: stockError, refetch: refetchStock } = useQuery({
    queryKey: ['stockItems'],
    queryFn: () => stockService.getAllStockItems(),
  });

  // Fetch low stock items specifically
  const { data: lowStockItems, isLoading: isLoadingLowStock, error: lowStockError, refetch: refetchLowStock } = useQuery({
    queryKey: ['lowStockItems'],
    queryFn: () => stockService.getLowStockItems(),
  });

  // Fetch unique categories for filter dropdown
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => stockService.getProductCategories(),
  });

  const categories = useMemo(() => {
    if (!products) return [];
    const uniqueCategories = new Set(products.map(product => product.category).filter(Boolean));
    return Array.from(uniqueCategories);
  }, [products]);

  // Combine stock data with low stock information
  const combinedStockData = useMemo(() => {
    if (!stockItems) return [];

    const lowStockMap = new Map<string, LowStockProduct>();
    if (lowStockItems) {
      lowStockItems.forEach(item => {
        lowStockMap.set(item.id, item);
      });
    }

    return stockItems.map(item => {
      const isLowStock = lowStockMap.has(item.product.id);
      const lowStockInfo = lowStockMap.get(item.product.id);
      
      return {
        ...item,
        isLowStock,
        stockLevel: isLowStock ? lowStockInfo?.totalQuantity : item.quantity,
        minLevel: item.product.minStockLevel || 0,
      };
    });
  }, [stockItems, lowStockItems]);

  // Apply filters
  const filteredData = useMemo(() => {
    if (!combinedStockData) return [];

    return combinedStockData.filter(item => {
      // Search filter
      const matchesSearch = !searchText || 
        item.product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.product.sku.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchText.toLowerCase()));

      // Category filter
      const matchesCategory = !categoryFilter || item.product.category === categoryFilter;

      // Low stock filter
      const matchesLowStock = !showLowStockOnly || item.isLowStock;

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [combinedStockData, searchText, categoryFilter, showLowStockOnly]);

  const handleRefresh = () => {
    refetchStock();
    refetchLowStock();
  };

  // Calculate stock level percentage for progress bar
  const getStockLevelPercentage = (item: any) => {
    if (!item.minLevel) return 100;
    const percentage = (item.stockLevel / item.minLevel) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  // Determine progress bar status based on stock level
  const getProgressStatus = (item: any) => {
    if (!item.minLevel) return 'success';
    if (item.stockLevel <= item.minLevel * 0.25) return 'exception';
    if (item.stockLevel <= item.minLevel * 0.75) return 'warning';
    return 'success';
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      render: (product: any) => (
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-xs text-gray-500">{product.sku}</div>
        </div>
      ),
      sorter: (a: any, b: any) => a.product.name.localeCompare(b.product.name),
    },
    {
      title: 'Category',
      dataIndex: ['product', 'category'],
      key: 'category',
      sorter: (a: any, b: any) => {
        if (!a.product.category) return -1;
        if (!b.product.category) return 1;
        return a.product.category.localeCompare(b.product.category);
      },
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      sorter: (a: any, b: any) => {
        if (!a.location) return -1;
        if (!b.location) return 1;
        return a.location.localeCompare(b.location);
      },
    },
    {
      title: 'Stock Level',
      key: 'stockLevel',
      render: (item: any) => (
        <div>
          <div className="flex items-center">
            <span className={`font-medium ${item.isLowStock ? 'text-red-500' : ''}`}>
              {formatNumber(item.stockLevel)}
            </span>
            {item.isLowStock && (
              <Tooltip title="Low stock">
                <WarningOutlined className="ml-2 text-red-500" />
              </Tooltip>
            )}
          </div>
          {item.minLevel > 0 && (
            <div className="w-full mt-1">
              <Progress 
                percent={getStockLevelPercentage(item)} 
                status={getProgressStatus(item)}
                size="small"
                format={() => `${formatNumber(item.stockLevel)}/${formatNumber(item.minLevel)}`}
              />
            </div>
          )}
        </div>
      ),
      sorter: (a: any, b: any) => a.stockLevel - b.stockLevel,
    },
    {
      title: 'Min. Level',
      dataIndex: ['product', 'minStockLevel'],
      key: 'minLevel',
      render: (minLevel: number) => minLevel ? formatNumber(minLevel) : 'N/A',
      sorter: (a: any, b: any) => {
        if (!a.product.minStockLevel) return -1;
        if (!b.product.minStockLevel) return 1;
        return a.product.minStockLevel - b.product.minStockLevel;
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (item: any) => {
        if (!item.minLevel) return <Badge status="default" text="No minimum set" />;
        
        if (item.stockLevel <= item.minLevel * 0.25) {
          return <Badge status="error" text="Critical" />;
        } else if (item.stockLevel <= item.minLevel * 0.75) {
          return <Badge status="warning" text="Low" />;
        } else if (item.stockLevel <= item.minLevel * 1.25) {
          return <Badge status="processing" text="Adequate" />;
        } else {
          return <Badge status="success" text="Good" />;
        }
      },
      filters: [
        { text: 'Critical', value: 'critical' },
        { text: 'Low', value: 'low' },
        { text: 'Adequate', value: 'adequate' },
        { text: 'Good', value: 'good' },
      ],
      onFilter: (value: string, item: any) => {
        if (!item.minLevel) return false;
        
        if (value === 'critical') {
          return item.stockLevel <= item.minLevel * 0.25;
        } else if (value === 'low') {
          return item.stockLevel > item.minLevel * 0.25 && item.stockLevel <= item.minLevel * 0.75;
        } else if (value === 'adequate') {
          return item.stockLevel > item.minLevel * 0.75 && item.stockLevel <= item.minLevel * 1.25;
        } else if (value === 'good') {
          return item.stockLevel > item.minLevel * 1.25;
        }
        return false;
      },
    },
  ];

  const isLoading = isLoadingStock || isLoadingLowStock;
  const error = stockError || lowStockError;

  // Count of low stock items
  const lowStockCount = useMemo(() => {
    return lowStockItems?.length || 0;
  }, [lowStockItems]);

  return (
    <Card 
      title={
        <div className="flex justify-between items-center">
          <span>Stock Levels</span>
          {lowStockCount > 0 && (
            <Badge count={lowStockCount} overflowCount={99}>
              <Button 
                type={showLowStockOnly ? "primary" : "default"}
                danger={showLowStockOnly}
                icon={<WarningOutlined />}
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              >
                Low Stock
              </Button>
            </Badge>
          )}
        </div>
      }
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
          loading={isLoading}
        >
          Refresh
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <Input
          placeholder="Search products, SKUs, locations..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        
        <Select
          placeholder="Filter by category"
          style={{ width: 200 }}
          allowClear
          onChange={value => setCategoryFilter(value)}
          value={categoryFilter}
        >
          {categories.map(category => (
            <Option key={category} value={category}>{category}</Option>
          ))}
        </Select>
      </div>

      {error ? (
        <Alert 
          message="Error loading stock data" 
          description={error instanceof Error ? error.message : "An unknown error occurred"}
          type="error" 
          showIcon 
        />
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Loading stock data..." />
        </div>
      ) : filteredData.length === 0 ? (
        <Empty description="No stock items found" />
      ) : (
        <Table 
          dataSource={filteredData} 
          columns={columns} 
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      )}

      {lowStockCount > 0 && !showLowStockOnly && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center text-yellow-700">
            <WarningOutlined className="mr-2" />
            <span className="font-medium">
              {lowStockCount} {lowStockCount === 1 ? 'product is' : 'products are'} below minimum stock levels.
            </span>
            <Button 
              type="link" 
              className="ml-2 text-yellow-700" 
              onClick={() => setShowLowStockOnly(true)}
            >
              View low stock items
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default StockLevels;
