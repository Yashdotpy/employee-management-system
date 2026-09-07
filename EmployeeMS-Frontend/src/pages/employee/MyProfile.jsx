import EmployeeLayout from "../../layouts/EmployeeLayout";
import { useEffect, useState } from "react";
// import employeeService from "../../services/employeeService";
import { getMyProfile } from "../../services/employeeService";

import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";

function MyProfile() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const data = await getMyProfile();

        setEmployee(data);
      } catch (error) {
        console.error("Failed to load profile:", error);

        setError(
          error?.response?.data?.message ||
            "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <EmployeeLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-gray-500">
              Loading profile...
            </p>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  if (error) {
    return (
      <EmployeeLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-700">
            Unable to load profile
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="space-y-8">

        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Profile
          </h1>

          <p className="mt-2 text-gray-500">
            View your personal and employment information.
          </p>
        </div>

        {/* Profile Header */}

        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">

          <div className="p-6 sm:p-8">

            <div className="flex flex-col items-center gap-5 sm:flex-row">

              {/* Avatar */}

              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl font-bold text-blue-600 shadow-md">
                {employee?.fullName
                  ?.charAt(0)
                  ?.toUpperCase() || "E"}
              </div>

              {/* Basic Information */}

              <div className="text-center text-white sm:text-left">

                <h2 className="text-2xl font-bold">
                  {employee?.fullName}
                </h2>

                <p className="mt-1 text-blue-100">
                  {employee?.role}
                </p>

                <p className="mt-2 text-sm text-blue-100">
                  Employee ID: #{employee?.employeeId}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Personal Information */}

        <section>

          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Personal Information
          </h2>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

              {/* Full Name */}

              <ProfileField
                icon={UserCircleIcon}
                label="Full Name"
                value={employee?.fullName}
              />

              {/* Email */}

              <ProfileField
                icon={EnvelopeIcon}
                label="Email Address"
                value={employee?.email}
              />

              {/* Phone */}

              <ProfileField
                icon={PhoneIcon}
                label="Phone Number"
                value={employee?.phone}
              />

            </div>

          </div>

        </section>

        {/* Employment Information */}

        <section>

          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Employment Information
          </h2>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

              {/* Employee ID */}

              <ProfileField
                icon={IdentificationIcon}
                label="Employee ID"
                value={`#${employee?.employeeId}`}
              />

              {/* Department */}

              <ProfileField
                icon={BuildingOfficeIcon}
                label="Department"
                value={employee?.department}
              />

              {/* Role */}

              <ProfileField
                icon={BriefcaseIcon}
                label="Role"
                value={employee?.role}
              />

              {/* Joining Date */}

              <ProfileField
                icon={CalendarDaysIcon}
                label="Date of Joining"
                value={
                  employee?.dateOfJoining
                    ? new Date(
                        employee.dateOfJoining
                      ).toLocaleDateString()
                    : "Not available"
                }
              />

            </div>

          </div>

        </section>

        {/* Account Information */}

        <section>

          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Account Information
          </h2>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

              <ProfileField
                icon={UserCircleIcon}
                label="Account Role"
                value={employee?.role}
              />

              <div>

                <p className="text-sm font-medium text-gray-500">
                  Account Status
                </p>

                <div className="mt-2">

                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    Active
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>
    </EmployeeLayout>
  );
}

/* =====================================================
   Reusable Profile Field
===================================================== */

function ProfileField({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-4">

      <div className="rounded-lg bg-blue-50 p-3">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>

      <div className="min-w-0">

        <p className="text-sm font-medium text-gray-500">
          {label}
        </p>

        <p className="mt-1 break-words font-semibold text-gray-900">
          {value || "Not available"}
        </p>

      </div>

    </div>
  );
}

export default MyProfile;