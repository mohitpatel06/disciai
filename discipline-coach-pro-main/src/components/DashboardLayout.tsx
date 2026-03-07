// DashboardLayout.tsx - Layout wrapper for authenticated pages with sidebar
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;