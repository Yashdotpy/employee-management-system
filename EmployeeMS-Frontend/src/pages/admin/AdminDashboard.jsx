import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AdminLayout from "../../layouts/AdminLayout";
import { getEmployees } from "../../services/employeeService";

import {
  UsersIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  UserPlusIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

function AdminDashboard() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD EMPLOYEES
  // =====================================================

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);

      const response = await getEmployees();

      console.log(
        "Admin Dashboard employees:",
        response.data
      );

      setEmployees(response.data || []);
    } catch (error) {
      console.error(
        "Failed to load employees:",
        error
      );

      toast.error(
        "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalEmployees = employees.length;

  const totalAdmins = useMemo(
    () =>
      employees.filter(
        (employee) =>
          employee.role?.toLowerCase() === "admin"
      ).length,
    [employees]
  );

  const totalHR = useMemo(
    () =>
      employees.filter(
        (employee) =>
          employee.role?.toLowerCase() === "hr"
      ).length,
    [employees]
  );

  const totalDepartments = useMemo(
    () =>
      new Set(
        employees
          .map((employee) => employee.department)
          .filter(Boolean)
      ).size,
    [employees]
  );

  // =====================================================
  // DEPARTMENT STATISTICS
  // =====================================================

  const departmentStats = useMemo(() => {
    const departmentMap = {};

    employees.forEach((employee) => {
      const department =
        employee.department || "Not Assigned";

      departmentMap[department] =
        (departmentMap[department] || 0) + 1;
    });

    return Object.entries(departmentMap)
      .map(([department, count]) => ({
        department,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [employees]);

  // =====================================================
  // RECENT EMPLOYEES
  // =====================================================

  const recentEmployees = useMemo(() => {
    return [...employees]
      .sort((a, b) => {
        const dateA = new Date(
          a.createdAt || 0
        );

        const dateB = new Date(
          b.createdAt || 0
        );

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [employees]);

  // =====================================================
  // UI
  // =====================================================

  return (
    <AdminLayout>

      <div className="space-y-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Overview of your organization's employees
            and workforce.
          </p>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total Employees */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Employees
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? "—" : totalEmployees}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3">
                <UsersIcon className="h-7 w-7 text-blue-600" />
              </div>

            </div>

            <p className="mt-4 text-sm text-slate-500">
              Employees in the organization
            </p>

          </div>

          {/* Admins */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Administrators
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? "—" : totalAdmins}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-3">
                <ShieldCheckIcon className="h-7 w-7 text-purple-600" />
              </div>

            </div>

            <p className="mt-4 text-sm text-slate-500">
              Users with administrator access
            </p>

          </div>

          {/* HR */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  HR Members
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? "—" : totalHR}
                </p>
              </div>

              <div className="rounded-xl bg-green-50 p-3">
                <UserGroupIcon className="h-7 w-7 text-green-600" />
              </div>

            </div>

            <p className="mt-4 text-sm text-slate-500">
              Human resource team members
            </p>

          </div>

          {/* Departments */}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Departments
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? "—" : totalDepartments}
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 p-3">
                <BuildingOfficeIcon className="h-7 w-7 text-orange-600" />
              </div>

            </div>

            <p className="mt-4 text-sm text-slate-500">
              Active departments
            </p>

          </div>

        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* =================================================
              DEPARTMENT OVERVIEW
          ================================================= */}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Department Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Employee distribution by department.
                </p>
              </div>

            </div>

            <div className="p-6">

              {loading ? (
                <p className="text-sm text-slate-500">
                  Loading departments...
                </p>
              ) : departmentStats.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No department data available.
                </p>
              ) : (
                <div className="space-y-5">

                  {departmentStats.map(
                    ({
                      department,
                      count,
                    }) => {

                      const percentage =
                        totalEmployees > 0
                          ? Math.round(
                              (count /
                                totalEmployees) *
                                100
                            )
                          : 0;

                      return (
                        <div
                          key={department}
                        >

                          <div className="mb-2 flex items-center justify-between">

                            <span className="text-sm font-medium text-slate-700">
                              {department}
                            </span>

                            <span className="text-sm font-semibold text-slate-900">
                              {count}
                            </span>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-blue-600 transition-all"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            {percentage}% of workforce
                          </p>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

          </div>

          {/* =================================================
              RECENT EMPLOYEES
          ================================================= */}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Employees
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Recently added employees.
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/employees")
                }
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
                <ArrowRightIcon className="h-4 w-4" />
              </button>

            </div>

            <div className="divide-y divide-slate-100">

              {loading ? (

                <div className="p-6">
                  <p className="text-sm text-slate-500">
                    Loading employees...
                  </p>
                </div>

              ) : recentEmployees.length === 0 ? (

                <div className="p-6">
                  <p className="text-sm text-slate-500">
                    No employees found.
                  </p>
                </div>

              ) : (

                recentEmployees.map(
                  (employee) => (

                    <div
                      key={employee.employeeId}
                      className="flex items-center justify-between px-6 py-4"
                    >

                      <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
                          {employee.fullName
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "E"}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate font-medium text-slate-900">
                            {employee.fullName ||
                              "Unnamed Employee"}
                          </p>

                          <p className="truncate text-sm text-slate-500">
                            {employee.email ||
                              "No email"}
                          </p>

                        </div>

                      </div>

                      <div className="ml-4 text-right">

                        <p className="text-sm font-medium text-slate-700">
                          {employee.role ||
                            "Employee"}
                        </p>

                        <p className="text-xs text-slate-400">
                          {employee.department ||
                            "No department"}
                        </p>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </div>

        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div>

          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <button
              onClick={() =>
                navigate(
                  "/admin/employees/create"
                )
              }
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >

              <div className="flex items-center gap-4">

                <div className="rounded-lg bg-blue-50 p-3">
                  <UserPlusIcon className="h-6 w-6 text-blue-600" />
                </div>

                <div>

                  <p className="font-semibold text-slate-900">
                    Add Employee
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Create a new employee account.
                  </p>

                </div>

              </div>

              <ArrowRightIcon className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />

            </button>

            <button
              onClick={() =>
                navigate("/employees")
              }
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >

              <div className="flex items-center gap-4">

                <div className="rounded-lg bg-purple-50 p-3">
                  <UsersIcon className="h-6 w-6 text-purple-600" />
                </div>

                <div>

                  <p className="font-semibold text-slate-900">
                    Manage Employees
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    View and manage your workforce.
                  </p>

                </div>

              </div>

              <ArrowRightIcon className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />

            </button>

          </div>

        </div>

      </div>

    </AdminLayout>
  );
}

export default AdminDashboard;