import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  getEmployeeAttendanceSummary,
} from "../../services/attendanceService";

function EmployeeAttendanceSummary() {
  const currentDate = new Date();

  const [year, setYear] = useState(
    currentDate.getFullYear()
  );

  const [month, setMonth] = useState(
    currentDate.getMonth() + 1
  );

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD ATTENDANCE SUMMARY
  // =====================================================

  async function loadSummary() {
    try {
      setLoading(true);

      const response =
        await getEmployeeAttendanceSummary(
          year,
          month
        );

      setEmployees(response.data);
    } catch (error) {
      console.error(
        "Failed to load employee attendance summary:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load employee attendance summary."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // LOAD WHEN YEAR OR MONTH CHANGES
  // =====================================================

  useEffect(() => {
    loadSummary();
  }, [year, month]);

  // =====================================================
  // MONTHS
  // =====================================================

  const months = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];

  // =====================================================
  // YEARS
  // =====================================================

  const years = [];

  for (
    let currentYear = currentDate.getFullYear() - 2;
    currentYear <= currentDate.getFullYear();
    currentYear++
  ) {
    years.push(currentYear);
  }

  return (
    <div className="mb-6 rounded-xl bg-white shadow">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-slate-100 px-6 py-5">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Employee Attendance Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Attendance performance by month.
            </p>
          </div>


          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="flex gap-3">

            {/* YEAR */}

            <select
              value={year}
              onChange={(e) =>
                setYear(Number(e.target.value))
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:ring-2"
            >
              {years.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>


            {/* MONTH */}

            <select
              value={month}
              onChange={(e) =>
                setMonth(Number(e.target.value))
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:ring-2"
            >
              {months.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.name}
                </option>
              ))}
            </select>

          </div>

        </div>

      </div>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (

        <div className="p-10 text-center text-slate-500">
          Loading employee attendance summary...
        </div>

      ) : employees.length === 0 ? (

        <div className="p-10 text-center text-slate-500">
          No employee attendance data found for{" "}
          {months.find(
            (item) => item.value === month
          )?.name}{" "}
          {year}.
        </div>

      ) : (

        /* =================================================
           TABLE
        ================================================= */

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Employee
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Present
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Absent
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Half Day
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Leave
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Total Days
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Attendance %
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              {employees.map((employee) => (

                <tr
                  key={employee.employeeId}
                  className="hover:bg-slate-50"
                >

                  {/* EMPLOYEE */}

                  <td className="px-6 py-4">

                    <p className="font-medium text-slate-800">
                      {employee.employeeName}
                    </p>

                    <p className="text-xs text-slate-400">
                      ID: {employee.employeeId}
                    </p>

                  </td>


                  {/* PRESENT */}

                  <td className="px-6 py-4">

                    <span className="font-semibold text-green-600">
                      {employee.present}
                    </span>

                  </td>


                  {/* ABSENT */}

                  <td className="px-6 py-4">

                    <span className="font-semibold text-red-600">
                      {employee.absent}
                    </span>

                  </td>


                  {/* HALF DAY */}

                  <td className="px-6 py-4">

                    <span className="font-semibold text-yellow-600">
                      {employee.halfDay}
                    </span>

                  </td>


                  {/* LEAVE */}

                  <td className="px-6 py-4">

                    <span className="font-semibold text-blue-600">
                      {employee.leave}
                    </span>

                  </td>


                  {/* TOTAL DAYS */}

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {employee.totalDays}
                  </td>


                  {/* ATTENDANCE PERCENTAGE */}

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{
                            width: `${Math.min(
                              employee.attendancePercentage,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                      <span className="text-sm font-semibold text-slate-700">
                        {employee.attendancePercentage}%
                      </span>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default EmployeeAttendanceSummary;