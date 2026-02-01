import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FileText,
  Download,
  FileSpreadsheet,
  Calendar as CalendarIcon,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type ReportType = "sales" | "orders" | "inventory" | "users";
type ExportFormat = "pdf" | "csv" | "excel";

interface ReportOption {
  id: ReportType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const reportOptions: ReportOption[] = [
  {
    id: "sales",
    name: "Sales Report",
    description: "Revenue and transaction data",
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    id: "orders",
    name: "Orders Report",
    description: "All orders with details",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "inventory",
    name: "Inventory Report",
    description: "Stock levels and menu items",
    icon: <FileSpreadsheet className="w-5 h-5" />,
  },
  {
    id: "users",
    name: "Users Report",
    description: "Staff and access logs",
    icon: <FileText className="w-5 h-5" />,
  },
];

export function ExportReports() {
  const ordersStats = useQuery(api.orders.getOrdersStats);
  const allOrders = useQuery(api.orders.getAllOrders);
  const menuItems = useQuery(api.menuItems.getAllMenuItems);
  const [selectedReport, setSelectedReport] = useState<ReportType>("sales");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const generatePDFReport = () => {
    const doc = new jsPDF() as any;
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(18);
    doc.text("New Era Cafeteria", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(14);
    const reportTitle =
      reportOptions.find((r) => r.id === selectedReport)?.name || "Report";
    doc.text(reportTitle, pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(10);
    const dateStr =
      dateRange.from && dateRange.to
        ? `${format(dateRange.from, "PP")} - ${format(dateRange.to, "PP")}`
        : `Generated: ${format(new Date(), "PPP")}`;
    doc.text(dateStr, pageWidth / 2, 38, { align: "center" });

    let startY = 48;

    if (selectedReport === "sales" && allOrders) {
      const filteredOrders =
        dateRange.from && dateRange.to
          ? allOrders.filter((order) => {
              const orderDate = new Date(order.createdAt);
              return orderDate >= dateRange.from! && orderDate <= dateRange.to!;
            })
          : allOrders;

      const tableData = filteredOrders.map((order) => {
        const orderDate = new Date(order.createdAt);
        return [
          format(orderDate, "MM/dd/yyyy HH:mm"),
          order.paymentMethod,
          `N${order.total.toLocaleString()}`,
        ];
      });

      const totalRevenue = filteredOrders.reduce(
        (sum, order) => sum + order.total,
        0,
      );

      autoTable(doc, {
        startY: startY,
        head: [["Date & Time", "Payment Method", "Amount"]],
        body: tableData,
        foot: [["", "Total Revenue:", `N${totalRevenue.toLocaleString()}`]],
        theme: "grid",
        headStyles: {
          fillColor: [66, 139, 202],
          fontStyle: "bold",
          fontSize: 11,
          textColor: [255, 255, 255],
        },
        footStyles: {
          fillColor: [240, 240, 240],
          fontStyle: "bold",
          fontSize: 11,
          textColor: [0, 0, 0],
        },
        styles: {
          fontSize: 11,
          cellPadding: 3,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.3,
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 40 },
          2: { cellWidth: 40, halign: "right" },
        },
      });
    } else if (selectedReport === "orders" && allOrders) {
      const filteredOrders =
        dateRange.from && dateRange.to
          ? allOrders.filter((order) => {
              const orderDate = new Date(order.createdAt);
              return orderDate >= dateRange.from! && orderDate <= dateRange.to!;
            })
          : allOrders;

      const tableData: any[] = [];
      let grandTotal = 0;

      filteredOrders.forEach((order, idx) => {
        const orderDate = new Date(order.createdAt);
        const orderHeader = `Order #${idx + 1} - ${format(orderDate, "MM/dd/yyyy HH:mm")} - ${order.paymentMethod}`;

        tableData.push([
          {
            content: orderHeader,
            colSpan: 4,
            styles: { fontStyle: "bold", fillColor: [220, 220, 220] },
          },
        ]);

        order.items.forEach((item) => {
          const itemTotal = item.price * item.quantity;
          tableData.push([
            item.name,
            item.quantity.toString(),
            `N${item.price.toLocaleString()}`,
            `N${itemTotal.toLocaleString()}`,
          ]);
        });

        tableData.push([
          {
            content: "Order Total:",
            colSpan: 3,
            styles: { fontStyle: "bold", halign: "right" },
          },
          {
            content: `N${order.total.toLocaleString()}`,
            styles: { fontStyle: "bold" },
          },
        ]);

        grandTotal += order.total;

        if (idx < filteredOrders.length - 1) {
          tableData.push([
            { content: "", colSpan: 4, styles: { minCellHeight: 2 } },
          ]);
        }
      });

      autoTable(doc, {
        startY: startY,
        head: [["Item", "Qty", "Price", "Total"]],
        body: tableData,
        foot: [["", "", "Grand Total:", `N${grandTotal.toLocaleString()}`]],
        theme: "grid",
        headStyles: {
          fillColor: [66, 139, 202],
          fontStyle: "bold",
          fontSize: 11,
          textColor: [255, 255, 255],
        },
        footStyles: {
          fillColor: [240, 240, 240],
          fontStyle: "bold",
          fontSize: 11,
          textColor: [0, 0, 0],
        },
        styles: {
          fontSize: 10,
          cellPadding: 2,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.3,
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 20, halign: "center" },
          2: { cellWidth: 40, halign: "right" },
          3: { cellWidth: 40, halign: "right" },
        },
      });
    } else if (selectedReport === "inventory" && menuItems) {
      const tableData = menuItems.map((item) => [
        item.name,
        item.category,
        `N${item.price.toLocaleString()}`,
        item.available ? "Available" : "Out of Stock",
      ]);

      const totalValue = menuItems.reduce((sum, item) => sum + item.price, 0);
      const availableCount = menuItems.filter((i) => i.available).length;

      autoTable(doc, {
        startY: startY,
        head: [["Item Name", "Category", "Price", "Status"]],
        body: tableData,
        foot: [
          ["", "", "", ""],
          [
            `Total Items: ${menuItems.length}`,
            `Available: ${availableCount}`,
            "Total Value:",
            `N${totalValue.toLocaleString()}`,
          ],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [66, 139, 202],
          fontStyle: "bold",
          fontSize: 11,
          textColor: [255, 255, 255],
        },
        footStyles: {
          fillColor: [240, 240, 240],
          fontStyle: "bold",
          fontSize: 11,
          textColor: [0, 0, 0],
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.3,
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40 },
          2: { cellWidth: 35, halign: "right" },
          3: { cellWidth: 35, halign: "center" },
        },
      });
    } else {
      doc.setFontSize(10);
      doc.text("No data available for this report type.", 15, startY);
    }

    const fileName = `${selectedReport}_report_${format(new Date(), "yyyy-MM-dd")}.pdf`;
    doc.save(fileName);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      if (exportFormat === "pdf") {
        generatePDFReport();
        toast({
          title: "Report Downloaded",
          description: `Your ${selectedReport} report has been downloaded as PDF`,
        });
      } else {
        // For CSV/Excel, show not implemented message
        toast({
          title: "Format Not Available",
          description: `${exportFormat.toUpperCase()} export is coming soon. Please use PDF format.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description:
          "There was an error generating the report. Please try again.",
        variant: "destructive",
      });
    }

    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Download className="w-5 h-5 text-primary" />
            Export Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Report Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reportOptions.map((report) => (
                <Card
                  key={report.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:border-primary/50",
                    selectedReport === report.id &&
                      "border-primary bg-primary/5",
                  )}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        selectedReport === report.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary",
                      )}
                    >
                      {report.icon}
                    </div>
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal flex-1",
                      !dateRange.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from
                      ? format(dateRange.from, "PPP")
                      : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) =>
                      setDateRange((prev) => ({ ...prev, from: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal flex-1",
                      !dateRange.to && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "PPP") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) =>
                      setDateRange((prev) => ({ ...prev, to: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Quick Date Presets */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Today", days: 0 },
                { label: "Last 7 days", days: 7 },
                { label: "Last 30 days", days: 30 },
                { label: "This month", days: -1 },
              ].map((preset) => (
                <Badge
                  key={preset.label}
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => {
                    const to = new Date();
                    let from: Date;
                    if (preset.days === -1) {
                      from = new Date(to.getFullYear(), to.getMonth(), 1);
                    } else if (preset.days === 0) {
                      from = new Date();
                    } else {
                      from = new Date(
                        Date.now() - preset.days * 24 * 60 * 60 * 1000,
                      );
                    }
                    setDateRange({ from, to });
                  }}
                >
                  {preset.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Export Format */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Export Format</label>
            <Select
              value={exportFormat}
              onValueChange={(v) => setExportFormat(v as ExportFormat)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                <SelectItem value="excel">Excel Workbook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full sm:w-auto gap-2"
          >
            {isExporting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
