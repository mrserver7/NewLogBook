import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnesthesiaSelector } from "@/components/ui/anesthesia-selector";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Calendar, Clock, User, Stethoscope, FileText, Edit3, Save, X } from "lucide-react";

interface CaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: number | null;
}

export default function CaseDetailModal({ isOpen, onClose, caseId }: CaseDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const { data: caseDetails, isLoading } = useQuery({
    queryKey: ["/api/cases", caseId],
    queryFn: async () => {
      const response = await fetch(`/api/cases/${caseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch case details');
      }
      return response.json();
    },
    enabled: !!caseId && isOpen,
  });

  const { data: procedures } = useQuery({
    queryKey: ["/api/procedures"],
    enabled: isOpen,
  });

  // Fetch patient data when we have a patientId
  const { data: patientData } = useQuery({
    queryKey: ["/api/patients", caseDetails?.patientId],
    queryFn: async () => {
      if (!caseDetails?.patientId) return null;
      const response = await fetch(`/api/patients/${caseDetails.patientId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!caseDetails?.patientId && isOpen,
  });

  // Fetch case photos
  const { data: casePhotos } = useQuery({
    queryKey: ["/api/cases", caseId, "photos"],
    queryFn: async () => {
      if (!caseId) return [];
      const response = await fetch(`/api/cases/${caseId}/photos`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!caseId && isOpen,
  });

  useEffect(() => {
    if (caseDetails) {
      setEditData({
        patientName: caseDetails.patientName || "",
        patientId: caseDetails.patientId || "",
        caseDuration: caseDetails.caseDuration || "",
        surgeonName: caseDetails.surgeonName || "",
        procedureId: caseDetails.procedureId?.toString() || "",
        anesthesiaType: caseDetails.anesthesiaType || "",
        regionalBlockType: caseDetails.regionalBlockType || "",
        customRegionalBlock: caseDetails.customRegionalBlock || "",
        customProcedureName: caseDetails.customProcedureName || "",
        asaScore: caseDetails.asaScore || "",
        caseDate: caseDetails.caseDate || "",
        startTime: caseDetails.startTime ? new Date(caseDetails.startTime).toTimeString().slice(0, 5) : "",
        endTime: caseDetails.endTime ? new Date(caseDetails.endTime).toTimeString().slice(0, 5) : "",
        inductionTime: caseDetails.inductionTime ? new Date(caseDetails.inductionTime).toTimeString().slice(0, 5) : "",
        incisionTime: caseDetails.incisionTime ? new Date(caseDetails.incisionTime).toTimeString().slice(0, 5) : "",
        emergenceTime: caseDetails.emergenceTime ? new Date(caseDetails.emergenceTime).toTimeString().slice(0, 5) : "",
        diagnosis: caseDetails.diagnosis || caseDetails.preOpDiagnosis || "",
        complications: caseDetails.complications || "",
        notes: caseDetails.notes || caseDetails.preOpNotes || "",
        weight: patientData?.weight || caseDetails.weight?.toString() || "",
        height: patientData?.height || caseDetails.height?.toString() || "",
        age: patientData?.age?.toString() || caseDetails.age?.toString() || "",
        emergencyCase: caseDetails.emergencyCase || false,
        inductionMedications: caseDetails.inductionMedications || "",
        maintenanceMedications: caseDetails.maintenanceMedications || "",
        postOpMedications: caseDetails.postOpMedications || "",
      });
    }
  }, [caseDetails, patientData]);

  const updateCaseMutation = useMutation({
    mutationFn: async (updateData: any) => {
      await apiRequest("PATCH", `/api/cases/${caseId}`, updateData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case updated successfully",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cases", caseId] });
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
        description: "Failed to update case",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    try {
      // Update case data
      const caseUpdateData = {
        ...editData,
        procedureId: editData.procedureId ? parseInt(editData.procedureId) : null,
        startTime: editData.startTime && editData.caseDate ? new Date(`${editData.caseDate}T${editData.startTime}`) : null,
        endTime: editData.endTime && editData.caseDate ? new Date(`${editData.caseDate}T${editData.endTime}`) : null,
        inductionTime: editData.inductionTime && editData.caseDate ? new Date(`${editData.caseDate}T${editData.inductionTime}`) : null,
        incisionTime: editData.incisionTime && editData.caseDate ? new Date(`${editData.caseDate}T${editData.incisionTime}`) : null,
        emergenceTime: editData.emergenceTime && editData.caseDate ? new Date(`${editData.caseDate}T${editData.emergenceTime}`) : null,
        // Remove patient-specific fields from case update
        weight: undefined,
        height: undefined,
        age: undefined,
        newPhoto: undefined,
      };

      // Update case
      await apiRequest("PATCH", `/api/cases/${caseId}`, caseUpdateData);

      // Update or create patient data if patientId exists and we have patient data changes
      if (caseDetails?.patientId && (editData.weight || editData.height || editData.age || editData.patientName)) {
        const patientUpdateData: any = {};
        
        if (editData.weight) patientUpdateData.weight = editData.weight;
        if (editData.height) patientUpdateData.height = editData.height;
        if (editData.age) patientUpdateData.age = parseInt(editData.age);
        
        if (Object.keys(patientUpdateData).length > 0) {
          try {
            if (patientData?.id) {
              // Update existing patient
              await apiRequest("PATCH", `/api/patients/${patientData.id}`, patientUpdateData);
            } else {
              // Create new patient record
              const newPatientData = {
                patientId: caseDetails.patientId,
                firstName: editData.patientName.split(' ')[0] || editData.patientName,
                lastName: editData.patientName.split(' ').slice(1).join(' ') || '',
                ...patientUpdateData,
              };
              await apiRequest("POST", "/api/patients", newPatientData);
            }
          } catch (error) {
            console.log("Patient operation failed:", error);
          }
        }
      }

      // Handle photo upload if a new photo was selected
      if (editData.newPhoto) {
        const formData = new FormData();
        formData.append('casePhoto', editData.newPhoto);
        
        await fetch(`/api/cases/${caseId}/photos`, {
          method: 'POST',
          body: formData,
        });
      }

      toast({
        title: "Success",
        description: "Case updated successfully",
      });
      
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cases", caseId] });
      queryClient.invalidateQueries({ queryKey: ["/api/cases", caseId, "photos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients", caseDetails?.patientId] });
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
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
        description: "Failed to update case",
        variant: "destructive",
      });
    }
  };

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

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
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

  if (!caseId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-light-surface dark:bg-dark-surface">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Case Details - {caseDetails?.caseNumber}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {caseDetails && (
                <Badge className={getStatusColor(caseDetails.status)}>
                  {caseDetails.status?.replace("_", " ") || "Unknown"}
                </Badge>
              )}
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="ml-2"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={updateCaseMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {updateCaseMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset edit data to original
                      if (caseDetails) {
                        setEditData({
                          patientName: caseDetails.patientName || "",
                          patientId: caseDetails.patientId || "",
                          caseDuration: caseDetails.caseDuration || "",
                          surgeonName: caseDetails.surgeonName || "",
                          procedureId: caseDetails.procedureId?.toString() || "",
                          anesthesiaType: caseDetails.anesthesiaType || "",
                          asaScore: caseDetails.asaScore || "",
                          caseDate: caseDetails.caseDate || "",
                          diagnosis: caseDetails.diagnosis || "",
                          complications: caseDetails.complications || "",
                          notes: caseDetails.notes || "",
                          emergencyCase: caseDetails.emergencyCase || false,
                          inductionMedications: caseDetails.inductionMedications || "",
                          maintenanceMedications: caseDetails.maintenanceMedications || "",
                          postOpMedications: caseDetails.postOpMedications || "",
                        });
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 dark:text-gray-400">Loading case details...</div>
          </div>
        ) : caseDetails ? (
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timing">Timing</TabsTrigger>
              <TabsTrigger value="clinical">Clinical</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Patient Name</Label>
                      {isEditing ? (
                        <Input
                          value={editData.patientName}
                          onChange={(e) => setEditData({ ...editData, patientName: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-gray-100">{caseDetails.patientName || "Not specified"}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Patient ID</Label>
                      {isEditing ? (
                        <Input
                          value={editData.patientId}
                          onChange={(e) => setEditData({ ...editData, patientId: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-gray-100">{caseDetails.patientId || "Not specified"}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg)</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.1"
                            value={editData.weight || ""}
                            onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                            className="mt-1"
                            placeholder="Enter weight"
                          />
                        ) : (
                          <p className="mt-1 text-gray-900 dark:text-gray-100">{patientData?.weight || "--"}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Height (cm)</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.1"
                            value={editData.height || ""}
                            onChange={(e) => setEditData({ ...editData, height: e.target.value })}
                            className="mt-1"
                            placeholder="Enter height"
                          />
                        ) : (
                          <p className="mt-1 text-gray-900 dark:text-gray-100">{patientData?.height || "--"}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Age</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editData.age || ""}
                          onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                          className="mt-1"
                          placeholder="Enter age"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-gray-100">{patientData?.age ? `${patientData.age} years` : "--"}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Case Photos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    📸 Case Photos
                  </h3>
                  
                  {/* Photo Upload in Edit Mode */}
                  {isEditing && (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Add New Photo
                      </Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setEditData({ ...editData, newPhoto: file });
                        }}
                        className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {editData.newPhoto && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          Selected: {editData.newPhoto.name}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Existing Photos */}
                  {casePhotos && casePhotos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {casePhotos.map((photo: any) => (
                        <div key={photo.id} className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                          <img 
                            src={`/api/uploads/${photo.fileName}`}
                            alt={photo.description || "Case photo"}
                            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-200"
                            onClick={() => window.open(`/api/uploads/${photo.fileName}`, '_blank')}
                          />
                          {photo.description && (
                            <div className="p-3 text-sm text-gray-600 dark:text-gray-400">
                              {photo.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show message when no photos exist */}
                  {(!casePhotos || casePhotos.length === 0) && !isEditing && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No photos uploaded for this case.</p>
                  )}
                </div>

                {/* Case Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Case Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Surgeon</Label>
                      {isEditing ? (
                        <Input
                          value={editData.surgeonName}
                          onChange={(e) => setEditData({ ...editData, surgeonName: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-gray-100">{caseDetails.surgeonName || "Not specified"}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Procedure</Label>
                      {isEditing ? (
                        <Select value={editData.procedureId} onValueChange={(value) => setEditData({ ...editData, procedureId: value })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select procedure..." />
                          </SelectTrigger>
                          <SelectContent>
                            {procedures && Array.isArray(procedures) ? procedures.map((procedure: any) => (
                              <SelectItem key={procedure.id} value={procedure.id.toString()}>
                                {procedure.name}
                              </SelectItem>
                            )) : null}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-1">
                          <p className="text-gray-900 dark:text-gray-100">
                            {caseDetails.procedure?.name || caseDetails.customProcedureName || "Not specified"}
                          </p>
                          {caseDetails.customProcedureName && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">Custom Procedure</p>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Anesthesia Type */}
                    {isEditing ? (
                      <div className="col-span-2">
                        <AnesthesiaSelector
                          anesthesiaType={editData.anesthesiaType}
                          regionalBlockType={editData.regionalBlockType}
                          customRegionalBlock={editData.customRegionalBlock}
                          onAnesthesiaTypeChange={(value) => setEditData({ ...editData, anesthesiaType: value, regionalBlockType: "", customRegionalBlock: "" })}
                          onRegionalBlockTypeChange={(value) => setEditData({ ...editData, regionalBlockType: value, customRegionalBlock: value === "Other" ? "" : "" })}
                          onCustomRegionalBlockChange={(value) => setEditData({ ...editData, customRegionalBlock: value })}
                          className="mt-2"
                        />
                      </div>
                    ) : (
                      <div className="col-span-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Anesthesia Details</Label>
                        <div className="mt-1 space-y-1">
                          <p className="text-gray-900 dark:text-gray-100">{caseDetails.anesthesiaType || "Not specified"}</p>
                          {caseDetails.regionalBlockType && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Regional Block: {caseDetails.regionalBlockType}
                            </p>
                          )}
                          {caseDetails.customRegionalBlock && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Custom Block: {caseDetails.customRegionalBlock}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">ASA Score</Label>
                        {isEditing ? (
                          <Select value={editData.asaScore} onValueChange={(value) => setEditData({ ...editData, asaScore: value })}>
                            <SelectTrigger className="mt-1">
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
                        ) : (
                          <p className="mt-1 text-gray-900 dark:text-gray-100">{caseDetails.asaScore || "Not specified"}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Case Date</Label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editData.caseDate}
                          onChange={(e) => setEditData({ ...editData, caseDate: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-gray-100">{new Date(caseDetails.caseDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timing" className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Case Duration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Case Duration</Label>
                  {isEditing ? (
                    <Input
                      value={editData.caseDuration || ""}
                      onChange={(e) => setEditData({ ...editData, caseDuration: e.target.value })}
                      placeholder="e.g., 2 hours 30 minutes"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 dark:text-gray-100">
                      {caseDetails.caseDuration || "Not recorded"}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clinical" className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Clinical Information
              </h3>
              
              <div className="space-y-6">
                {/* Diagnosis */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Diagnosis</h4>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Diagnosis</Label>
                    {isEditing ? (
                      <Textarea
                        value={editData.diagnosis}
                        onChange={(e) => setEditData({ ...editData, diagnosis: e.target.value })}
                        placeholder="Enter diagnosis information..."
                        className="mt-1"
                        rows={4}
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {caseDetails.diagnosis || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Medications */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Medications</h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Induction Medications</Label>
                      {isEditing ? (
                        <Textarea
                          value={editData.inductionMedications}
                          onChange={(e) => setEditData({ ...editData, inductionMedications: e.target.value })}
                          placeholder="Enter induction medications with doses (e.g., Propofol 2mg/kg, Fentanyl 2mcg/kg, Rocuronium 0.6mg/kg)"
                          className="mt-1"
                          rows={3}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                          {caseDetails.inductionMedications || "Not specified"}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Maintenance Medications</Label>
                      {isEditing ? (
                        <Textarea
                          value={editData.maintenanceMedications}
                          onChange={(e) => setEditData({ ...editData, maintenanceMedications: e.target.value })}
                          placeholder="Enter maintenance medications with doses (e.g., Sevoflurane 2%, Remifentanil 0.1-0.3mcg/kg/min)"
                          className="mt-1"
                          rows={3}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                          {caseDetails.maintenanceMedications || "Not specified"}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Post-Operative Medications</Label>
                      {isEditing ? (
                        <Textarea
                          value={editData.postOpMedications}
                          onChange={(e) => setEditData({ ...editData, postOpMedications: e.target.value })}
                          placeholder="Enter post-operative medications with doses (e.g., Morphine 0.1mg/kg, Ondansetron 4mg, Sugammadex 2mg/kg)"
                          className="mt-1"
                          rows={3}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                          {caseDetails.postOpMedications || "Not specified"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Complications */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Complications</h4>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Complications</Label>
                    {isEditing ? (
                      <Textarea
                        value={editData.complications}
                        onChange={(e) => setEditData({ ...editData, complications: e.target.value })}
                        placeholder="Enter any complications..."
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {caseDetails.complications || "None reported"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Case Notes
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</Label>
                  {isEditing ? (
                    <Textarea
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      placeholder="Enter case notes..."
                      className="mt-1"
                      rows={8}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {caseDetails.notes || "No notes added"}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500 dark:text-red-400">Failed to load case details</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}