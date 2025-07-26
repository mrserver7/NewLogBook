import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onNewCase?: () => void;
}

export default function MainLayout({ children, title, subtitle, onNewCase }: MainLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-light-bg dark:bg-dark-bg">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar title={title} subtitle={subtitle} onNewCase={onNewCase} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
