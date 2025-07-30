import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

export default function AllCases() {
  const { user: currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data: cases, isLoading } = useQuery({
    queryKey: ["/api/admin/cases"],
    enabled: currentUser?.role === "admin", // Only fetch if user is admin
  });

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
            You need administrator privileges to view all cases.
          </p>
        </div>
      </MainLayout>
    );
  }

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
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "ongoing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Filter and sort cases
  const filteredCases = cases ? cases.filter((caseItem: any) => {
    if (statusFilter === "all") return true;
    return caseItem.status === statusFilter;
  }).sort((a: any, b: any) => {
    if (sortBy === "newest") {
      return new Date(b.caseDate).getTime() - new Date(a.caseDate).getTime();
    } else {
      return new Date(a.caseDate).getTime() - new Date(b.caseDate).getTime();
    }
  }) : [];

  return (
    <MainLayout title="All Cases" subtitle="Admin view of all cases for evaluation">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                All Cases Review
              </h2>
              <p className="text-blue-100">
                Comprehensive view of all cases for evaluation • {filteredCases.length} cases
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
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-folder-open text-gray-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Cases Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No cases match the current filter criteria.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCases.map((caseItem: any) => (
                  <div key={caseItem.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {caseItem.caseNumber}
                          </h3>
                          <Badge className={getStatusColor(caseItem.status)}>
                            {caseItem.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Patient:</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                              {caseItem.patientName || 'Unknown'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Surgeon:</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                              {caseItem.surgeonName || 'Unknown'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Date:</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                              {new Date(caseItem.caseDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Anesthesia:</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                              {formatAnesthesiaType(caseItem.anesthesiaType)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                              {caseItem.caseDuration || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">ASA Score:</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                              {caseItem.asaScore || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Anesthesiologist:</span>
                            <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">
                              {caseItem.userEmail || 'Unknown'}
                            </span>
                          </div>
                        </div>
                        {(caseItem.diagnosis || caseItem.complications) && (
                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            {caseItem.diagnosis && (
                              <div className="mb-2">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Diagnosis:</span>
                                <p className="text-gray-900 dark:text-gray-100 text-sm mt-1">
                                  {caseItem.diagnosis}
                                </p>
                              </div>
                            )}
                            {caseItem.complications && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Complications:</span>
                                <p className="text-gray-900 dark:text-gray-100 text-sm mt-1">
                                  {caseItem.complications}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link href={`/admin/case-details/${caseItem.id}`}>
                          <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20">
                            <i className="fas fa-eye mr-2"></i>
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}