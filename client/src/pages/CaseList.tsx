import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import NewCaseModal from "@/components/modals/NewCaseModal";
import CaseDetailModal from "@/components/modals/CaseDetailModal";

export default function CaseList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [isCaseDetailModalOpen, setIsCaseDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 20;

  const { data: cases, isLoading } = useQuery({
    queryKey: ["/api/cases", { 
      limit: casesPerPage, 
      offset: (currentPage - 1) * casesPerPage,
      search: searchQuery || undefined 
    }],
  });

  const deleteCaseMutation = useMutation({
    mutationFn: async (caseId: number) => {
      await apiRequest("DELETE", `/api/cases/${caseId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
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
        title: "Error",
        description: "Failed to delete case",
        variant: "destructive",
      });
    },
  });

  const completeCaseMutation = useMutation({
    mutationFn: async (caseId: number) => {
      await apiRequest("PATCH", `/api/cases/${caseId}/complete`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
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
        title: "Error",
        description: "Failed to complete case",
        variant: "destructive",
      });
    },
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

  const filteredCases = Array.isArray(cases) ? cases.filter((caseItem: any) => {
    if (statusFilter !== "all" && caseItem.status !== statusFilter) {
      return false;
    }
    return true;
  }) : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled via query parameter
  };

  const handleDeleteCase = (caseId: number) => {
    if (confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
      deleteCaseMutation.mutate(caseId);
    }
  };

  const handleCompleteCase = (caseId: number) => {
    if (confirm("Are you sure you want to complete this case?")) {
      completeCaseMutation.mutate(caseId);
    }
  };

  const handleViewCase = (caseId: number) => {
    setSelectedCaseId(caseId);
    setIsCaseDetailModalOpen(true);
  };

  const handleCloseCaseDetail = () => {
    setIsCaseDetailModalOpen(false);
    setSelectedCaseId(null);
  };

  return (
    <MainLayout
      title="Case List"
      subtitle={`${filteredCases.length} cases found`}
      onNewCase={() => setIsNewCaseModalOpen(true)}
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search cases, patients, procedures..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <i className="fas fa-search text-gray-400"></i>
                  </Button>
                </div>
              </form>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-light-elevated dark:bg-dark-elevated border-0">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cases Table */}
        <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
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
                  {searchQuery ? "No cases found" : "No cases yet"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery 
                    ? "Try adjusting your search terms or filters" 
                    : "Start by creating your first case"
                  }
                </p>
                <Button 
                  onClick={() => setIsNewCaseModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white"
                >
                  <i className="fas fa-plus mr-2"></i>
                  New Case
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-light-elevated dark:bg-dark-elevated">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Case #</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Patient</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Procedure</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Date</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Duration</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCases.map((caseItem: any) => (
                      <tr 
                        key={caseItem.id} 
                        className="hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors cursor-pointer"
                        onClick={() => handleViewCase(caseItem.id)}
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                            {caseItem.caseNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
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
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {caseItem.procedure?.name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {caseItem.anesthesiaType}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {new Date(caseItem.caseDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {formatDuration(caseItem.startTime, caseItem.endTime)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(caseItem.status)}>
                            {caseItem.status?.replace("_", " ") || "Unknown"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center space-x-2">
                            {caseItem.status === "in_progress" && (
                              <Button
                                size="sm"
                                onClick={() => handleCompleteCase(caseItem.id)}
                                disabled={completeCaseMutation.isPending}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                              >
                                {completeCaseMutation.isPending ? "Completing..." : "Complete"}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCase(caseItem.id)}
                              disabled={deleteCaseMutation.isPending}
                              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900 text-xs px-3 py-1"
                            >
                              {deleteCaseMutation.isPending ? "Deleting..." : "Delete"}
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

        {/* Pagination */}
        {filteredCases.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * casesPerPage) + 1} to {Math.min(currentPage * casesPerPage, filteredCases.length)} of {filteredCases.length} cases
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left mr-2"></i>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={filteredCases.length < casesPerPage}
              >
                Next
                <i className="fas fa-chevron-right ml-2"></i>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Case Modal */}
      <NewCaseModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
      />

      {/* Case Detail Modal */}
      <CaseDetailModal
        isOpen={isCaseDetailModalOpen}
        onClose={handleCloseCaseDetail}
        caseId={selectedCaseId}
      />
    </MainLayout>
  );
}
