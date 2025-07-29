import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function RecentCases() {
  const { data: cases, isLoading } = useQuery({
    queryKey: ["/api/cases", { limit: 5 }],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "in_progress":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  const formatDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return "--";
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "PT";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Cases</h2>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-light-elevated dark:bg-dark-elevated rounded-xl">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Cases</h2>
          <Link href="/cases">
            <a className="text-blue-600 hover:text-teal-500 transition-colors text-sm font-medium">
              View All
            </a>
          </Link>
        </div>

        {!cases || cases.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-procedures text-blue-600 dark:text-blue-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No cases yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Start by creating your first case</p>
            <Link href="/new-case">
              <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white">
                <i className="fas fa-plus mr-2"></i>
                New Case
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Patient</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Procedure</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Duration</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {cases.map((caseItem: any) => (
                  <tr key={caseItem.id} className="hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {getInitials(caseItem.patient?.firstName, caseItem.patient?.lastName)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {caseItem.patient?.firstName} {caseItem.patient?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {caseItem.patient?.patientId || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {caseItem.procedure?.name || caseItem.customProcedureName || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {caseItem.surgeon?.firstName} {caseItem.surgeon?.lastName}
                      </p>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDuration(caseItem.startTime, caseItem.endTime)}
                      </span>
                    </td>
                    <td className="py-4">
                      <Badge className={getStatusColor(caseItem.status)}>
                        {caseItem.status?.replace("_", " ") || "Unknown"}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 hover:bg-light-elevated dark:hover:bg-dark-elevated rounded-lg"
                        >
                          <i className="fas fa-eye text-gray-400 hover:text-blue-600 text-sm"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 hover:bg-light-elevated dark:hover:bg-dark-elevated rounded-lg"
                        >
                          <i className="fas fa-edit text-gray-400 hover:text-teal-500 text-sm"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
