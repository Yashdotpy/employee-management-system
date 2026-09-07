import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AdminLayout from "../../layouts/AdminLayout";
import EmployeeForm from "../../components/employees/EmployeeForm";

import {
  getEmployee,
  updateEmployee,
} from "../../services/employeeService";

function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // LOAD EMPLOYEE
  // =====================================================

  useEffect(() => {
    loadEmployee();
  }, [id]);

  async function loadEmployee() {
    try {
      setLoading(true);

      const response = await getEmployee(id);

      console.log(
        "Employee API response:",
        response.data
      );

      const data = response.data;

      setEmployee({
        firstName:
          data.fullName?.split(" ")[0] || "",

        lastName:
          data.fullName
            ?.split(" ")
            .slice(1)
            .join(" ") || "",

        email: data.email || "",

        phone: data.phone || "",

        department: data.department || "",

        salary: data.salary ?? "",

        dateOfJoining: data.dateOfJoining
          ? data.dateOfJoining.substring(0, 10)
          : "",

        role: data.role || "Employee",
      });

    } catch (error) {
      console.error(
        "Failed to load employee:",
        error
      );

      toast.error(
        "Failed to load employee."
      );

      navigate("/employees");

    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // UPDATE EMPLOYEE
  // =====================================================

  async function onSubmit(data) {
    try {
      setSaving(true);

      const updateData = {
        fullName:
          `${data.firstName} ${data.lastName}`.trim(),

        email: data.email,

        role: data.role,

        department: data.department,

        phone: data.phone,

        salary: Number(data.salary),

        dateOfJoining: data.dateOfJoining,
      };

      console.log(
        "Update employee payload:",
        updateData
      );

      await updateEmployee(
        id,
        updateData
      );

      toast.success(
        "Employee updated successfully!"
      );

      navigate("/admin/employees");

    } catch (error) {
      console.error(
        "Failed to update employee:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update employee."
      );

    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <AdminLayout>

        <div className="flex min-h-[400px] items-center justify-center">

          <p className="text-slate-500">
            Loading employee...
          </p>

        </div>

      </AdminLayout>
    );
  }

  // =====================================================
  // NO EMPLOYEE
  // =====================================================

  if (!employee) {
    return null;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <AdminLayout>

      <div className="mx-auto max-w-4xl">

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-slate-800">
            Edit Employee
          </h1>

          <p className="mt-2 text-slate-500">
            Update the employee details below.
          </p>

        </div>

        <div className="rounded-xl bg-white p-8 shadow">

          <EmployeeForm
            defaultValues={employee}
            onSubmit={onSubmit}
            loading={saving}
            isEdit={true}
          />

        </div>

      </div>

    </AdminLayout>
  );
}

export default EditEmployee;