import { Bell, ChevronDown, KeyRound, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const isEmployee = user?.role === "Employee";

  return <header className="flex items-center justify-between border-b bg-white px-8 py-4 shadow-sm"><h2 className="text-xl font-semibold">{isEmployee ? "Employee Dashboard" : "Employee Management"}</h2><div className="flex items-center gap-5"><Bell className="text-slate-600" /><div className="relative"><button type="button" onClick={() => setOpen((value) => !value)} className="flex items-center gap-3 rounded-lg px-2 py-1 text-left hover:bg-slate-50"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span><span className="hidden sm:block"><span className="block font-semibold text-slate-800">{user?.name}</span><span className="block text-sm text-gray-500">{user?.role}</span></span><ChevronDown className="h-4 w-4 text-slate-500" /></button>{open && <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">{isEmployee && <Link to="/employee/change-password" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"><KeyRound className="h-4 w-4" />Change Password</Link>}<button type="button" onClick={logout} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" />Logout</button></div>}</div></div></header>;
}

export default Navbar;
