import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function OngoingCases() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cases, isLoading } = useQuery({
    queryKey: ["/api/cases"],
  });

  const completeCase = useMutation({
    mutationFn: async (caseId: number) => {
      await apiRequest("PATCH", `/api/cases/${caseId}/complete`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cases/stats"] });
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

  // Filter only ongoing cases
  const ongoingCases = Array.isArray(cases) ? cases.filter((caseItem: any) => caseItem.status === "in_progress") : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTimeSinceStart = (startTime: string | null, caseDate: string) => {
    if (!startTime) return "Not started";
    
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Clock className="h-5 w-5" />
            Ongoing Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 dark:text-gray-400">Loading ongoing cases...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Clock className="h-5 w-5" />
          Ongoing Cases ({ongoingCases.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ongoingCases.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">No ongoing cases</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">All cases are completed</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {ongoingCases.map((caseItem: any) => (
              <div
                key={caseItem.id}
                className="flex items-center justify-between p-4 bg-light-elevated dark:bg-dark-elevated rounded-lg border border-gray-100 dark:border-gray-600"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {caseItem.caseNumber}
                    </span>
                    <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      In Progress
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <div>Patient: {caseItem.patientName || caseItem.patientId || "Unknown"}</div>
                    <div>Surgeon: {caseItem.surgeonName || "Not specified"}</div>
                    <div>Procedure: {caseItem.procedure?.name || "Not specified"}</div>
                    <div>Date: {formatDate(caseItem.caseDate)}</div>
                    {caseItem.startTime && (
                      <div>Duration: {getTimeSinceStart(caseItem.startTime, caseItem.caseDate)}</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => completeCase.mutate(caseItem.id)}
                    disabled={completeCase.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {completeCase.isPending ? "Completing..." : "Complete Case"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}