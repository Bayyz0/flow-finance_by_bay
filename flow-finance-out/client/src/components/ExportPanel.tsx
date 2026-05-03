import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import { trpc } from "@/lib/trpc";
import { Download, FileText, Sheet } from "lucide-react";

export function ExportPanel() {
  const { success, error, info } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportCSVMutation = trpc.export.exportAsCSV.useMutation({
    onSuccess: (data) => {
      if (data.count === 0) {
        info("No transactions yet — an empty CSV template was downloaded.");
      } else {
        success(`CSV exported — ${data.count} transactions.`);
      }
      const blob = new Blob([data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename;
      link.click();
      URL.revokeObjectURL(url);
    },
    onError: () => error("Failed to export as CSV. Please try again."),
    onSettled: () => setIsExporting(false),
  });

  const exportExcelMutation = trpc.export.exportAsExcel.useMutation({
    onSuccess: (data) => {
      if (data.count === 0) {
        info("No transactions yet — an empty Excel template was downloaded.");
      } else {
        success(`Excel exported — ${data.count} transactions.`);
      }
      const blob = new Blob([data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename;
      link.click();
      URL.revokeObjectURL(url);
    },
    onError: () => error("Failed to export as Excel. Please try again."),
    onSettled: () => setIsExporting(false),
  });

  const summaryQuery = trpc.export.getAccountingSummary.useQuery(
    {},
    { enabled: false }
  );

  const handleDownloadSummary = async () => {
    setIsExporting(true);
    try {
      await summaryQuery.refetch();
      success("Accounting summary generated successfully.");
    } catch {
      error("Failed to generate accounting summary.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>
          Export your financial data in professional formats for accounting software
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-sm">CSV Export</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Standard CSV format compatible with Excel, Google Sheets, and most accounting software
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => { setIsExporting(true); exportCSVMutation.mutate({}); }} disabled={isExporting} variant="outline">
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Sheet className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-sm">Excel Export</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Excel-compatible format with proper formatting and UTF-8 encoding
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => { setIsExporting(true); exportExcelMutation.mutate({}); }} disabled={isExporting} variant="outline">
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-purple-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-sm">Accounting Summary</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Generate a detailed summary with totals, categories, and monthly breakdown
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={handleDownloadSummary} disabled={isExporting} variant="outline">
                <Download className="w-4 h-4 mr-2" />Generate
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-blue-900">
              💡 <strong>Tip:</strong> All exported data includes inflation-adjusted values and tax calculations for accurate financial reporting.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
