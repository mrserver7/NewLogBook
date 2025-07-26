import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function SystemAnalytics() {
  const { user: currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState("thisMonth");

  const { data: userStats } = useQuery({
    queryKey: ["/api/admin/stats/users"],
  });

  const { data: systemStats } = useQuery({
    queryKey: ["/api/admin/stats/system"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
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
            You need administrator privileges to access system analytics.
          </p>
        </div>
      </MainLayout>
    );
  }

  // Calculate additional analytics
  const activeUsersCount = users?.filter((user: any) => user.isActive).length || 0;
  const inactiveUsersCount = users?.filter((user: any) => !user.isActive).length || 0;
  const adminUsersCount = users?.filter((user: any) => user.role === "admin").length || 0;
  const recentRegistrations = users?.filter((user: any) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(user.createdAt) > oneWeekAgo;
  }).length || 0;

  const usersByMonth = users?.reduce((acc: any, user: any) => {
    const month = new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {}) || {};

  const usersBySpecialty = users?.reduce((acc: any, user: any) => {
    const specialty = user.specialty || "Not Specified";
    acc[specialty] = (acc[specialty] || 0) + 1;
    return acc;
  }, {}) || {};

  const usersByInstitution = users?.reduce((acc: any, user: any) => {
    const institution = user.institution || "Not Specified";
    acc[institution] = (acc[institution] || 0) + 1;
    return acc;
  }, {}) || {};

  const getGradient = (index: number) => {
    const gradients = [
      "from-blue-600 to-teal-500",
      "from-teal-500 to-orange-500",
      "from-orange-500 to-purple-500",
      "from-purple-500 to-pink-500",
      "from-pink-500 to-blue-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <MainLayout title="System Analytics" subtitle="Comprehensive system insights and monitoring">
      <div className="space-y-8">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Overview</h2>
            <p className="text-gray-600 dark:text-gray-400">Monitor system health and user activity</p>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="thisQuarter">This Quarter</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="allTime">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-database text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {systemStats?.totalCases || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Cases</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-users text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {systemStats?.totalPatients || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-user-md text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {systemStats?.totalSurgeons || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Surgeons</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-chart-line text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    99.5%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">System Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-user-check text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {activeUsersCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-user-times text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {inactiveUsersCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Inactive Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-user-shield text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {adminUsersCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Administrators</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-green-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-user-plus text-white"></i>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {recentRegistrations}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">New This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Registration Trends */}
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                User Registration Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(usersByMonth).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(usersByMonth)
                    .sort(([a], [b]) => new Date(a + " 1").getTime() - new Date(b + " 1").getTime())
                    .slice(-6)
                    .map(([month, count], index) => {
                      const maxCount = Math.max(...Object.values(usersByMonth));
                      const percentage = (count as number / maxCount) * 100;
                      
                      return (
                        <div key={month}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {month}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {count} users
                            </span>
                          </div>
                          <div className="w-full bg-light-elevated dark:bg-dark-elevated rounded-full h-2">
                            <div
                              className={`bg-gradient-to-r ${getGradient(index)} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-chart-line text-gray-400 text-3xl mb-4"></i>
                  <p className="text-gray-600 dark:text-gray-400">No registration data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users by Specialty */}
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Users by Specialty
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(usersBySpecialty).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(usersBySpecialty)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 6)
                    .map(([specialty, count], index) => {
                      const maxCount = Math.max(...Object.values(usersBySpecialty));
                      const percentage = (count as number / maxCount) * 100;
                      
                      return (
                        <div key={specialty}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {specialty}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {count}
                            </span>
                          </div>
                          <div className="w-full bg-light-elevated dark:bg-dark-elevated rounded-full h-2">
                            <div
                              className={`bg-gradient-to-r ${getGradient(index)} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-user-md text-gray-400 text-3xl mb-4"></i>
                  <p className="text-gray-600 dark:text-gray-400">No specialty data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users by Institution */}
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Users by Institution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(usersByInstitution).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(usersByInstitution)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .slice(0, 6)
                    .map(([institution, count], index) => {
                      const maxCount = Math.max(...Object.values(usersByInstitution));
                      const percentage = (count as number / maxCount) * 100;
                      
                      return (
                        <div key={institution}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {institution}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {count}
                            </span>
                          </div>
                          <div className="w-full bg-light-elevated dark:bg-dark-elevated rounded-full h-2">
                            <div
                              className={`bg-gradient-to-r ${getGradient(index)} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-hospital text-gray-400 text-3xl mb-4"></i>
                  <p className="text-gray-600 dark:text-gray-400">No institution data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900 dark:text-gray-100">Database</span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Healthy</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900 dark:text-gray-100">API Services</span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Operational</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900 dark:text-gray-100">Authentication</span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Active</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-900 dark:text-gray-100">File Storage</span>
                  </div>
                  <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">80% Capacity</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900 dark:text-gray-100">Backup System</span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Last: 2 hours ago</span>
                </div>

                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-check-circle text-green-600 dark:text-green-400"></i>
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      All systems operational
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
