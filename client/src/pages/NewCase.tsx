import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ProcedureSelector } from "@/components/ui/procedure-selector";
import { AnesthesiaSelector } from "@/components/ui/anesthesia-selector";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function NewCase() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    // Patient Information
    patientName: "",
    patientId: "",
    age: "",
    weight: "",
    height: "",
    allergies: "",
    
    // Case Details
    caseNumber: "",
    caseDate: new Date().toISOString().split('T')[0],
    procedure: { procedureId: undefined, customProcedureName: undefined } as { procedureId?: number; customProcedureName?: string },
    surgeonName: "",
    anesthesiaType: "",
    regionalBlockType: "",
    customRegionalBlock: "",
    asaScore: "",
    emergencyCase: false,
    
    // Clinical Details
    caseDuration: "",
    diagnosis: "",
    inductionMedications: "",
    maintenanceMedications: "",
    postOpMedications: "",
    casePhoto: null as File | null,
    complications: "",
    notes: "",

  });

  const { data: procedures = [] } = useQuery<any[]>({
    queryKey: ["/api/procedures"],
  });

  const { data: templates = [] } = useQuery<any[]>({
    queryKey: ["/api/case-templates"],
  });

  const createCaseMutation = useMutation({
    mutationFn: async (caseData: any) => {
      // If there's a photo, use FormData for multipart upload
      if (caseData.casePhoto) {
        const formDataForUpload = new FormData();
        
        // Add all case data except the photo
        const { casePhoto, ...caseDataWithoutPhoto } = caseData;
        Object.keys(caseDataWithoutPhoto).forEach(key => {
          if (caseDataWithoutPhoto[key] !== null && caseDataWithoutPhoto[key] !== undefined) {
            formDataForUpload.append(key, caseDataWithoutPhoto[key]);
          }
        });
        
        // Add the photo file
        formDataForUpload.append('casePhoto', casePhoto);
        
        // Use fetch directly for FormData upload
        const response = await fetch('/api/cases', {
          method: 'POST',
          body: formDataForUpload,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          const errorMessage = errorData.details 
            ? `Validation error: ${errorData.details.map((d: any) => d.message).join(', ')}`
            : errorData.message || `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }
        
        return await response.json();
      } else {
        // Regular JSON request without photo
        const response = await apiRequest("POST", "/api/cases", caseData);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          const errorMessage = errorData.details 
            ? `Validation error: ${errorData.details.map((d: any) => d.message).join(', ')}`
            : errorData.message || `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cases/stats"] });
      setLocation("/cases");
    },
    onError: (error) => {
      console.error("Case creation error:", error);
      
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
      
      // Provide more specific error messages
      let errorMessage = "Failed to create case. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('Validation error')) {
          errorMessage = error.message;
        } else if (error.message.includes('anesthesiologistId')) {
          errorMessage = "Authentication issue. Please refresh and try again.";
        } else if (error.message.includes('anesthesiaType')) {
          errorMessage = "Please select an anesthesia type.";
        } else if (error.message.includes('caseDate')) {
          errorMessage = "Please provide a valid case date.";
        } else if (error.message.includes('procedureId') || error.message.includes('customProcedureName')) {
          errorMessage = "Please select a procedure or enter a custom procedure name.";
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.length > 10) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Case Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced client-side validation
    const validationErrors: string[] = [];
    
    if (!formData.anesthesiaType) {
      validationErrors.push("Anesthesia type is required");
    }
    
    if (!formData.caseDate) {
      validationErrors.push("Case date is required");
    }
    
    if (!formData.procedure.procedureId && !formData.procedure.customProcedureName) {
      validationErrors.push("Please select a procedure or enter a custom procedure name");
    }
    
    if (formData.procedure.procedureId && formData.procedure.customProcedureName) {
      validationErrors.push("Please select either a predefined procedure OR enter a custom name, not both");
    }
    
    if (formData.anesthesiaType === "Regional" && !formData.regionalBlockType && !formData.customRegionalBlock) {
      validationErrors.push("Regional block type is required when using regional anesthesia");
    }
    
    if (formData.regionalBlockType === "Other" && !formData.customRegionalBlock) {
      validationErrors.push("Please specify the custom regional block type");
    }
    
    // Validate numeric fields
    if (formData.weight && (isNaN(parseFloat(formData.weight)) || parseFloat(formData.weight) <= 0)) {
      validationErrors.push("Weight must be a positive number");
    }
    
    if (formData.height && (isNaN(parseFloat(formData.height)) || parseFloat(formData.height) <= 0)) {
      validationErrors.push("Height must be a positive number");
    }
    
    if (formData.age && (isNaN(parseInt(formData.age)) || parseInt(formData.age) <= 0 || parseInt(formData.age) > 150)) {
      validationErrors.push("Age must be a valid number between 1 and 150");
    }
    
    // Validate case date is not in the future (more than 1 day)
    const caseDate = new Date(formData.caseDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (caseDate > tomorrow) {
      validationErrors.push("Case date cannot be more than 1 day in the future");
    }
    
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors[0], // Show the first error
        variant: "destructive",
      });
      return;
    }

    const caseData = {
      ...formData,
      procedureId: formData.procedure.procedureId || null,
      customProcedureName: formData.procedure.customProcedureName || null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      age: formData.age ? parseInt(formData.age) : null,
      status: "completed",
    };

    createCaseMutation.mutate(caseData);
  };

  const generateCaseNumber = () => {
    const timestamp = Date.now();
    const caseNumber = `CC-${timestamp}`;
    setFormData({ ...formData, caseNumber });
  };

  return (
    <MainLayout title="New Case" subtitle="Create a comprehensive case entry">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/cases")}
              className="border-gray-300 dark:border-gray-600 w-full sm:w-auto"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Cases
            </Button>
            
            {templates.length > 0 && (
              <Select onValueChange={(templateId) => {
                // TODO: Apply template data to form
                console.log("Apply template:", templateId);
              }}>
                <SelectTrigger className="w-full sm:w-48 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Use template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template: any) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <Button
              type="submit"
              disabled={createCaseMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white disabled:opacity-50 w-full sm:w-auto"
            >
              <i className="fas fa-save mr-2"></i>
              Save Case
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Case Information */}
            <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Case Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="caseNumber">Case Number</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="caseNumber"
                        value={formData.caseNumber}
                        onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                        placeholder="CC-XXXXXX"
                        className="bg-light-elevated dark:bg-dark-elevated border-0"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateCaseNumber}
                        className="px-3"
                        title="Generate case number"
                      >
                        <i className="fas fa-refresh"></i>
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="caseDate">Case Date *</Label>
                    <Input
                      id="caseDate"
                      type="date"
                      value={formData.caseDate}
                      onChange={(e) => setFormData({ ...formData, caseDate: e.target.value })}
                      className="bg-light-elevated dark:bg-dark-elevated border-0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Procedure *</Label>
                  <ProcedureSelector
                    value={formData.procedure}
                    onChange={(value) => setFormData({ ...formData, procedure: value })}
                    placeholder="Select procedure..."
                  />
                </div>

                <div>
                  <Label htmlFor="surgeonName">Surgeon Name</Label>
                  <Input
                    id="surgeonName"
                    value={formData.surgeonName}
                    onChange={(e) => setFormData({ ...formData, surgeonName: e.target.value })}
                    placeholder="Enter surgeon name..."
                    className="bg-light-elevated dark:bg-dark-elevated border-0"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    <Label htmlFor="asaScore">ASA Score</Label>
                    <Select value={formData.asaScore} onValueChange={(value) => setFormData({ ...formData, asaScore: value })}>
                      <SelectTrigger className="bg-light-elevated dark:bg-dark-elevated border-0">
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
              </CardContent>
            </Card>

            {/* Patient Information */}
            <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientName">Patient Name</Label>
                    <Input
                      id="patientName"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      className="bg-light-elevated dark:bg-dark-elevated border-0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientId">Patient ID</Label>
                    <Input
                      id="patientId"
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                      placeholder="PT-XXXX-XXX"
                      className="bg-light-elevated dark:bg-dark-elevated border-0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="age">Age (years)</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    max="150"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g., 45"
                    className="bg-light-elevated dark:bg-dark-elevated border-0"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="bg-light-elevated dark:bg-dark-elevated border-0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      min="0"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="bg-light-elevated dark:bg-dark-elevated border-0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="bg-light-elevated dark:bg-dark-elevated border-0"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">


            {/* Clinical Notes */}
            <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Clinical Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="caseDuration">Case Duration</Label>
                  <Input
                    id="caseDuration"
                    value={formData.caseDuration || ""}
                    onChange={(e) => setFormData({ ...formData, caseDuration: e.target.value })}
                    placeholder="e.g., 2 hours 30 minutes"
                    className="bg-light-elevated dark:bg-dark-elevated border-0"
                  />
                </div>

                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    value={formData.diagnosis || ""}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="Enter diagnosis information..."
                    className="bg-light-elevated dark:bg-dark-elevated border-0"
                    rows={3}
                  />
                </div>

                {/* Medications Section */}
                <div>
                  <Label htmlFor="inductionMedications">Induction Medications</Label>
                  <Textarea
                    id="inductionMedications"
                    value={formData.inductionMedications || ""}
                    onChange={(e) => setFormData({ ...formData, inductionMedications: e.target.value })}
                    placeholder="Enter induction medications with doses (e.g., Propofol 2mg/kg, Fentanyl 2mcg/kg, Rocuronium 0.6mg/kg)"
                    className="bg-light-elevated dark:bg-dark-elevated border-0"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="maintenanceMedications">Maintenance Medications</Label>
                  <Textarea
                    id="maintenanceMedications"
                    value={formData.maintenanceMedications || ""}
                    onChange={(e) => setFormData({ ...formData, maintenanceMedications: e.target.value })}
                    placeholder="Enter maintenance medications with doses (e.g., Sevoflurane 2%, Remifentanil 0.1-0.3mcg/kg/min)"
                    className="bg-light-elevated dark:bg-dark-elevated border-0"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="postOpMedications">Post-Operative Medications</Label>
                  <Textarea
                    id="postOpMedications"
                    value={formData.postOpMedications || ""}
                    onChange={(e) => setFormData({ ...formData, postOpMedications: e.target.value })}
                    placeholder="Enter post-operative medications with doses (e.g., Morphine 0.1mg/kg, Ondansetron 4mg, Sugammadex 2mg/kg)"
                    className="bg-light-elevated dark:bg-dark-elevated border-0"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="casePhoto">Case Photo (Optional)</Label>
                  <Input
                    id="casePhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFormData({ ...formData, casePhoto: file });
                    }}
                    className="bg-light-elevated dark:bg-dark-elevated border-0"
                  />
                  {formData.casePhoto && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Selected: {formData.casePhoto.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Enter case notes..."
                    className="bg-light-elevated dark:bg-dark-elevated border-0"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="complications">Complications</Label>
                  <Textarea
                    id="complications"
                    value={formData.complications}
                    onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
                    className="bg-light-elevated dark:bg-dark-elevated border-0"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </form>
    </MainLayout>
  );
}
