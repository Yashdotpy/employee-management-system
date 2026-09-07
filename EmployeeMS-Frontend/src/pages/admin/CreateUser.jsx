import AdminLayout from "../../layouts/AdminLayout";

function UserManagement() {
  return (
    <AdminLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            User Management
          </h1>

          <p className="mt-2 text-slate-500">
            Manage system users and access permissions.
          </p>
        </div>

        <div className="rounded-xl bg-white p-10 shadow-sm">
          <div className="flex min-h-[300px] items-center justify-center">

            <div className="text-center">

              <h2 className="text-xl font-semibold text-slate-700">
                User Management
              </h2>

              <p className="mt-2 text-slate-500">
                User management features will be available here.
              </p>

            </div>

          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default UserManagement;