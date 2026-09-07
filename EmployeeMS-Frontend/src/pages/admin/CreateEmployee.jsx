import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AdminLayout from "../../layouts/AdminLayout";
import EmployeeForm from "../../components/employees/EmployeeForm";

import { createEmployee } from "../../services/employeeService";

function CreateEmployee() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const defaultValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Employee",
    phone: "",
    department: "",
    salary: "",
    dateOfJoining: "",
  };

  async function onSubmit(data) {
    try {
      setLoading(true);

      // Combine first name and last name
      const fullName = `${data.firstName} ${data.lastName}`.trim();

      // Convert form data to backend EmployeeCreateDto
      const employeeData = {
        fullName: fullName,
        email: data.email,
        password: data.password,
        role: data.role || "Employee",
        department: data.department,
        phone: data.phone,
        salary: Number(data.salary),
        dateOfJoining: data.dateOfJoining,
      };

      console.log("Employee data being sent:", employeeData);

      await createEmployee(employeeData);

      toast.success("Employee created successfully!");

      navigate("/employees");

    } catch (error) {
      console.error("Failed to create employee:", error);

      toast.error(
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to create employee."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>

      <div className="mx-auto max-w-4xl">

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-slate-800">
            Add Employee
          </h1>

          <p className="mt-2 text-slate-500">
            Fill in the employee details below.
          </p>

        </div>

        <div className="rounded-xl bg-white p-8 shadow">

          <EmployeeForm
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            loading={loading}
          />

        </div>

      </div>

    </AdminLayout>
  );
}

export default CreateEmployee;