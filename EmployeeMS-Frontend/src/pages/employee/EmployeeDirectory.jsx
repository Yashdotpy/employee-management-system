import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import EmployeeLayout from "../../layouts/EmployeeLayout";
import { getEmployeeDirectory } from "../../services/employeeService";

function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployees() {
      try { setEmployees(await getEmployeeDirectory()); }
      catch (error) { toast.error(error.response?.data?.message || "Unable to load employees."); }
      finally { setLoading(false); }
    }
    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const query = search.toLowerCase().trim();
    return [employee.fullName, employee.email, employee.department]
      .some((value) => value?.toLowerCase().includes(query));
  });

  return (
    <EmployeeLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8"><h1 className="text-3xl font-bold text-slate-800">Employees</h1><p className="mt-2 text-slate-500">Search and view your colleagues.</p></div>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email, or department..." className="mb-6 w-full max-w-lg rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
        <div className="overflow-hidden rounded-xl bg-white shadow">
          {loading ? <p className="p-10 text-center text-slate-500">Loading employees...</p> : filteredEmployees.length === 0 ? <p className="p-10 text-center text-slate-500">No employees found.</p> : (
            <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50"><tr><th className="px-6 py-4 text-sm font-semibold text-slate-600">Employee</th><th className="px-6 py-4 text-sm font-semibold text-slate-600">Department</th><th className="px-6 py-4 text-sm font-semibold text-slate-600">Email</th><th className="px-6 py-4 text-sm font-semibold text-slate-600">Phone</th></tr></thead><tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((employee) => <tr key={employee.employeeId} className="hover:bg-slate-50"><td className="px-6 py-4 font-medium text-slate-800">{employee.fullName}</td><td className="px-6 py-4 text-slate-600">{employee.department || "—"}</td><td className="px-6 py-4 text-slate-600">{employee.email}</td><td className="px-6 py-4 text-slate-600">{employee.phone || "—"}</td></tr>)}
            </tbody></table></div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}

export default EmployeeDirectory;
