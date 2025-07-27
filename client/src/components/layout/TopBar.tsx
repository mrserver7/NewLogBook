import { useState } from "react";
import { useThemeContext } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sun, Moon, Bell, Plus, LogOut } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  onNewCase?: () => void;
}

export default function TopBar({ title, subtitle, onNewCase }: TopBarProps) {
  const { theme, toggleTheme } = useThemeContext();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="bg-light-surface dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          {subtitle && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span>{subtitle}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Quick Search */}
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-light-elevated dark:bg-dark-elevated border-0 focus:ring-2 focus:ring-blue-500 pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
          </form>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-light-elevated dark:bg-dark-elevated hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-yellow-500" />
            ) : (
              <Moon className="h-4 w-4 text-gray-600" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-xl bg-light-elevated dark:bg-dark-elevated hover:bg-gray-200 dark:hover:bg-gray-600 relative"
          >
            <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></span>
          </Button>

          {/* Quick Actions */}
          {onNewCase && (
            <Button
              onClick={onNewCase}
              className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          )}

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="p-2 rounded-xl bg-light-elevated dark:bg-dark-elevated hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
