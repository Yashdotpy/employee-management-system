import { NavLink } from "react-router-dom";

function EmployeeSidebar() {
  const menus = [
    { title: "Dashboard", path: "/employee/dashboard" },
    { title: "My Profile", path: "/employee/profile" },
    { title: "Employees", path: "/employee/employees" },
    { title: "Attendance", path: "/my-attendance" },
    { title: "Leave Management", path: "/employee/leaves" },
  ];

  return <aside className="w-64 bg-slate-900 text-white"><div className="border-b border-slate-700 p-6"><h1 className="text-2xl font-bold">Employee Portal</h1></div><nav className="mt-6 space-y-2 px-4">{menus.map((menu) => <NavLink key={menu.path} to={menu.path} className={({ isActive }) => `block rounded-lg p-3 transition ${isActive ? "bg-blue-600" : "hover:bg-slate-800"}`}>{menu.title}</NavLink>)}</nav></aside>;
}

export default EmployeeSidebar;
