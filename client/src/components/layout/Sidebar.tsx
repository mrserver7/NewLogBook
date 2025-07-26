import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const navigationItems = [
    { path: "/", icon: "fas fa-tachometer-alt", label: "Dashboard" },
    { path: "/new-case", icon: "fas fa-plus-circle", label: "New Case" },
    { path: "/cases", icon: "fas fa-list", label: "Case List" },
    { path: "/patients", icon: "fas fa-users", label: "Patients" },
    { path: "/analytics", icon: "fas fa-chart-line", label: "Analytics" },
    { path: "/export", icon: "fas fa-file-export", label: "Export" },
    { path: "/settings", icon: "fas fa-cog", label: "Settings" },
  ];

  const adminItems = [
    { path: "/admin/users", icon: "fas fa-users-cog", label: "User Management" },
    { path: "/admin/analytics", icon: "fas fa-chart-pie", label: "System Analytics" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location === path;
    }
    return location.startsWith(path);
  };

  return (
    <div className={cn("w-64 bg-light-surface dark:bg-dark-surface border-r border-gray-200 dark:border-gray-700 flex flex-col", className)}>
      {/* Logo & Brand */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img 
              src="/assets/logo.png" 
              alt="CaseCurator Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            CaseCurator
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors",
                isActive(item.path)
                  ? "bg-gradient-to-r from-blue-600 to-teal-500 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-light-elevated dark:hover:bg-dark-elevated"
              )}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </a>
          </Link>
        ))}

        {/* Admin Section */}
        {user?.role === "admin" && (
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Admin
            </h4>
            {adminItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors",
                    isActive(item.path)
                      ? "bg-gradient-to-r from-blue-600 to-teal-500 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-light-elevated dark:hover:bg-dark-elevated"
                  )}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </a>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <img
            src={user?.profileImageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64"}
            alt={`${user?.firstName} ${user?.lastName}`}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.specialty || "Anesthesiologist"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
