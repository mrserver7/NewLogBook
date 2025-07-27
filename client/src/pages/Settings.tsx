import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useThemeContext } from "@/components/ThemeProvider";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

function UserStatusDiagnostics() {
  const { toast } = useToast();
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug/user-status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDiagnosticData(data);
      } else {
        toast({
          title: "Diagnostic Failed",
          description: `Failed to get user status: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Diagnostic Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Check your current authentication and admin status
        </p>
        <Button
          onClick={runDiagnostics}
          disabled={isLoading}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Running...
            </>
          ) : (
            <>
              <i className="fas fa-search mr-2"></i>
              Run Diagnostics
            </>
          )}
        </Button>
      </div>

      {diagnosticData && (
        <div className="bg-light-elevated dark:bg-dark-elevated rounded-lg p-4 space-y-3">
          <div>
            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Auth Claims</h5>
            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <div>ID: {diagnosticData.authClaims?.sub}</div>
              <div>Email: {diagnosticData.authClaims?.email}</div>
              <div>Name: {diagnosticData.authClaims?.name}</div>
            </div>
          </div>

          <div>
            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Database User</h5>
            {diagnosticData.dbError ? (
              <div className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 p-2 rounded">
                Database Error: {diagnosticData.dbError}
                <br />
                <span className="text-xs">This is expected in development. In production, ensure MongoDB is connected.</span>
              </div>
            ) : diagnosticData.userInDatabase ? (
              <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <div>DB ID: {diagnosticData.userInDatabase.id}</div>
                <div>Email: {diagnosticData.userInDatabase.email}</div>
                <div>Role: <span className={diagnosticData.userInDatabase.role === 'admin' ? 'text-green-600 font-bold' : 'text-yellow-600'}>{diagnosticData.userInDatabase.role}</span></div>
                <div>Active: {diagnosticData.userInDatabase.isActive ? 'Yes' : 'No'}</div>
              </div>
            ) : (
              <div className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-2 rounded">
                User not found in database - you may need to logout and login again
              </div>
            )}
          </div>

          <div>
            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Admin Status</h5>
            <div className={`text-sm p-2 rounded ${diagnosticData.isAdmin ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
              {diagnosticData.isAdmin ? '✅ Admin access granted' : '❌ No admin access'}
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last checked: {new Date(diagnosticData.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  const queryClient = useQueryClient();
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  
  const [templateFormData, setTemplateFormData] = useState({
    name: "",
    category: "",
    procedureType: "",
    anesthesiaType: "",
    defaultSettings: "",
  });

  const [userSettings, setUserSettings] = useState({
    specialty: user?.specialty || "",
    licenseNumber: user?.licenseNumber || "",
    institution: user?.institution || "",
    defaultAnesthesiaType: "",
    defaultInstitution: "",
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/case-templates"],
  });

  const { data: preferences } = useQuery({
    queryKey: ["/api/user-preferences"],
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      await apiRequest("PATCH", `/api/auth/user`, userData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferencesData: any) => {
      await apiRequest("PUT", "/api/user-preferences", preferencesData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Preferences updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-preferences"] });
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
        description: "Failed to update preferences",
        variant: "destructive",
      });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      await apiRequest("POST", "/api/case-templates", templateData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template created successfully",
      });
      setIsNewTemplateModalOpen(false);
      setEditingTemplate(null);
      resetTemplateForm();
      queryClient.invalidateQueries({ queryKey: ["/api/case-templates"] });
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
        description: "Failed to create template",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = () => {
    updateUserMutation.mutate({
      specialty: userSettings.specialty,
      licenseNumber: userSettings.licenseNumber,
      institution: userSettings.institution,
    });
  };

  const handlePreferencesUpdate = () => {
    updatePreferencesMutation.mutate({
      defaultAnesthesiaType: userSettings.defaultAnesthesiaType,
      defaultInstitution: userSettings.defaultInstitution,
      notificationSettings: {
        emailNotifications: userSettings.emailNotifications,
        pushNotifications: userSettings.pushNotifications,
        weeklyReports: userSettings.weeklyReports,
      },
    });
  };

  const resetTemplateForm = () => {
    setTemplateFormData({
      name: "",
      category: "",
      procedureType: "",
      anesthesiaType: "",
      defaultSettings: "",
    });
  };

  const handleTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!templateFormData.name) {
      toast({
        title: "Validation Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }

    const templateData = {
      ...templateFormData,
      defaultSettings: templateFormData.defaultSettings ? JSON.parse(templateFormData.defaultSettings) : {},
    };

    createTemplateMutation.mutate(templateData);
  };

  const closeTemplateModal = () => {
    setIsNewTemplateModalOpen(false);
    setEditingTemplate(null);
    resetTemplateForm();
  };

  const getTemplateIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "cardiac":
        return "fas fa-heart";
      case "neuro":
      case "neurosurgery":
        return "fas fa-brain";
      case "orthopedic":
        return "fas fa-bone";
      case "general":
        return "fas fa-file-medical";
      default:
        return "fas fa-file-medical";
    }
  };

  return (
    <MainLayout title="Settings" subtitle="Manage your preferences and account settings">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={user?.profileImageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=96&h=96"}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Role: {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={userSettings.specialty}
                  onChange={(e) => setUserSettings({ ...userSettings, specialty: e.target.value })}
                  className="bg-light-elevated dark:bg-dark-elevated border-0"
                  placeholder="e.g., Anesthesiology"
                />
              </div>

              <div>
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={userSettings.licenseNumber}
                  onChange={(e) => setUserSettings({ ...userSettings, licenseNumber: e.target.value })}
                  className="bg-light-elevated dark:bg-dark-elevated border-0"
                  placeholder="Medical license number"
                />
              </div>

              <div>
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={userSettings.institution}
                  onChange={(e) => setUserSettings({ ...userSettings, institution: e.target.value })}
                  className="bg-light-elevated dark:bg-dark-elevated border-0"
                  placeholder="Hospital or clinic name"
                />
              </div>

              <Button
                onClick={handleProfileUpdate}
                disabled={updateUserMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white"
              >
                {updateUserMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Update Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Application Preferences */}
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Application Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose your preferred color scheme
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-sun text-yellow-500"></i>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                  <i className="fas fa-moon text-blue-500"></i>
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="defaultAnesthesiaType">Default Anesthesia Type</Label>
                <Select 
                  value={userSettings.defaultAnesthesiaType} 
                  onValueChange={(value) => setUserSettings({ ...userSettings, defaultAnesthesiaType: value })}
                >
                  <SelectTrigger className="bg-light-elevated dark:bg-dark-elevated border-0">
                    <SelectValue placeholder="Select default type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General anesthesia">General anesthesia</SelectItem>
                    <SelectItem value="Spinal anesthesia">Spinal anesthesia</SelectItem>
                    <SelectItem value="Epidural anesthesia">Epidural anesthesia</SelectItem>
                    <SelectItem value="Regional blocks">Regional blocks</SelectItem>
                    <SelectItem value="Monitored anesthesia care (MAC)">Monitored anesthesia care (MAC)</SelectItem>
                    <SelectItem value="Sedation (conscious/deep)">Sedation (conscious/deep)</SelectItem>
                    <SelectItem value="Local anesthesia">Local anesthesia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="defaultInstitution">Default Institution</Label>
                <Input
                  id="defaultInstitution"
                  value={userSettings.defaultInstitution}
                  onChange={(e) => setUserSettings({ ...userSettings, defaultInstitution: e.target.value })}
                  className="bg-light-elevated dark:bg-dark-elevated border-0"
                  placeholder="Default hospital/clinic"
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Notifications</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={userSettings.emailNotifications}
                    onCheckedChange={(checked) => setUserSettings({ ...userSettings, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Browser notifications
                    </p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={userSettings.pushNotifications}
                    onCheckedChange={(checked) => setUserSettings({ ...userSettings, pushNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weeklyReports">Weekly Reports</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Weekly activity summaries
                    </p>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={userSettings.weeklyReports}
                    onCheckedChange={(checked) => setUserSettings({ ...userSettings, weeklyReports: checked })}
                  />
                </div>
              </div>

              <Button
                onClick={handlePreferencesUpdate}
                disabled={updatePreferencesMutation.isPending}
                className="w-full bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 text-white"
              >
                {updatePreferencesMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Save Preferences
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Case Templates */}
        <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Case Templates
              </CardTitle>
              <Button
                onClick={() => setIsNewTemplateModalOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white"
              >
                <i className="fas fa-plus mr-2"></i>
                New Template
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {templatesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4 bg-light-elevated dark:bg-dark-elevated rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : templates && templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template: any, index: number) => (
                  <div
                    key={template.id}
                    className="p-4 bg-light-elevated dark:bg-dark-elevated rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-gradient-to-br ${
                          index % 4 === 0 ? "from-blue-600 to-teal-500" :
                          index % 4 === 1 ? "from-teal-500 to-orange-500" :
                          index % 4 === 2 ? "from-orange-500 to-purple-500" :
                          "from-purple-500 to-pink-500"
                        } rounded-lg flex items-center justify-center`}>
                          <i className={`${getTemplateIcon(template.category)} text-white text-xs`}></i>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {template.name}
                          </span>
                          {template.category && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {template.category}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                        >
                          <i className="fas fa-edit text-gray-400 hover:text-blue-600 text-sm"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                        >
                          <i className="fas fa-trash text-gray-400 hover:text-red-600 text-sm"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-file-medical text-blue-600 dark:text-blue-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No templates yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first case template to speed up data entry
                </p>
                <Button
                  onClick={() => setIsNewTemplateModalOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Create Template
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Data & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900"
              >
                <i className="fas fa-download mr-2"></i>
                Export Data
              </Button>
              
              <Button
                variant="outline"
                className="border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900"
              >
                <i className="fas fa-shield-alt mr-2"></i>
                Privacy Settings
              </Button>
              
              <Button
                variant="outline"
                className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
              >
                <i className="fas fa-trash mr-2"></i>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Diagnostics - Only show for admin users or when debugging */}
        {(user?.role === 'admin' || process.env.NODE_ENV === 'development') && (
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                <i className="fas fa-tools mr-2 text-blue-600"></i>
                Admin Diagnostics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserStatusDiagnostics />
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Template Modal */}
      <Dialog open={isNewTemplateModalOpen} onOpenChange={closeTemplateModal}>
        <DialogContent className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {editingTemplate ? "Edit Template" : "New Template"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleTemplateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="templateName">Template Name *</Label>
              <Input
                id="templateName"
                value={templateFormData.name}
                onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., General Surgery Template"
                required
              />
            </div>

            <div>
              <Label htmlFor="templateCategory">Category</Label>
              <Input
                id="templateCategory"
                value={templateFormData.category}
                onChange={(e) => setTemplateFormData({ ...templateFormData, category: e.target.value })}
                className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Cardiac, General, Neuro"
              />
            </div>

            <div>
              <Label htmlFor="templateProcedureType">Procedure Type</Label>
              <Input
                id="templateProcedureType"
                value={templateFormData.procedureType}
                onChange={(e) => setTemplateFormData({ ...templateFormData, procedureType: e.target.value })}
                className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Laparoscopic Surgery"
              />
            </div>

            <div>
              <Label htmlFor="templateAnesthesiaType">Default Anesthesia Type</Label>
              <Select 
                value={templateFormData.anesthesiaType} 
                onValueChange={(value) => setTemplateFormData({ ...templateFormData, anesthesiaType: value })}
              >
                <SelectTrigger className="bg-light-elevated dark:bg-dark-elevated border-0">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General anesthesia">General anesthesia</SelectItem>
                  <SelectItem value="Spinal anesthesia">Spinal anesthesia</SelectItem>
                  <SelectItem value="Epidural anesthesia">Epidural anesthesia</SelectItem>
                  <SelectItem value="Regional blocks">Regional blocks</SelectItem>
                  <SelectItem value="Monitored anesthesia care (MAC)">Monitored anesthesia care (MAC)</SelectItem>
                  <SelectItem value="Sedation (conscious/deep)">Sedation (conscious/deep)</SelectItem>
                  <SelectItem value="Local anesthesia">Local anesthesia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="templateSettings">Default Settings (JSON)</Label>
              <Textarea
                id="templateSettings"
                value={templateFormData.defaultSettings}
                onChange={(e) => setTemplateFormData({ ...templateFormData, defaultSettings: e.target.value })}
                className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
                placeholder='{"monitoring": ["ECG", "SpO2"], "medications": []}'
                rows={3}
              />
            </div>
            
            <div className="flex items-center justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeTemplateModal}
                disabled={createTemplateMutation.isPending}
                className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTemplateMutation.isPending}
                className="bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white"
              >
                {createTemplateMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    {editingTemplate ? "Update Template" : "Create Template"}
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
