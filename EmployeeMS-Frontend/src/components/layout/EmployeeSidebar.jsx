import { NavLink } from "react-router-dom";
import { Home, User, Users, KeyRound, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Attendance from "../../pages/hr/Attendance";

function EmployeeSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 text-white">

      <div className="border-b border-slate-700 p-6">

        <h1 className="text-2xl font-bold">
          Employee Portal
        </h1>

      </div>

      <nav className="mt-6 space-y-2 px-4">

        <NavLink
          to="/employee/dashboard"
          className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-800"
        >
          {/* <Home size={20} /> */}
          Dashboard
        </NavLink>

        <NavLink
          to="/employee/profile"
          className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-800"
        >
          {/* <User size={20} /> */}
          My Profile
        </NavLink>

        <NavLink
          to="/employee/employees"
          className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-800"
        >
          {/* <Users size={20} /> */}
          Employees
        </NavLink>

        <NavLink
          to="/employee/change-password"
          className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-800"
        >
          {/* <KeyRound size={20} /> */}
          Change Password
        </NavLink>

        <NavLink
          to="/my-attendance"
          className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-800"
        >
          {/* <User size={20} /> */}
          Attendance
        </NavLink>

        <button
          onClick={logout}
          className="mt-8 flex w-full items-center gap-3 rounded-lg p-3 text-red-400 hover:bg-slate-800"
        >
          <LogOut size={20} />
          Logout
        </button>

      </nav>

    </aside>
  );
}

export default EmployeeSidebar;