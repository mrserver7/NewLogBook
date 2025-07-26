import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

export default function UserCases() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Check if current user is admin
  if (currentUser?.role !== "admin") {
    return (
      <MainLayout title="Access Denied" subtitle="You don't have permission to access this page">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-ban text-red-600 dark:text-red-400 text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Admin Access Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You need administrator privileges to view user cases.
          </p>
        </div>
      </MainLayout>
    );
  }

  const { data: userInfo } = useQuery({
    queryKey: [`/api/admin/users/${userId}`],
  });

  const { data: cases, isLoading } = useQuery({
    queryKey: [`/api/admin/user-cases/${userId}`],
  });

  const formatAnesthesiaType = (type: string) => {
    switch (type) {
      case "general": return "General";
      case "regional": return "Regional";
      case "local": return "Local";
      case "MAC": return "MAC";
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "ongoing":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  const filteredCases = cases?.filter((case_: any) => {
    if (statusFilter !== "all" && case_.status !== statusFilter) {
      return false;
    }
    return true;
  }).sort((a: any, b: any) => {
    if (sortBy === "newest") {
      return new Date(b.caseDate).getTime() - new Date(a.caseDate).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.caseDate).getTime() - new Date(b.caseDate).getTime();
    }
    return 0;
  }) || [];

  return (
    <MainLayout 
      title={`Cases by ${userInfo?.firstName} ${userInfo?.lastName}`} 
      subtitle="Admin case review and evaluation"
    >
      <div className="space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => window.close()}
              className="border-gray-300 dark:border-gray-600"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Admin
            </Button>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Case Review: {userInfo?.firstName} {userInfo?.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {userInfo?.email} • {filteredCases.length} cases
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-light-elevated dark:bg-dark-elevated border-0">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cases</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-light-elevated dark:bg-dark-elevated border-0">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Cases ({filteredCases.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-spinner fa-spin text-white text-xl"></i>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Loading cases...</p>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-procedures text-blue-600 dark:text-blue-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No cases found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This user hasn't created any cases matching your filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-light-elevated dark:bg-dark-elevated">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Case #</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Patient Name</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Procedure</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Anesthesia</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Date</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Duration</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCases.map((case_: any) => (
                      <tr key={case_.id} className="hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                            {case_.caseNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {case_.patientName || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {case_.procedure?.name || "Not specified"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline">
                            {formatAnesthesiaType(case_.anesthesiaType)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {new Date(case_.caseDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {case_.caseDuration || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(case_.status)}>
                            {case_.status?.charAt(0).toUpperCase() + case_.status?.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/admin/case-review/${case_.id}`, '_blank')}
                            className="p-2 hover:bg-light-elevated dark:hover:bg-dark-elevated rounded-lg"
                            title="Review Case Details"
                          >
                            <i className="fas fa-eye text-gray-400 hover:text-blue-600 text-sm"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}