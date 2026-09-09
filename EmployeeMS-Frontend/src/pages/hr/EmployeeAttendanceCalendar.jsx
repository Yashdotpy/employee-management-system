import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AttendanceCalendar from "../../components/attendance/AttendanceCalendar";
import AdminLayout from "../../layouts/AdminLayout";
import { getEmployeeAttendance } from "../../services/attendanceService";
import { getEmployee } from "../../services/employeeService";
import { getHolidays } from "../../services/holidayService";
import { getEmployeeLeaves } from "../../services/leaveService";

function EmployeeAttendanceCalendar() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployeeAttendance() {
      try {
        const [employeeResponse, records, holidayData, leaveData] = await Promise.all([
          getEmployee(employeeId),
          getEmployeeAttendance(employeeId),
          getHolidays(),
          getEmployeeLeaves(employeeId),
        ]);
        setEmployee(employeeResponse.data);
        setAttendance(records);
        setHolidays(holidayData);
        setLeaves(leaveData);
      } catch (error) {
        console.error("Failed to load employee attendance:", error);
        toast.error(error.response?.data?.message || "Failed to load employee attendance.");
        navigate("/attendance");
      } finally {
        setLoading(false);
      }
    }

    loadEmployeeAttendance();
  }, [employeeId, navigate]);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <button type="button" onClick={() => navigate("/attendance")} className="mb-6 text-sm font-semibold text-sky-600 hover:text-sky-700">← Back to attendance</button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Attendance Info</h1>
          <p className="mt-2 text-slate-500">{employee ? `${employee.fullName}'s attendance calendar` : "Employee attendance calendar"}</p>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center text-slate-500 shadow">Loading attendance...</div>
        ) : (
          <AttendanceCalendar records={attendance} holidays={holidays} leaves={leaves} employeeName={employee?.fullName} readOnly={false} />
        )}
      </div>
    </AdminLayout>
  );
}

export default EmployeeAttendanceCalendar;
