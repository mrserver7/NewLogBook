import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function UserManagement() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    specialty: "",
    institution: "",
    isActive: true,
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/admin/stats/users"],
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: any }) => {
      await apiRequest("PATCH", `/api/admin/users/${userId}`, userData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsEditModalOpen(false);
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats/users"] });
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
        description: "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/users/${userId}`, { isActive });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats/users"] });
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
        description: "Failed to update user status",
        variant: "destructive",
      });
    },
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
            You need administrator privileges to access user management.
          </p>
        </div>
      </MainLayout>
    );
  }

  const filteredUsers = users?.filter((user: any) => {
    if (searchQuery && !user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !user.email?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (roleFilter !== "all" && user.role !== roleFilter) {
      return false;
    }
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      if (user.isActive !== isActive) {
        return false;
      }
    }
    return true;
  }) || [];

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      role: user.role || "",
      specialty: user.specialty || "",
      institution: user.institution || "",
      isActive: user.isActive ?? true,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({
        userId: editingUser.id,
        userData: editFormData,
      });
    }
  };

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Cannot Modify Own Account",
        description: "You cannot deactivate your own account",
        variant: "destructive",
      });
      return;
    }

    const action = currentStatus ? "deactivate" : "activate";
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      toggleUserStatusMutation.mutate({
        userId,
        isActive: !currentStatus,
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      case "user":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
      : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  return (
    <MainLayout title="User Management" subtitle="Manage system users and permissions">
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-users text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {userStats?.totalUsers || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-user-check text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {userStats?.activeUsers || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-user-shield text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {userStats?.usersByRole?.find((r: any) => r.role === "admin")?.count || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Administrators</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-user-md text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {userStats?.usersByRole?.find((r: any) => r.role === "user")?.count || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Regular Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48 bg-light-elevated dark:bg-dark-elevated border-0">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                  <SelectItem value="user">Regular Users</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-light-elevated dark:bg-dark-elevated border-0">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-spinner fa-spin text-white text-xl"></i>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-users text-blue-600 dark:text-blue-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {searchQuery ? "No users found" : "No users yet"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery 
                    ? "Try adjusting your search or filters" 
                    : "Users will appear here as they register"
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-light-elevated dark:bg-dark-elevated">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">User</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Role</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Cases Done</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Last Login</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Joined</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user: any) => (
                      <tr key={user.id} className="hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {getInitials(user.firstName, user.lastName)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {user.casesCount || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(user.isActive)}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="p-2 hover:bg-light-elevated dark:hover:bg-dark-elevated rounded-lg"
                            >
                              <i className="fas fa-edit text-gray-400 hover:text-blue-600 text-sm"></i>
                            </Button>
                            
                            {user.casesCount > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/admin/user-cases/${user.id}`, '_blank')}
                                className="p-2 hover:bg-light-elevated dark:hover:bg-dark-elevated rounded-lg"
                                title="View User Cases"
                              >
                                <i className="fas fa-eye text-gray-400 hover:text-purple-600 text-sm"></i>
                              </Button>
                            )}
                            
                            {user.id !== currentUser?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                className="p-2 hover:bg-light-elevated dark:hover:bg-dark-elevated rounded-lg"
                              >
                                <i className={`fas ${user.isActive ? 'fa-ban text-red-600' : 'fa-check text-green-600'} text-sm`}></i>
                              </Button>
                            )}
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
      </div>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Edit User
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                  className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                  className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select 
                value={editFormData.role} 
                onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
              >
                <SelectTrigger className="bg-light-elevated dark:bg-dark-elevated border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={editFormData.specialty}
                onChange={(e) => setEditFormData({ ...editFormData, specialty: e.target.value })}
                className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                value={editFormData.institution}
                onChange={(e) => setEditFormData({ ...editFormData, institution: e.target.value })}
                className="bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={updateUserMutation.isPending}
                className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white"
              >
                {updateUserMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Update User
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
