import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-8 min-h-screen bg-background overflow-y-auto">
        {children}
      </main>

    </div>
  );
};

export default DashboardLayout;