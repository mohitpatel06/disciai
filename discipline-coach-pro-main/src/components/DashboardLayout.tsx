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
      <main className="flex-1 p-4 lg:p-8 lg:ml-64 min-h-screen bg-gray-50">
        {children}
      </main>

    </div>
  );
};

export default DashboardLayout;