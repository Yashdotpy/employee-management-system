import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AdminLayout from "../../layouts/AdminLayout";
import AttendanceForm from "../../components/attendance/AttendanceForm";

import {
  createAttendance,
} from "../../services/attendanceService";

function CreateAttendance() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [defaultValues] = useState({
    employeeId: "",
    attendanceDate: "",
    checkInTime: "",
    checkOutTime: "",
    status: "",
    remarks: "",
  });

  async function handleSubmit(data) {
    try {
      setLoading(true);

      await createAttendance(data);

      toast.success(
        "Attendance created successfully."
      );

      navigate("/attendance");

    } catch (error) {
      console.error(
        "Failed to create attendance:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Failed to create attendance.";

      toast.error(message);

    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>

      <div className="mx-auto max-w-3xl">

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-slate-800">
            Add Attendance
          </h1>

          <p className="mt-2 text-slate-500">
            Add attendance record for an employee.
          </p>

        </div>


        <div className="rounded-xl bg-white p-8 shadow">

          <AttendanceForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            loading={loading}
          />

        </div>

      </div>

    </AdminLayout>
  );
}

export default CreateAttendance;