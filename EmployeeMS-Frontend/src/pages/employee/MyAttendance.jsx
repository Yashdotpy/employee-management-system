import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AttendanceCalendar from "../../components/attendance/AttendanceCalendar";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { getMyAttendance } from "../../services/attendanceService";
import { getHolidays } from "../../services/holidayService";

function MyAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    async function loadAttendance() {
      try {
        const [data, holidayData] = await Promise.all([
          getMyAttendance(),
          getHolidays(),
        ]);
        setAttendance(data);
        setHolidays(holidayData);
      } catch (error) {
        console.error("Failed to load attendance:", error);
        toast.error(error.response?.data?.message || "Failed to load attendance.");
      } finally {
        setLoading(false);
      }
    }

    loadAttendance();
  }, []);

  return (
    <EmployeeLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Attendance</h1>
          <p className="mt-2 text-slate-500">Select a day in the calendar to view its attendance details.</p>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center text-slate-500 shadow">Loading attendance...</div>
        ) : (
          <AttendanceCalendar records={attendance} holidays={holidays} />
        )}
      </div>
    </EmployeeLayout>
  );
}

export default MyAttendance;
