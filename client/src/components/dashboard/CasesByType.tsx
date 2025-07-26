import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

export default function CasesByType() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/cases/stats"],
  });

  if (isLoading) {
    return (
      <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Cases by Type</h3>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                </div>
                <div className="w-full bg-light-elevated dark:bg-dark-elevated rounded-full h-2">
                  <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const casesByType = stats?.casesByType || [];
  const totalCases = casesByType.reduce((sum: number, item: any) => sum + item.count, 0);

  const getGradient = (index: number) => {
    const gradients = [
      "from-blue-600 to-teal-500",
      "from-teal-500 to-orange-500",
      "from-orange-500 to-blue-600",
      "from-purple-500 to-pink-500",
    ];
    return gradients[index % gradients.length];
  };

  const formatAnesthesiaType = (type: string) => {
    switch (type) {
      case "general":
        return "General Anesthesia";
      case "regional":
        return "Regional Anesthesia";
      case "local":
        return "Local Anesthesia";
      case "MAC":
        return "Monitored Anesthesia Care";
      // New anesthesia types
      case "General anesthesia": return "General anesthesia";
      case "Spinal anesthesia": return "Spinal anesthesia";
      case "Epidural anesthesia": return "Epidural anesthesia";
      case "Regional blocks": return "Regional blocks";
      case "Monitored anesthesia care (MAC)": return "Monitored anesthesia care (MAC)";
      case "Sedation (conscious/deep)": return "Sedation (conscious/deep)";
      case "Local anesthesia": return "Local anesthesia";
      default:
        return type;
    }
  };

  return (
    <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Cases by Type</h3>
        
        {casesByType.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-chart-pie text-blue-600 dark:text-blue-400 text-xl"></i>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">No case data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {casesByType.map((item: any, index: number) => {
              const percentage = totalCases > 0 ? (item.count / totalCases) * 100 : 0;
              return (
                <div key={item.anesthesiaType}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {formatAnesthesiaType(item.anesthesiaType)}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-light-elevated dark:bg-dark-elevated rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${getGradient(index)} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.count} case{item.count !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
