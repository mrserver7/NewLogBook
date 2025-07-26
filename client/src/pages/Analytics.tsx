import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("thisMonth");

  const { data: stats } = useQuery({
    queryKey: ["/api/cases/stats"],
  });

  const { data: cases } = useQuery({
    queryKey: ["/api/cases", { limit: 100 }],
  });

  // Calculate analytics from case data
  const analyticsData = cases ? {
    totalCases: cases.length,
    completedCases: cases.filter((c: any) => c.status === "completed").length,
    avgDuration: cases.filter((c: any) => c.startTime && c.endTime).reduce((acc: number, c: any) => {
      const start = new Date(c.startTime);
      const end = new Date(c.endTime);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
      return acc + duration;
    }, 0) / cases.filter((c: any) => c.startTime && c.endTime).length,
    casesByMonth: cases.reduce((acc: any, c: any) => {
      const month = new Date(c.caseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {}),
    casesByType: cases.reduce((acc: any, c: any) => {
      acc[c.anesthesiaType] = (acc[c.anesthesiaType] || 0) + 1;
      return acc;
    }, {}),
    casesByDay: cases.reduce((acc: any, c: any) => {
      const day = new Date(c.caseDate).toLocaleDateString('en-US', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {}),
    procedureFrequency: cases.reduce((acc: any, c: any) => {
      const procedure = c.procedure?.name;
      // Only include procedures that have a valid name (filter out "Unknown")
      if (procedure && procedure !== "Unknown") {
        acc[procedure] = (acc[procedure] || 0) + 1;
      }
      return acc;
    }, {}),
  } : null;

  const formatAnesthesiaType = (type: string) => {
    switch (type) {
      case "general": return "General Anesthesia";
      case "regional": return "Regional Anesthesia";
      case "local": return "Local Anesthesia";
      case "MAC": return "Monitored Anesthesia Care";
      // New anesthesia types
      case "General anesthesia": return "General anesthesia";
      case "Spinal anesthesia": return "Spinal anesthesia";
      case "Epidural anesthesia": return "Epidural anesthesia";
      case "Regional blocks": return "Regional blocks";
      case "Monitored anesthesia care (MAC)": return "Monitored anesthesia care (MAC)";
      case "Sedation (conscious/deep)": return "Sedation (conscious/deep)";
      case "Local anesthesia": return "Local anesthesia";
      default: return type;
    }
  };

  const getGradient = (index: number) => {
    const gradients = [
      "from-blue-600 to-teal-500",
      "from-teal-500 to-orange-500",
      "from-orange-500 to-purple-500",
      "from-purple-500 to-pink-500",
      "from-pink-500 to-blue-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <MainLayout title="Analytics" subtitle="Insights into your practice">
      <div className="space-y-8">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Practice Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive analysis of your case data</p>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="thisQuarter">This Quarter</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="allTime">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-procedures text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {analyticsData?.totalCases || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Cases</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-clock text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {analyticsData?.avgDuration ? `${analyticsData.avgDuration.toFixed(1)}h` : "0h"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-check-circle text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {analyticsData?.completedCases || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cases by Type */}
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Cases by Anesthesia Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.casesByType ? (
                <div className="space-y-4">
                  {Object.entries(analyticsData.casesByType).map(([type, count], index) => {
                    const percentage = ((count as number) / analyticsData.totalCases) * 100;
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatAnesthesiaType(type)}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-light-elevated dark:bg-dark-elevated rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${getGradient(index)} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-chart-pie text-gray-400 text-3xl mb-4"></i>
                  <p className="text-gray-600 dark:text-gray-400">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cases by Day of Week */}
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Cases by Day of Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.casesByDay ? (
                <div className="space-y-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                    const count = analyticsData.casesByDay[day] || 0;
                    const maxCount = Math.max(...Object.values(analyticsData.casesByDay));
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={day}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {day}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {count} cases
                          </span>
                        </div>
                        <div className="w-full bg-light-elevated dark:bg-dark-elevated rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${getGradient(index)} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-calendar text-gray-400 text-3xl mb-4"></i>
                  <p className="text-gray-600 dark:text-gray-400">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Most Common Procedures */}
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Most Common Procedures
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.procedureFrequency ? (
                <div className="space-y-4">
                  {Object.entries(analyticsData.procedureFrequency)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 5)
                    .map(([procedure, count], index) => {
                      const maxCount = Math.max(...Object.values(analyticsData.procedureFrequency));
                      const percentage = (count as number / maxCount) * 100;
                      
                      return (
                        <div key={procedure}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {procedure}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {count}
                            </span>
                          </div>
                          <div className="w-full bg-light-elevated dark:bg-dark-elevated rounded-full h-2">
                            <div
                              className={`bg-gradient-to-r ${getGradient(index)} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-list text-gray-400 text-3xl mb-4"></i>
                  <p className="text-gray-600 dark:text-gray-400">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Monthly Case Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.casesByMonth ? (
                <div className="space-y-4">
                  {Object.entries(analyticsData.casesByMonth)
                    .sort(([a], [b]) => new Date(a + " 1").getTime() - new Date(b + " 1").getTime())
                    .slice(-6)
                    .map(([month, count], index) => {
                      const maxCount = Math.max(...Object.values(analyticsData.casesByMonth));
                      const percentage = (count as number / maxCount) * 100;
                      
                      return (
                        <div key={month}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {month}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {count} cases
                            </span>
                          </div>
                          <div className="w-full bg-light-elevated dark:bg-dark-elevated rounded-full h-2">
                            <div
                              className={`bg-gradient-to-r ${getGradient(index)} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-chart-line text-gray-400 text-3xl mb-4"></i>
                  <p className="text-gray-600 dark:text-gray-400">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
