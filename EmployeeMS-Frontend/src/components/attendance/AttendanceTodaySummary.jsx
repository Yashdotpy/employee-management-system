import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  getTodayAttendanceReport,
} from "../../services/attendanceService";

function AttendanceTodaySummary() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadReport() {
    try {
      setLoading(true);

      const response =
        await getTodayAttendanceReport();

      setReport(response.data);
    } catch (error) {
      console.error(
        "Failed to load attendance report:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load attendance report."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="mb-6 rounded-xl bg-white p-6 text-center text-slate-500 shadow">
        Loading attendance summary...
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const attendanceRate =
    report.totalEmployees > 0
      ? (
          (report.present /
            report.totalEmployees) *
          100
        ).toFixed(1)
      : 0;

  return (
    <div className="mb-6">

      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-800">
          Today's Attendance
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Attendance overview for today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

        {/* TOTAL */}

        <div className="rounded-xl bg-white p-5 shadow">

          <p className="text-sm font-medium text-slate-500">
            Total Employees
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-800">
            {report.totalEmployees}
          </p>

        </div>

        {/* PRESENT */}

        <div className="rounded-xl bg-white p-5 shadow">

          <p className="text-sm font-medium text-slate-500">
            Present
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {report.present}
          </p>

        </div>

        {/* ABSENT */}

        <div className="rounded-xl bg-white p-5 shadow">

          <p className="text-sm font-medium text-slate-500">
            Absent
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {report.absent}
          </p>

        </div>

        {/* HALF DAY */}

        <div className="rounded-xl bg-white p-5 shadow">

          <p className="text-sm font-medium text-slate-500">
            Half Day
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {report.halfDay}
          </p>

        </div>

        {/* LEAVE */}

        <div className="rounded-xl bg-white p-5 shadow">

          <p className="text-sm font-medium text-slate-500">
            Leave
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {report.leave}
          </p>

        </div>

      </div>

      {/* ATTENDANCE RATE */}

      <div className="mt-4 rounded-xl bg-white p-5 shadow">

        <div className="mb-2 flex items-center justify-between">

          <span className="text-sm font-medium text-slate-600">
            Today's Attendance Rate
          </span>

          <span className="font-bold text-slate-800">
            {attendanceRate}%
          </span>

        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{
              width: `${attendanceRate}%`,
            }}
          />

        </div>

      </div>

    </div>
  );
}

export default AttendanceTodaySummary;