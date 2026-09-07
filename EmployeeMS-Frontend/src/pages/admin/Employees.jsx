import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AdminLayout from "../../layouts/AdminLayout";

import {
  getEmployees,
  deleteEmployee,
} from "../../services/employeeService";

import EmployeeTable from "../../components/employees/EmployeeTable";
import EmployeeSearch from "../../components/employees/EmployeeSearch";
import EmployeeStats from "../../components/employees/EmployeeStats";
import DeleteEmployeeModal from "../../components/employees/DeleteEmployeeModal";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // DEPARTMENTS
  // =====================================================

  const departments = [
    ...new Set(
      employees
        .map((employee) => employee.department)
        .filter(Boolean)
    ),
  ];

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredEmployees = employees.filter((employee) => {
    const fullName = (
      employee.fullName ||
      `${employee.firstName || ""} ${employee.lastName || ""}`
    ).toLowerCase();

    const email = (employee.email || "").toLowerCase();

    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      fullName.includes(search) ||
      email.includes(search);

    const matchesDepartment =
      department === "" ||
      employee.department === department;

    return matchesSearch && matchesDepartment;
  });

  // =====================================================
  // LOAD EMPLOYEES
  // =====================================================

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);

      const response = await getEmployees();

      console.log("Employees API response:", response.data);

      /*
       * API returns:
       *
       * fullName: "Rahul Sharma"
       *
       * Your EmployeeTable was previously expecting
       * firstName and lastName.
       *
       * So we create those properties here without
       * changing the UI component.
       */

      const normalizedEmployees = response.data.map((employee) => {
        const fullName = employee.fullName || "";

        const nameParts = fullName.trim().split(/\s+/);

        const firstName = nameParts[0] || "";

        const lastName =
          nameParts.length > 1
            ? nameParts.slice(1).join(" ")
            : "";

        return {
          ...employee,

          // Original API property
          fullName,

          // Compatibility properties for EmployeeTable
          firstName,
          lastName,
        };
      });

      console.log(
        "Normalized employees:",
        normalizedEmployees
      );

      setEmployees(normalizedEmployees);

    } catch (error) {
      console.error(
        "Failed to load employees:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        "Failed to load employees."
      );

    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // DELETE EMPLOYEE
  // =====================================================

  async function handleDelete() {
    if (!selectedEmployee) {
      return;
    }

    try {
      setDeleteLoading(true);

      await deleteEmployee(
        selectedEmployee.employeeId
      );

      toast.success("Employee deleted.");

      setEmployees((prev) =>
        prev.filter(
          (employee) =>
            employee.employeeId !==
            selectedEmployee.employeeId
        )
      );

      setShowDeleteModal(false);
      setSelectedEmployee(null);

    } catch (error) {
      console.error(
        "Failed to delete employee:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        "Failed to delete employee."
      );

    } finally {
      setDeleteLoading(false);
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <AdminLayout>

      <div className="space-y-6">

        {/* HEADER */}

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold">
              Employees
            </h1>

            <p className="text-slate-500">
              Manage all employees in your organization.
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/admin/employees/create")
            }
            className="rounded-lg bg-blue-600 px-5 py-3 text-white"
          >
            + Add Employee
          </button>

        </div>

        {/* STATISTICS */}

        <EmployeeStats
          employees={employees}
        />

        {/* SEARCH */}

        <EmployeeSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          department={department}
          setDepartment={setDepartment}
          departments={departments}
        />

        {/* EMPLOYEE TABLE */}

        <EmployeeTable
          employees={filteredEmployees}
          loading={loading}
          onDelete={(employee) => {
            setSelectedEmployee(employee);
            setShowDeleteModal(true);
          }}
        />

        {/* DELETE MODAL */}

        <DeleteEmployeeModal
          isOpen={showDeleteModal}
          employee={selectedEmployee}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedEmployee(null);
          }}
          onDelete={handleDelete}
          loading={deleteLoading}
        />

      </div>

    </AdminLayout>
  );
}

export default Employees;