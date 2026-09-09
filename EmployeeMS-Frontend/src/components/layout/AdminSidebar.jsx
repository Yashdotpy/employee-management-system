import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminSidebar() {
  const { user } = useAuth();

  const menus = [
    { title: "Dashboard", path: "/dashboard" },
    { title: "Employees", path: "/employees" },
    { title: "Attendance", path: "/attendance" },
    { title: "Leave Management", path: "/leaves" },
  ];

  if (user?.role === "Admin") {
    menus.push({
      title: "User Management",
      path: "/admin/users",
    });
  }

  return (
    <aside className="w-64 bg-slate-900 text-white">
      <div className="border-b border-slate-700 p-6">
        <h1 className="text-xl font-bold">EmployeeMS</h1>
      </div>

      <nav className="mt-6">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) =>
              `mx-3 mb-2 block rounded-lg px-4 py-3 transition ${
                isActive ? "bg-blue-600" : "hover:bg-slate-800"
              }`
            }
          >
            {menu.title}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
