import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get dashboard KPIs
    const [
      totalRevenue,
      totalOrders,
      totalProducts,
      totalEmployees,
      lowStockProducts,
      recentSales,
      recentProduction,
    ] = await Promise.all([
      // Total Revenue (from completed sales)
      prisma.sale.aggregate({
        where: {
          status: "DELIVERED",
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Total Orders
      prisma.sale.count(),

      // Total Products
      prisma.product.count(),

      // Total Employees (users)
      prisma.user.count(), // Low Stock Products
      prisma.product.findMany({
        where: {
          qtyOnHand: { lte: 10 }, // Simple low stock threshold
        },
        take: 10,
        orderBy: {
          qtyOnHand: "asc",
        },
      }),

      // Recent Sales
      prisma.sale.findMany({
        take: 5,
        orderBy: {
          saleDate: "desc",
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),

      // Recent Production Orders
      prisma.productionOrder.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: true,
        },
      }),
    ]);

    // Calculate additional metrics
    const averageOrderValue =
      totalOrders > 0 ? (totalRevenue._sum.totalAmount || 0) / totalOrders : 0;

    const dashboardData = {
      kpis: {
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        revenueChange: 20.1, // You can calculate this based on previous period
        totalOrders,
        ordersChange: 19, // Calculate based on previous period
        totalProducts,
        lowStockCount: lowStockProducts.length,
        totalEmployees,
        employeesChange: 2, // Calculate based on previous period
        averageOrderValue,
      },
      revenueChart: [
        { name: "Jan", total: 35000 },
        { name: "Feb", total: 42000 },
        { name: "Mar", total: 38000 },
        { name: "Apr", total: 45000 },
        { name: "May", total: 52000 },
        { name: "Jun", total: 48000 },
      ],
      recentActivity: recentSales.map((sale: any) => ({
        id: sale.id,
        type: "sale",
        description: `Order ${sale.orderNumber} from ${sale.customerName}`,
        amount: sale.totalAmount,
        user: "Sales Team",
        timestamp: sale.orderDate.toISOString(),
      })),
      inventory: {
        totalProducts,
        lowStockItems: lowStockProducts.filter(
          (p: any) => p.qtyOnHand <= (p.minQty || 0) && p.qtyOnHand > 0,
        ).length,
        outOfStockItems: lowStockProducts.filter((p: any) => p.qtyOnHand === 0)
          .length,
        recentlyUpdated: 45, // This would require tracking update timestamps
        topLowStockItems: lowStockProducts.slice(0, 3).map((product: any) => ({
          name: product.name,
          currentStock: product.qtyOnHand,
          minStock: product.minQty || 0,
          category: product.category || "Uncategorized",
        })),
      },
      production: {
        activeOrders: recentProduction.filter(
          (p: any) => p.status === "IN_PROGRESS",
        ).length,
        completedToday: recentProduction.filter(
          (p: any) =>
            p.status === "DONE" &&
            p.actualEndDate &&
            new Date(p.actualEndDate).toDateString() ===
              new Date().toDateString(),
        ).length,
        pendingOrders: recentProduction.filter(
          (p: any) => p.status === "PLANNED",
        ).length,
        delayedOrders: recentProduction.filter(
          (p: any) =>
            p.status === "IN_PROGRESS" &&
            p.expectedEndDate &&
            new Date(p.expectedEndDate) < new Date(),
        ).length,
        recentOrders: recentProduction.slice(0, 2).map((order: any) => ({
          id: order.orderNumber,
          product: order.product.name,
          quantity: order.qtyOrdered,
          status: order.status.toLowerCase().replace("_", "_"),
          progress: Math.round((order.qtyProduced / order.qtyOrdered) * 100),
          startDate: order.startDate?.toISOString() || new Date().toISOString(),
          expectedCompletion:
            order.expectedEndDate?.toISOString() || new Date().toISOString(),
        })),
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
