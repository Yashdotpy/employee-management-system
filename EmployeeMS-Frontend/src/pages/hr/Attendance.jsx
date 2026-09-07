import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AdminLayout from "../../layouts/AdminLayout";

import { getEmployees } from "../../services/employeeService";

import {
  getAllAttendance,
  deleteAttendance,
} from "../../services/attendanceService";

import AttendanceTodaySummary from "../../components/attendance/AttendanceTodaySummary";
import EmployeeAttendanceSummary
  from "../../components/attendance/EmployeeAttendanceSummary";

function Attendance() {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  // =====================================================
  // LOAD ATTENDANCE
  // =====================================================

  async function loadAttendance() {
    try {
      setLoading(true);

      const data = await getAllAttendance();

      setAttendance(data);
    } catch (error) {
      console.error(
        "Failed to load attendance:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load attendance."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // LOAD EMPLOYEES
  // =====================================================

  async function loadEmployees() {
    try {
      const response = await getEmployees();

      setEmployees(response.data);
    } catch (error) {
      console.error(
        "Failed to load employees:",
        error
      );

      toast.error(
        "Failed to load employees."
      );
    }
  }

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadAttendance();
    loadEmployees();
  }, []);

  // =====================================================
  // GET EMPLOYEE NAME
  // =====================================================

  function getEmployeeName(employeeId) {
    const employee = employees.find(
      (item) =>
        item.employeeId === employeeId
    );

    return employee
      ? employee.fullName
      : `Employee #${employeeId}`;
  }

  const filteredAttendance = attendance.filter((record) => {
    const employeeName = getEmployeeName(record.employeeId);

    const matchesSearch =
      employeeName
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesDate =
      !dateFilter ||
      record.attendanceDate?.split("T")[0] === dateFilter;

    const matchesStatus =
      !statusFilter ||
      record.status === statusFilter;

    return (
      matchesSearch &&
      matchesDate &&
      matchesStatus
    );
  });

  const totalAttendance = filteredAttendance.length;

  const presentCount = filteredAttendance.filter(
    (record) => record.status === "Present"
  ).length;

  const absentCount = filteredAttendance.filter(
    (record) => record.status === "Absent"
  ).length;

  const halfDayCount = filteredAttendance.filter(
    (record) => record.status === "Half Day"
  ).length;

  const leaveCount = filteredAttendance.filter(
    (record) => record.status === "Leave"
  ).length;

  // =====================================================
  // DELETE ATTENDANCE
  // =====================================================

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this attendance record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAttendance(id);

      toast.success(
        "Attendance deleted successfully."
      );

      loadAttendance();
    } catch (error) {
      console.error(
        "Failed to delete attendance:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete attendance."
      );
    }
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(date) {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  // =====================================================
  // FORMAT TIME
  // =====================================================

  function formatTime(time) {
    if (!time) {
      return "-";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes)
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // =====================================================
  // STATUS STYLE
  // =====================================================

  function getStatusClass(status) {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-700";

      case "Absent":
        return "bg-red-100 text-red-700";

      case "Half Day":
        return "bg-yellow-100 text-yellow-700";

      case "Leave":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Attendance
            </h1>

            <p className="mt-2 text-slate-500">
              Manage employee attendance records.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/attendance/create")
            }
            className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Add Attendance
          </button>

        </div>

        {/* TODAY'S SUMMARY */}
        <AttendanceTodaySummary />

        <EmployeeAttendanceSummary />

        {/* FILTERS */}

        <div className="mb-6 rounded-xl bg-white p-5 shadow">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">

            {/* SEARCH */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Search Employee
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search employee..."
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Employee calendar
              </label>

              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.employeeId} value={employee.employeeId}>
                    {employee.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* DATE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Date
              </label>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) =>
                  setDateFilter(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* STATUS */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="Leave">Leave</option>
              </select>
            </div>

            {/* CLEAR */}

            <div className="flex items-end">

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDateFilter("");
                  setStatusFilter("");
                }}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear Filters
              </button>

            </div>

            <div className="flex items-end">
              <button
                type="button"
                disabled={!selectedEmployeeId}
                onClick={() => navigate(`/attendance/employee/${selectedEmployeeId}`)}
                className="w-full rounded-lg bg-sky-600 px-4 py-2.5 font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                View calendar
              </button>
            </div>

          </div>

        </div>

        {/* SUMMARY */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {/* TOTAL */}

          <div className="rounded-xl bg-white p-5 shadow">

            <p className="text-sm font-medium text-slate-500">
              Total
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-800">
              {totalAttendance}
            </p>

          </div>


          {/* PRESENT */}

          <div className="rounded-xl bg-white p-5 shadow">

            <p className="text-sm font-medium text-slate-500">
              Present
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {presentCount}
            </p>

          </div>


          {/* ABSENT */}

          <div className="rounded-xl bg-white p-5 shadow">

            <p className="text-sm font-medium text-slate-500">
              Absent
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {absentCount}
            </p>

          </div>


          {/* HALF DAY */}

          <div className="rounded-xl bg-white p-5 shadow">

            <p className="text-sm font-medium text-slate-500">
              Half Day
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {halfDayCount}
            </p>

          </div>


          {/* LEAVE */}

          <div className="rounded-xl bg-white p-5 shadow">

            <p className="text-sm font-medium text-slate-500">
              Leave
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {leaveCount}
            </p>

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-xl bg-white shadow">

          {loading ? (

            <div className="p-10 text-center text-slate-500">
              Loading attendance...
            </div>

          ) : filteredAttendance.length === 0 ? (

            <div className="p-10 text-center text-slate-500">
              No attendance records found.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Employee
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Date
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Check In
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Check Out
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Remarks
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredAttendance.map((record) => (

                    <tr
                      key={record.attendanceId}
                      className="hover:bg-slate-50"
                    >

                      {/* EMPLOYEE */}

                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {getEmployeeName(
                          record.employeeId
                        )}
                      </td>

                      {/* DATE */}

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatDate(
                          record.attendanceDate
                        )}
                      </td>

                      {/* CHECK IN */}

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatTime(
                          record.checkInTime
                        )}
                      </td>

                      {/* CHECK OUT */}

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatTime(
                          record.checkOutTime
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>

                      </td>

                      {/* REMARKS */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {record.remarks || "-"}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              navigate(
                                `/attendance/employee/${record.employeeId}`
                              )
                            }
                            className="rounded-lg px-3 py-2 text-sm font-medium text-sky-600 hover:bg-sky-50"
                          >
                            View calendar
                          </button>

                          {/* EDIT */}

                          <button
                            onClick={() =>
                              navigate(
                                `/attendance/edit/${record.attendanceId}`
                              )
                            }
                            className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                          >
                            Edit
                          </button>

                          {/* DELETE */}

                          <button
                            onClick={() =>
                              handleDelete(
                                record.attendanceId
                              )
                            }
                            className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </AdminLayout>
  );
}

export default Attendance;
