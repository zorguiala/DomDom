"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "@/lib/language-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Sale } from "@/types/sales";
import { Edit, Eye, FileText, Package, Truck } from "lucide-react";
import Link from "next/link";

interface SalesTableProps {
  sales: Sale[];
}

export function SalesTable({ sales }: SalesTableProps) {
  const t = useTranslations("sales");
  const common = useTranslations("common");

  const getStatusVariant = (sale: Sale) => {
    if (sale.type === "DOOR_TO_DOOR" && sale.vanOperation?.status === "IN_PROGRESS") {
      return "secondary";
    }

    switch (sale.status) {
      case "QUOTE":
        return "secondary";
      case "CONFIRMED":
      case "DELIVERED":
        return "default";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (sale: Sale) => {
    if (sale.type === "DOOR_TO_DOOR" && sale.vanOperation?.status === "IN_PROGRESS") {
      return t("processing");
    }
    return t(sale.status.toLowerCase());
  };

  const getSaleTypeIcon = (type: string) => {
    return type === "DOOR_TO_DOOR" ? (
      <div className="flex items-center gap-1">
        <Truck className="h-4 w-4" />
        <span>{t("vanSale")}</span>
      </div>
    ) : (
      <div className="flex items-center gap-1">
        <FileText className="h-4 w-4" />
        <span>{t("classicSale")}</span>
      </div>
    );
  };

  return (
    <Table>
      <TableCaption>{t("recentSalesTransactions")}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{t("saleNumber")}</TableHead>
          <TableHead>{common("type")}</TableHead>
          <TableHead>{t("customer")}</TableHead>
          <TableHead>{common("date")}</TableHead>
          <TableHead>{common("amount")}</TableHead>
          <TableHead>{common("status")}</TableHead>
          <TableHead>{t("details")}</TableHead>
          <TableHead className="text-right">{common("actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">
              {t("noSalesFound")}
            </TableCell>
          </TableRow>
        ) : (
          sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">
                <Badge variant="outline">{sale.saleNumber}</Badge>
              </TableCell>
              <TableCell>{getSaleTypeIcon(sale.type)}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{sale.customerName}</div>
                  {sale.customerEmail && (
                    <div className="text-sm text-muted-foreground">
                      {sale.customerEmail}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(new Date(sale.createdAt))}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{formatCurrency(sale.totalAmount)}</div>
                  {sale.type === "CLASSIC" && sale.tva > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {t("tva")}: {formatCurrency(sale.tva)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(sale) as any}>
                  {getStatusLabel(sale)}
                </Badge>
              </TableCell>
              <TableCell>
                {sale.type === "DOOR_TO_DOOR" && sale.vanOperation ? (
                  <div className="text-sm">
                    <div>
                      {t("driverName")}: {sale.vanOperation.driverName || "N/A"}
                    </div>
                    {sale.exitSlipNumber && (
                      <div className="text-muted-foreground">
                        {t("exitSlip")}: {sale.exitSlipNumber}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm">
                    {sale.items.length} {common("items")}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Link href={`/sales/${sale.id}`}>
                    <Button variant="ghost" size="sm" title={common("viewDetails")}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {sale.type === "DOOR_TO_DOOR" &&
                    sale.vanOperation?.status === "IN_PROGRESS" && (
                      <Link href={`/sales/${sale.id}/returns`}>
                        <Button variant="ghost" size="sm" title={t("processReturns")}>
                          <Package className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  <Link href={`/sales/${sale.id}/edit`}>
                    <Button variant="ghost" size="sm" title={common("edit")}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}