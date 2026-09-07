import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AdminLayout from "../../layouts/AdminLayout";
import AttendanceForm from "../../components/attendance/AttendanceForm";

import {
  getAttendanceById,
  updateAttendance,
} from "../../services/attendanceService";

function EditAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    loadAttendance();
  }, [id]);

  async function loadAttendance() {
    try {
      setLoading(true);

      const data = await getAttendanceById(id);

      setAttendance({
        employeeId: data.employeeId,
        attendanceDate:
          data.attendanceDate?.split("T")[0] || "",
        checkInTime:
          data.checkInTime?.substring(0, 5) || "",
        checkOutTime:
          data.checkOutTime?.substring(0, 5) || "",
        status: data.status || "",
        remarks: data.remarks || "",
      });
    } catch (error) {
      console.error(
        "Failed to load attendance:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to load attendance."
      );

      navigate("/attendance");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data) {
    try {
      setSaving(true);

      await updateAttendance(id, data);

      toast.success(
        "Attendance updated successfully."
      );

      navigate("/attendance");
    } catch (error) {
      console.error(
        "Failed to update attendance:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to update attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-10 text-center text-slate-500">
          Loading attendance...
        </div>
      </AdminLayout>
    );
  }

  if (!attendance) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Edit Attendance
          </h1>

          <p className="mt-2 text-slate-500">
            Update the employee attendance record.
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow">

          <AttendanceForm
            defaultValues={attendance}
            onSubmit={handleSubmit}
            loading={saving}
          />

        </div>

      </div>
    </AdminLayout>
  );
}

export default EditAttendance;