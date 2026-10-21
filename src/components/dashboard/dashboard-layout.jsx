import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardHeader from "./dashboard-header";
import DashboardSidebar from "./dashboard-sidebar";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile drawer on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Lock page scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-h-screen min-w-0 px-4 pb-8 pt-20 sm:px-6 sm:pt-24 lg:px-10 lg:pb-10 lg:pt-28">
          {children}
        </main>
      </div>
    </div>
  );
}
