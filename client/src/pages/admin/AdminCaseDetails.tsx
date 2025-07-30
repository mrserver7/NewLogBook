import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminCaseDetails() {
  const { caseId } = useParams();
  const { user: currentUser } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: [`/api/admin/cases/${caseId}`],
    enabled: currentUser?.role === "admin", // Only fetch if user is admin
  });

  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: [`/api/admin/cases/${caseId}/photos`],
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
            You need administrator privileges to view case details.
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

  if (caseLoading) {
    return (
      <MainLayout title="Loading Case Details" subtitle="Please wait...">
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-spinner fa-spin text-white text-xl"></i>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!caseData) {
    return (
      <MainLayout title="Case Not Found" subtitle="The requested case could not be found">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Case Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            The case you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Case ${caseData.caseNumber}`} subtitle="Complete case information for evaluation">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Case {caseData.caseNumber}
              </h2>
              <p className="text-blue-100">
                Complete case details and documentation
              </p>
            </div>
            <Badge className={`${getStatusColor(caseData.status)} text-sm px-3 py-1`}>
              {caseData.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm block">Patient</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {caseData.patientName || 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm block">Patient ID</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {caseData.patientId || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm block">Surgeon</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {caseData.surgeonName || 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm block">Case Date</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {new Date(caseData.caseDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm block">Duration</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {caseData.caseDuration || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm block">Emergency Case</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {caseData.emergencyCase ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anesthesia Information */}
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Anesthesia Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm block">Anesthesia Type</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {formatAnesthesiaType(caseData.anesthesiaType)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm block">ASA Score</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {caseData.asaScore || 'N/A'}
                  </span>
                </div>
                {caseData.regionalBlockType && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm block">Regional Block</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {caseData.regionalBlockType}
                    </span>
                  </div>
                )}
                {caseData.customRegionalBlock && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm block">Custom Block</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {caseData.customRegionalBlock}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Procedure Information */}
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Procedure Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-sm block">Procedure Category</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {caseData.procedureCategory || 'N/A'}
                </span>
              </div>
              {caseData.customProcedureName && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm block">Custom Procedure</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {caseData.customProcedureName}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clinical Notes */}
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Clinical Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {caseData.diagnosis && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm block">Diagnosis</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">
                    {caseData.diagnosis}
                  </p>
                </div>
              )}
              {caseData.complications && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm block">Complications</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">
                    {caseData.complications}
                  </p>
                </div>
              )}
              {caseData.notes && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm block">Additional Notes</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">
                    {caseData.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Medications */}
        {(caseData.inductionMedications || caseData.maintenanceMedications || caseData.postOpMedications) && (
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {caseData.inductionMedications && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm block">Induction</span>
                    <p className="text-gray-900 dark:text-gray-100 mt-1">
                      {caseData.inductionMedications}
                    </p>
                  </div>
                )}
                {caseData.maintenanceMedications && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm block">Maintenance</span>
                    <p className="text-gray-900 dark:text-gray-100 mt-1">
                      {caseData.maintenanceMedications}
                    </p>
                  </div>
                )}
                {caseData.postOpMedications && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm block">Post-Op</span>
                    <p className="text-gray-900 dark:text-gray-100 mt-1">
                      {caseData.postOpMedications}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Case Photos */}
        <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <i className="fas fa-camera text-blue-600"></i>
              Case Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {photosLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-spinner fa-spin text-white text-sm"></i>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Loading photos...</p>
              </div>
            ) : !photos || photos.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-camera text-gray-400 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Photos
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No photos have been uploaded for this case.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo: any) => (
                  <div key={photo.id} className="group cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                      <img
                        src={`/api/uploads/${photo.fileName}`}
                        alt={photo.originalName || 'Case photo'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          // If image fails to load, show placeholder
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center text-gray-400">
                              <i class="fas fa-image text-2xl"></i>
                            </div>
                          `;
                        }}
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {photo.originalName || 'Unnamed photo'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(photo.createdAt).toLocaleDateString()} • {(photo.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Modal */}
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {selectedPhoto?.originalName || 'Case Photo'}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {selectedPhoto && (
                <img
                  src={`/api/uploads/${selectedPhoto.fileName}`}
                  alt={selectedPhoto.originalName || 'Case photo'}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}