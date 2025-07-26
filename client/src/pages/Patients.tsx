import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Patients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    patientId: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    weight: "",
    height: "",
    allergies: "",
    medicalHistory: "",
  });

  const { data: patients, isLoading } = useQuery({
    queryKey: ["/api/patients", { search: searchQuery || undefined }],
  });

  const createPatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      await apiRequest("POST", "/api/patients", patientData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Patient created successfully",
      });
      setIsNewPatientModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create patient",
        variant: "destructive",
      });
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/patients/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Patient updated successfully",
      });
      setEditingPatient(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update patient",
        variant: "destructive",
      });
    },
  });

  const deletePatientMutation = useMutation({
    mutationFn: async (patientId: number) => {
      await apiRequest("DELETE", `/api/patients/${patientId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      patientId: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      weight: "",
      height: "",
      allergies: "",
      medicalHistory: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Validation Error",
        description: "Please provide patient's first and last name",
        variant: "destructive",
      });
      return;
    }

    const patientData = {
      ...formData,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      bmi: calculateBMI(formData.weight, formData.height),
      dateOfBirth: formData.dateOfBirth || null,
    };

    if (editingPatient) {
      updatePatientMutation.mutate({ id: editingPatient.id, data: patientData });
    } else {
      createPatientMutation.mutate(patientData);
    }
  };

  const calculateBMI = (weight: string, height: string) => {
    if (!weight || !height) return null;
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // Convert cm to m
    return parseFloat((w / (h * h)).toFixed(1));
  };

  const handleEdit = (patient: any) => {
    setEditingPatient(patient);
    setFormData({
      patientId: patient.patientId || "",
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      dateOfBirth: patient.dateOfBirth || "",
      gender: patient.gender || "",
      weight: patient.weight?.toString() || "",
      height: patient.height?.toString() || "",
      allergies: patient.allergies || "",
      medicalHistory: patient.medicalHistory || "",
    });
    setIsNewPatientModalOpen(true);
  };

  const handleDelete = (patientId: number) => {
    if (confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
      deletePatientMutation.mutate(patientId);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "PT";
  };

  const getAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled via query parameter
  };

  const closeModal = () => {
    setIsNewPatientModalOpen(false);
    setEditingPatient(null);
    resetForm();
  };

  return (
    <MainLayout
      title="Patients"
      subtitle={`${patients?.length || 0} patients in database`}
      onNewCase={() => setIsNewPatientModalOpen(true)}
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Search patients by name or ID..."
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
              <Button
                type="button"
                onClick={() => setIsNewPatientModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white"
              >
                <i className="fas fa-plus mr-2"></i>
                New Patient
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Patients Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : patients && patients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient: any) => (
              <Card key={patient.id} className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {getInitials(patient.firstName, patient.lastName)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {patient.patientId || "N/A"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(patient)}
                        className="p-2 hover:bg-light-elevated dark:hover:bg-dark-elevated rounded-lg"
                      >
                        <i className="fas fa-edit text-gray-400 hover:text-blue-600 text-sm"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(patient.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                      >
                        <i className="fas fa-trash text-gray-400 hover:text-red-600 text-sm"></i>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Age:</span>
                      <span className="text-gray-900 dark:text-gray-100">{getAge(patient.dateOfBirth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                      <span className="text-gray-900 dark:text-gray-100">{patient.gender || "N/A"}</span>
                    </div>
                    {patient.weight && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                        <span className="text-gray-900 dark:text-gray-100">{patient.weight} kg</span>
                      </div>
                    )}
                    {patient.height && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Height:</span>
                        <span className="text-gray-900 dark:text-gray-100">{patient.height} cm</span>
                      </div>
                    )}
                    {patient.bmi && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">BMI:</span>
                        <span className="text-gray-900 dark:text-gray-100">{patient.bmi}</span>
                      </div>
                    )}
                    {patient.allergies && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-red-600 dark:text-red-400 text-xs font-medium">
                          <i className="fas fa-exclamation-triangle mr-1"></i>
                          Allergies: {patient.allergies}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-users text-blue-600 dark:text-blue-400 text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery ? "No patients found" : "No patients yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Start by adding your first patient"
              }
            </p>
            <Button 
              onClick={() => setIsNewPatientModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Patient
            </Button>
          </div>
        )}
      </div>

      {/* New/Edit Patient Modal */}
      <Dialog open={isNewPatientModalOpen} onOpenChange={closeModal}>
        <DialogContent className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {editingPatient ? "Edit Patient" : "New Patient"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  placeholder="PT-XXXX-XXX"
                  className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 bg-light-elevated dark:bg-dark-elevated border-0 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea
                id="medicalHistory"
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={createPatientMutation.isPending || updatePatientMutation.isPending}
                className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPatientMutation.isPending || updatePatientMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-medium shadow-lg hover:shadow-xl transition-all"
              >
                {createPatientMutation.isPending || updatePatientMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    {editingPatient ? "Update Patient" : "Save Patient"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
