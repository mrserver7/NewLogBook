import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Export() {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportType, setExportType] = useState("summary");
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeNotes, setIncludeNotes] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/cases/stats"],
  });

  const { data: cases } = useQuery({
    queryKey: ["/api/cases", { limit: 1000 }],
  });

  const exportData = useMutation({
    mutationFn: async (exportConfig: any) => {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportConfig),
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Get filename from content-disposition header
      const contentDisposition = response.headers.get('content-disposition') || '';
      let filename = `export-${new Date().toISOString().split('T')[0]}`;
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return { success: true, downloadUrl: url };
    },
    onSuccess: (data: any) => {
      toast({
        title: "Export Complete",
        description: "Your file has been downloaded successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/auth/login";
        }, 500);
        return;
      }
      toast({
        title: "Export Failed",
        description: "Failed to generate export. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleExport = () => {
    if (dateRange === "custom" && (!startDate || !endDate)) {
      toast({
        title: "Date Range Required",
        description: "Please select both start and end dates for custom range",
        variant: "destructive",
      });
      return;
    }

    const exportConfig = {
      format: exportFormat,
      type: exportType,
      dateRange,
      startDate: dateRange === "custom" ? startDate : null,
      endDate: dateRange === "custom" ? endDate : null,
      includeNotes,
    };

    exportData.mutate(exportConfig);
  };

  const exportOptions = [
    {
      id: "summary",
      title: "Case Summary Report",
      description: "Overview of all cases with key metrics and statistics",
      formats: ["pdf", "csv"],
      icon: "fas fa-chart-bar",
    },
    {
      id: "detailed",
      title: "Detailed Case Report",
      description: "Complete case information including notes and timing",
      formats: ["pdf"],
      icon: "fas fa-file-medical",
    },
    {
      id: "logbook",
      title: "Digital Logbook",
      description: "Traditional logbook format for certification requirements",
      formats: ["pdf"],
      icon: "fas fa-book",
    },
    {
      id: "raw",
      title: "Raw Data Export",
      description: "All case data in spreadsheet format for analysis",
      formats: ["csv", "json"],
      icon: "fas fa-database",
    },
  ];

  const getFilteredCases = () => {
    if (!cases) return [];
    
    if (dateRange === "all") return cases;
    
    const now = new Date();
    let filterDate = new Date();
    
    switch (dateRange) {
      case "thisWeek":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "thisMonth":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "thisQuarter":
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case "thisYear":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case "custom":
        if (startDate && endDate) {
          return cases.filter((c: any) => {
            const caseDate = new Date(c.caseDate);
            return caseDate >= new Date(startDate) && caseDate <= new Date(endDate);
          });
        }
        return cases;
      default:
        return cases;
    }
    
    return cases.filter((c: any) => new Date(c.caseDate) >= filterDate);
  };

  const filteredCases = getFilteredCases();

  return (
    <MainLayout title="Export" subtitle="Export your case data in various formats">
      <div className="space-y-8">
        {/* Export Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-procedures text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {filteredCases.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cases to Export</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-calendar text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {filteredCases.length > 0 ? new Date(Math.min(...filteredCases.map((c: any) => new Date(c.caseDate).getTime()))).getFullYear() : "--"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Earliest Case</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-clock text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {filteredCases.length > 0 ? new Date(Math.max(...filteredCases.map((c: any) => new Date(c.caseDate).getTime()))).getFullYear() : "--"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Latest Case</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Export Options */}
          <div className="lg:col-span-2">
            <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {exportOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      exportType === option.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => setExportType(option.id)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        exportType === option.id
                          ? "bg-blue-600 text-white"
                          : "bg-light-elevated dark:bg-dark-elevated text-gray-600 dark:text-gray-400"
                      }`}>
                        <i className={option.icon}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {option.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {option.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          {option.formats.map((format) => (
                            <span
                              key={format}
                              className="px-2 py-1 bg-light-elevated dark:bg-dark-elevated text-xs font-medium text-gray-600 dark:text-gray-400 rounded"
                            >
                              {format.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Export Configuration */}
          <div className="space-y-6">
            <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Export Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="exportFormat">Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="bg-light-elevated dark:bg-dark-elevated border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {exportOptions.find(o => o.id === exportType)?.formats.map((format) => (
                        <SelectItem key={format} value={format}>
                          {format.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="bg-light-elevated dark:bg-dark-elevated border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="thisWeek">This Week</SelectItem>
                      <SelectItem value="thisMonth">This Month</SelectItem>
                      <SelectItem value="thisQuarter">This Quarter</SelectItem>
                      <SelectItem value="thisYear">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {dateRange === "custom" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-light-elevated dark:bg-dark-elevated border-0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-light-elevated dark:bg-dark-elevated border-0"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeNotes"
                      checked={includeNotes}
                      onCheckedChange={setIncludeNotes}
                    />
                    <Label htmlFor="includeNotes" className="text-sm">
                      Include case notes
                    </Label>
                  </div>
                </div>

                <Button
                  onClick={handleExport}
                  disabled={exportData.isPending || filteredCases.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white disabled:opacity-50"
                >
                  <i className="fas fa-download mr-2"></i>
                  Export Data
                </Button>
              </CardContent>
            </Card>

            {/* Export Preview */}
            <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Export Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <div className="flex justify-between">
                    <span>Cases:</span>
                    <span className="font-medium">{filteredCases.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span className="font-medium">{exportFormat.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium">
                      {exportOptions.find(o => o.id === exportType)?.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Notes:</span>
                    <span className="font-medium">{includeNotes ? "Yes" : "No"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Exports */}
        <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Exports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-file-export text-blue-600 dark:text-blue-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No recent exports
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your export history will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
