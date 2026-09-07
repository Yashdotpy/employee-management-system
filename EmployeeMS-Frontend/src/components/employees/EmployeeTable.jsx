import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function EmployeeTable({ employees, loading, onDelete, }) {

  const { user } = useAuth();
  
  const navigate = useNavigate();
  if (loading)
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow">
        Loading employees...
      </div>
    );

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">

      <table className="min-w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="px-6 py-4 text-left">ID</th>

            <th className="px-6 py-4 text-left">Name</th>

            <th className="px-6 py-4 text-left">Email</th>

            <th className="px-6 py-4 text-left">Department</th>

            <th className="px-6 py-4 text-left">Salary</th>

            <th className="px-6 py-4 text-left">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {employees.map((employee) => (

            <tr
              key={employee.employeeId}
              className="border-t hover:bg-slate-50"
            >

              <td className="px-6 py-4">
                {employee.employeeId}
              </td>

              <td className="px-6 py-4 font-medium">
                {employee.firstName} {employee.lastName}
              </td>

              <td className="px-6 py-4">
                {employee.email}
              </td>

              <td className="px-6 py-4">
                {employee.department}
              </td>

              <td className="px-6 py-4">
                Rs.{employee.salary.toLocaleString()}
              </td>

              <td className="space-x-2 px-6 py-4">

                <button
                    onClick={() =>
                        navigate(`/admin/employees/edit/${employee.employeeId}`)
                    }
                    className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                >
                    Edit
                </button>

                {user?.role === "Admin" && (
                <button
                    onClick={() => onDelete(employee)}
                    className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                >
                    Delete
                </button>
                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default EmployeeTable;