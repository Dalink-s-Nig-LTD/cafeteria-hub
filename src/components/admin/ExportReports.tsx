import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const handleExport = async () => {
    setIsExporting(true);

    // Simulate export delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: "Report Generated",
      description: `Your ${selectedReport} report has been downloaded as ${exportFormat.toUpperCase()}`,
    });

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

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Recent Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "Sales Report - March 2024",
                format: "PDF",
                date: "Mar 15, 2024",
                size: "245 KB",
              },
              {
                name: "Orders Report - February 2024",
                format: "CSV",
                date: "Mar 1, 2024",
                size: "1.2 MB",
              },
              {
                name: "Inventory Report - Q1 2024",
                format: "Excel",
                date: "Feb 28, 2024",
                size: "890 KB",
              },
            ].map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded bg-background">
                    {file.format === "PDF" ? (
                      <FileText className="w-4 h-4 text-destructive" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4 text-success" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.date} · {file.size}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
