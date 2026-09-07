import { Bell, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="flex items-center justify-between border-b bg-white px-8 py-4 shadow-sm">

      <h2 className="text-xl font-semibold">
        Employee Dashboard
      </h2>

      <div className="flex items-center gap-6">

        <Bell className="cursor-pointer" />

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <p className="font-semibold">
              {user?.name}
            </p>

            <p className="text-sm text-gray-500">
              {user?.role}
            </p>
          </div>

        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>

      </div>

    </header>
  );
}

export default Navbar;