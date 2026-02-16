import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import LeftSidebar from "../components/LeftSidebar.jsx";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body */}
      <div className="flex flex-1 gap-6 p-6">
        {/* Left Sidebar (Doctor Info now, Patient later) */}
        <LeftSidebar />

        {/* Right Content Area */}
        <main className="flex-1 bg-white rounded-xl shadow-md p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
