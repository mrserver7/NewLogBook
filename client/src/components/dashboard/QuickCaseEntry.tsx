import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProcedureSelector } from "@/components/ui/procedure-selector";
import { AnesthesiaSelector } from "@/components/ui/anesthesia-selector";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function QuickCaseEntry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    patientId: "",
    procedure: { procedureId: undefined, customProcedureName: undefined, category: undefined } as { procedureId?: number; customProcedureName?: string; category?: string },
    surgeonName: "",
    anesthesiaType: "",
    regionalBlockType: "",
    customRegionalBlock: "",
    caseDate: new Date().toISOString().split('T')[0],
  });

  const { data: procedures } = useQuery({
    queryKey: ["/api/procedures", { limit: 20 }],
  });

  const { data: preferences } = useQuery({
    queryKey: ["/api/user-preferences"],
  });

  // Update form with default values when preferences load
  useEffect(() => {
    if (preferences?.defaultAnesthesiaType) {
      setFormData(prev => ({
        ...prev,
        anesthesiaType: preferences.defaultAnesthesiaType,
      }));
    }
  }, [preferences]);

  const createCaseMutation = useMutation({
    mutationFn: async (caseData: any) => {
      await apiRequest("POST", "/api/cases", caseData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case created successfully",
      });
      setFormData({
        patientId: "",
        procedure: { procedureId: undefined, customProcedureName: undefined, category: undefined } as { procedureId?: number; customProcedureName?: string; category?: string },
        surgeonName: "",
        anesthesiaType: preferences?.defaultAnesthesiaType || "",
        regionalBlockType: "",
        customRegionalBlock: "",
        caseDate: new Date().toISOString().split('T')[0],
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
        description: "Failed to create case. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.anesthesiaType || !formData.caseDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createCaseMutation.mutate({
      ...formData,
      procedureId: formData.procedure.procedureId || null,
      customProcedureName: formData.procedure.customProcedureName || null,
      status: "in_progress",
    });
  };

  return (
    <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Case Entry</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patientId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Patient ID
            </Label>
            <Input
              id="patientId"
              type="text"
              placeholder="PT-2024-XXX"
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <ProcedureSelector
              value={formData.procedure}
              onChange={(value) => setFormData({ ...formData, procedure: value })}
              placeholder="Select procedure..."
            />
          </div>
          
          <div>
            <Label htmlFor="surgeon" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Surgeon
            </Label>
            <Input
              id="surgeon"
              type="text"
              placeholder="Enter surgeon name..."
              value={formData.surgeonName}
              onChange={(e) => setFormData({ ...formData, surgeonName: e.target.value })}
              className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <AnesthesiaSelector
            anesthesiaType={formData.anesthesiaType}
            regionalBlockType={formData.regionalBlockType}
            customRegionalBlock={formData.customRegionalBlock}
            onAnesthesiaTypeChange={(value) => setFormData({ ...formData, anesthesiaType: value, regionalBlockType: "", customRegionalBlock: "" })}
            onRegionalBlockTypeChange={(value) => setFormData({ ...formData, regionalBlockType: value, customRegionalBlock: value === "Other" ? "" : "" })}
            onCustomRegionalBlockChange={(value) => setFormData({ ...formData, customRegionalBlock: value })}
            required={true}
          />

          <div>
            <Label htmlFor="caseDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Case Date *
            </Label>
            <Input
              id="caseDate"
              type="date"
              value={formData.caseDate}
              onChange={(e) => setFormData({ ...formData, caseDate: e.target.value })}
              className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <Button
            type="submit"
            disabled={createCaseMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-medium shadow-lg hover:shadow-xl transition-all"
          >
            {createCaseMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Creating...
              </>
            ) : (
              <>
                <i className="fas fa-plus mr-2"></i>
                Start Case
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
