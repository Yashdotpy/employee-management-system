import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getEmployees } from "../../services/employeeService";

function AttendanceForm({
  defaultValues,
  onSubmit,
  loading,
}) {
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState(
    defaultValues
  );

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

  useEffect(() => {
    loadEmployees();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      ...formData,
      employeeId: Number(
        formData.employeeId
      ),
      checkInTime: formData.checkInTime || null,
      checkOutTime: formData.checkOutTime || null,
      remarks: formData.remarks.trim() || null,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      {/* EMPLOYEE */}

      <div>

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Employee
        </label>

        <select
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2"
        >

          <option value="">
            Select employee
          </option>

          {employees.map((employee) => (
            <option
              key={employee.employeeId}
              value={employee.employeeId}
            >
              {employee.fullName}
            </option>
          ))}

        </select>

      </div>


      {/* DATE */}

      <div>

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Attendance Date
        </label>

        <input
          type="date"
          name="attendanceDate"
          value={formData.attendanceDate}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2"
        />

      </div>


      {/* TIME ROW */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* CHECK IN */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Check In
          </label>

          <input
            type="time"
            name="checkInTime"
            value={formData.checkInTime}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2"
          />

        </div>


        {/* CHECK OUT */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Check Out
          </label>

          <input
            type="time"
            name="checkOutTime"
            value={formData.checkOutTime}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2"
          />

        </div>

      </div>


      {/* STATUS */}

      <div>

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Status
        </label>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2"
        >

          <option value="">
            Select status
          </option>

          <option value="Present">
            Present
          </option>

          <option value="Absent">
            Absent
          </option>

          <option value="Half Day">
            Half Day
          </option>

          <option value="Leave">
            Leave
          </option>

          <option value="Off Day">
            Off Day
          </option>

        </select>

      </div>


      {/* REMARKS */}

      <div>

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Remarks
        </label>

        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          rows="3"
          placeholder="Optional remarks"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2"
        />

      </div>


      {/* BUTTON */}

      <div className="flex justify-end">

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : "Save Attendance"}
        </button>

      </div>

    </form>
  );
}

export default AttendanceForm;
