import AdminSidebar from "../components/layout/AdminSidebar";
import Navbar from "../components/layout/Navbar";

function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-100">
      <AdminSidebar />

      <div className="flex flex-1 flex-col">
        <Navbar />

        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;