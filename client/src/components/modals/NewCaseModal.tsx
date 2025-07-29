import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProcedureSelector } from "@/components/ui/procedure-selector";
import { AnesthesiaSelector } from "@/components/ui/anesthesia-selector";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewCaseModal({ isOpen, onClose }: NewCaseModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    procedure: { procedureId: undefined, customProcedureName: undefined, category: undefined } as { procedureId?: number; customProcedureName?: string; category?: string },
    surgeonName: "",
    anesthesiaType: "",
    regionalBlockType: "",
    customRegionalBlock: "",
    asaScore: "",
    caseDate: new Date().toISOString().split('T')[0],
    diagnosis: "",
    notes: "",
    inductionMedications: "",
    maintenanceMedications: "",
    postOpMedications: "",
    casePhoto: null as File | null,
  });

  // Add debugging to see if component renders
  console.log("NewCaseModal rendered, photo in state:", !!formData.casePhoto);

  const createCaseMutation = useMutation({
    mutationFn: async (caseData: any) => {
      console.log("Mutation called with data:", caseData);
      console.log("Photo present:", !!caseData.casePhoto);
      
      // Try to get photo from file input as backup
      const photoFile = caseData.casePhoto || (fileInputRef.current?.files?.[0]);
      console.log("Final photo file:", photoFile);
      
      // If there's a photo, use FormData for multipart upload
      if (photoFile) {
        const formDataForUpload = new FormData();
        
        // Add all case data except the photo
        const { casePhoto, ...caseDataWithoutPhoto } = caseData;
        Object.keys(caseDataWithoutPhoto).forEach(key => {
          formDataForUpload.append(key, caseDataWithoutPhoto[key]);
        });
        
        // Add the photo file
        formDataForUpload.append('casePhoto', photoFile);
        
        // Use fetch directly for FormData upload
        const response = await fetch('/api/cases', {
          method: 'POST',
          body: formDataForUpload,
          // Don't set Content-Type header - let browser set it with boundary
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } else {
        // Remove casePhoto from data and use regular JSON request
        const { casePhoto, ...caseDataWithoutPhoto } = caseData;
        await apiRequest("POST", "/api/cases", caseDataWithoutPhoto);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case created successfully",
      });
      onClose();
      setFormData({
        patientName: "",
        patientId: "",
        procedure: { procedureId: undefined, customProcedureName: undefined, category: undefined } as { procedureId?: number; customProcedureName?: string; category?: string },
        surgeonName: "",
        anesthesiaType: "",
        regionalBlockType: "",
        customRegionalBlock: "",
        asaScore: "",
        caseDate: new Date().toISOString().split('T')[0],
        diagnosis: "",
        notes: "",
        inductionMedications: "",
        maintenanceMedications: "",
        postOpMedications: "",
        casePhoto: null,
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
    
    console.log("=== FORM SUBMIT HANDLER CALLED ===");
    console.log("Form data state:", formData);
    console.log("Photo in form data:", formData.casePhoto);
    
    if (!formData.anesthesiaType || !formData.caseDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const dataToSubmit = {
      ...formData,
      procedureId: formData.procedure.procedureId || null,
      customProcedureName: formData.procedure.customProcedureName || null,
      preOpNotes: formData.notes,
      status: "completed",
    };
    
    console.log("Data to submit:", dataToSubmit);
    console.log("Photo file in data:", dataToSubmit.casePhoto);
    
    createCaseMutation.mutate(dataToSubmit);
  };

  const handleClose = () => {
    if (!createCaseMutation.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            New Case Entry
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patientName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Patient Name
              </Label>
              <Input
                id="patientName"
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="patientId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Patient ID
              </Label>
              <Input
                id="patientId"
                type="text"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Procedure
            </Label>
            <ProcedureSelector
              value={formData.procedure}
              onChange={(value) => setFormData({ ...formData, procedure: value })}
              placeholder="Select or search for a procedure..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <Label htmlFor="asaScore" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ASA Score
              </Label>
              <Select value={formData.asaScore} onValueChange={(value) => setFormData({ ...formData, asaScore: value })}>
                <SelectTrigger className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select ASA..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASA I">ASA I</SelectItem>
                  <SelectItem value="ASA II">ASA II</SelectItem>
                  <SelectItem value="ASA III">ASA III</SelectItem>
                  <SelectItem value="ASA IV">ASA IV</SelectItem>
                  <SelectItem value="ASA V">ASA V</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnesthesiaSelector
              anesthesiaType={formData.anesthesiaType}
              regionalBlockType={formData.regionalBlockType}
              customRegionalBlock={formData.customRegionalBlock}
              onAnesthesiaTypeChange={(value) => setFormData({ ...formData, anesthesiaType: value, regionalBlockType: "", customRegionalBlock: "" })}
              onRegionalBlockTypeChange={(value) => {
                console.log("Regional block type changed to:", value);
                setFormData({ ...formData, regionalBlockType: value, customRegionalBlock: value === "Other" ? "" : "" });
              }}
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
          </div>



          {/* Diagnosis Field */}
          <div>
            <Label htmlFor="diagnosis" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Diagnosis
            </Label>
            <Textarea
              id="diagnosis"
              rows={3}
              value={formData.diagnosis || ""}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Enter diagnosis information..."
              className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Medications Section */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Medications</h4>
            
            <div>
              <Label htmlFor="inductionMedications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Induction Medications
              </Label>
              <Textarea
                id="inductionMedications"
                rows={3}
                value={formData.inductionMedications || ""}
                onChange={(e) => setFormData({ ...formData, inductionMedications: e.target.value })}
                placeholder="Enter induction medications with doses (e.g., Propofol 2mg/kg, Fentanyl 2mcg/kg, Rocuronium 0.6mg/kg)"
                className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="maintenanceMedications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Maintenance Medications
              </Label>
              <Textarea
                id="maintenanceMedications"
                rows={3}
                value={formData.maintenanceMedications || ""}
                onChange={(e) => setFormData({ ...formData, maintenanceMedications: e.target.value })}
                placeholder="Enter maintenance medications with doses (e.g., Sevoflurane 2%, Remifentanil 0.1-0.3mcg/kg/min)"
                className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="postOpMedications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Post-Operative Medications
              </Label>
              <Textarea
                id="postOpMedications"
                rows={3}
                value={formData.postOpMedications || ""}
                onChange={(e) => setFormData({ ...formData, postOpMedications: e.target.value })}
                placeholder="Enter post-operative medications with doses (e.g., Morphine 0.1mg/kg, Ondansetron 4mg, Sugammadex 2mg/kg)"
                className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </Label>
            <Textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <Label htmlFor="casePhoto" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Case Photo (Optional)
            </Label>
            <input
              ref={fileInputRef}
              id="casePhoto"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                console.log("Photo selected:", file);
                console.log("Setting form data with photo:", !!file);
                setFormData(prev => ({ ...prev, casePhoto: file }));
              }}
              className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500 w-full p-2 rounded-md"
            />
            {formData.casePhoto && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Selected: {formData.casePhoto.name}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createCaseMutation.isPending}
              className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCaseMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-medium shadow-lg hover:shadow-xl transition-all"
            >
              {createCaseMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Save Case
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
