import EmployeeSidebar from "../components/layout/EmployeeSidebar";
import Navbar from "../components/layout/Navbar";

function EmployeeLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-100">
      <EmployeeSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default EmployeeLayout;