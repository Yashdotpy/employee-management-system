import EmployeeLayout from "../../layouts/EmployeeLayout";
import { useEffect, useState } from "react";
import { getMyProfile } from "../../services/employeeService";
import { useAuth } from "../../context/AuthContext";
import AttendanceClockCard from "../../components/attendance/AttendanceClockCard";

import {
  UserCircleIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

function EmployeeDashboard() {
  const { user } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Fetch logged-in employee profile
  // --------------------------------------------------

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyProfile();

        setEmployee(data);
      } catch (error) {
        console.error("Failed to load employee profile:", error);

        setError(
          error?.response?.data?.message ||
            "Unable to load employee information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // --------------------------------------------------
  // Greeting
  // --------------------------------------------------

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
        ? "Good Afternoon"
        : "Good Evening";

  // --------------------------------------------------
  // Loading State
  // --------------------------------------------------

  if (loading) {
    return (
      <EmployeeLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

            <p className="mt-4 text-sm text-gray-500">
              Loading employee information...
            </p>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  // --------------------------------------------------
  // Error State
  // --------------------------------------------------

  if (error) {
    return (
      <EmployeeLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-red-700">
              Unable to load profile
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  // --------------------------------------------------
  // Employee Information
  // --------------------------------------------------

  const fullName =
    employee?.fullName ||
    user?.name ||
    "Employee";

  const firstName =
    fullName.split(" ")[0];

  const email =
    employee?.email ||
    user?.email ||
    "No email available";

  const role =
    employee?.role ||
    user?.role ||
    "Employee";

  const department =
    employee?.department ||
    "Not available";

  const phone =
    employee?.phone ||
    "Not available";

  const employeeId =
    employee?.employeeId ||
    user?.id ||
    "N/A";

  // --------------------------------------------------
  // Render Dashboard
  // --------------------------------------------------

  return (
    <EmployeeLayout>
      <div className="space-y-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {greeting}, {firstName} 👋
          </h1>

          <p className="mt-2 text-gray-500">
            Welcome back to your Employee Portal.
          </p>
        </div>

        <AttendanceClockCard />

        {/* =================================================
            PROFILE SUMMARY
        ================================================= */}

        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">

          <div className="p-6 sm:p-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              {/* Avatar */}

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-bold text-blue-600 shadow-md">
                {fullName.charAt(0).toUpperCase()}
              </div>

              {/* Employee Information */}

              <div className="text-white">

                <h2 className="text-2xl font-bold">
                  {fullName}
                </h2>

                <p className="mt-1 text-blue-100">
                  {role}
                </p>

                <div className="mt-3 flex items-center gap-2 text-sm text-blue-100">
                  <EnvelopeIcon className="h-4 w-4" />

                  <span>
                    {email}
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            EMPLOYEE INFORMATION
        ================================================= */}

        <div>

          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Employee Information
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {/* Department */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div className="min-w-0">

                  <p className="text-sm font-medium text-gray-500">
                    Department
                  </p>

                  <p className="mt-2 truncate font-semibold text-gray-900">
                    {department}
                  </p>

                </div>

                <div className="ml-3 rounded-lg bg-blue-50 p-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                </div>

              </div>

            </div>

            {/* Role */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Role
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
                    {role}
                  </p>

                </div>

                <div className="ml-3 rounded-lg bg-purple-50 p-3">
                  <BriefcaseIcon className="h-6 w-6 text-purple-600" />
                </div>

              </div>

            </div>

            {/* Phone */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div className="min-w-0">

                  <p className="text-sm font-medium text-gray-500">
                    Phone
                  </p>

                  <p className="mt-2 truncate font-semibold text-gray-900">
                    {phone}
                  </p>

                </div>

                <div className="ml-3 rounded-lg bg-green-50 p-3">
                  <PhoneIcon className="h-6 w-6 text-green-600" />
                </div>

              </div>

            </div>

            {/* Employee ID */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    Employee ID
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
                    #{employeeId}
                  </p>

                </div>

                <div className="ml-3 rounded-lg bg-orange-50 p-3">
                  <UserCircleIcon className="h-6 w-6 text-orange-600" />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            CONTACT INFORMATION
        ================================================= */}

        <div>

          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Contact Information
          </h2>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {/* Email */}

              <div>

                <p className="text-sm text-gray-500">
                  Email Address
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {email}
                </p>

              </div>

              {/* Phone */}

              <div>

                <p className="text-sm text-gray-500">
                  Phone Number
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {phone}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            TODAY'S OVERVIEW
        ================================================= */}

        <div>

          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Today's Overview
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* Attendance */}

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="rounded-full bg-green-100 p-3">
                  <CalendarDaysIcon className="h-6 w-6 text-green-600" />
                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Attendance
                  </p>

                  <p className="mt-1 text-lg font-bold text-gray-900">
                    Not Available
                  </p>

                </div>

              </div>

            </div>

            {/* Work Status */}

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="rounded-full bg-blue-100 p-3">
                  <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Work Status
                  </p>

                  <p className="mt-1 text-lg font-bold text-gray-900">
                    Active
                  </p>

                </div>

              </div>

            </div>

            {/* Account */}

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="rounded-full bg-purple-100 p-3">
                  <UserCircleIcon className="h-6 w-6 text-purple-600" />
                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Account
                  </p>

                  <p className="mt-1 text-lg font-bold text-green-600">
                    Active
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </EmployeeLayout>
  );
}

export default EmployeeDashboard;
