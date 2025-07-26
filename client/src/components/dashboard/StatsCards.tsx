import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/cases/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      icon: "fas fa-procedures",
      value: stats?.casesThisMonth || 0,
      label: "Cases This Month",
      change: "+12%",
      positive: true,
      gradient: "from-blue-600 to-teal-500",
    },
    {
      icon: "fas fa-clock",
      value: stats?.avgDuration ? `${stats.avgDuration.toFixed(1)}h` : "0h",
      label: "Avg. Case Duration",
      change: "-0.3h",
      positive: true,
      gradient: "from-teal-500 to-orange-500",
    },
    {
      icon: "fas fa-user-md",
      value: stats?.totalCases || 0,
      label: "Total Cases",
      change: "+8",
      positive: true,
      gradient: "from-orange-500 to-blue-600",
    },
    {
      icon: "fas fa-trophy",
      value: "98.2%",
      label: "Success Rate",
      change: "+0.5%",
      positive: true,
      gradient: "from-blue-600 to-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat, index) => (
        <Card
          key={index}
          className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center`}>
                <i className={`${stat.icon} text-white`}></i>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stat.value}
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">
              {stat.label}
            </h3>
            <div className="flex items-center">
              <span className={`text-sm font-medium ${stat.positive ? "text-green-500" : "text-red-500"}`}>
                {stat.change}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">
                vs last month
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
