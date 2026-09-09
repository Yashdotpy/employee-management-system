import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/auth/Login";
import CreateUser from "../pages/admin/CreateUser";
import Register from "../pages/auth/Register";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Employees from "../pages/admin/Employees";
import NotFound from "../pages/auth/NotFound";
import EmployeeDashboard from "../pages/employee/EmployeeDashboard";;
import CreateEmployee from "../pages/admin/CreateEmployee";
import EditEmployee from "../pages/admin/EditEmployee";
import MyProfile from "../pages/employee/MyProfile";
import Attendance from "../pages/hr/Attendance";
import CreateAttendance from "../pages/hr/CreateAttendance";
import EditAttendance from "../pages/hr/EditAttendance";
import EmployeeAttendanceCalendar from "../pages/hr/EmployeeAttendanceCalendar";
import HolidayCalendar from "../pages/hr/HolidayCalendar";
import MyAttendance from "../pages/employee/MyAttendance";
import EmployeeDirectory from "../pages/employee/EmployeeDirectory";
import ChangePassword from "../pages/employee/ChangePassword";
import MyLeaves from "../pages/employee/MyLeaves";
import LeaveManagement from "../pages/hr/LeaveManagement";
// import ChangePassword from "./pages/employee/ChangePassword";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <CreateUser />
            </ProtectedRoute>
          }
        />

        <Route
            path="/admin/employees/create"
            element={
              <ProtectedRoute allowedRoles={["Admin", "HR"]}>
                <CreateEmployee />
              </ProtectedRoute>
            }
        />
        
        <Route
            path="/admin/employees/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["Admin", "HR"]}>
                <EditEmployee />
              </ProtectedRoute>
            }
        />

        <Route path="/register" element={<Register />} />

        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
            path="/employees"
            element={
                <ProtectedRoute allowedRoles={["Admin","HR"]}>
                    <Employees/>
                </ProtectedRoute>
            }
        />

        <Route path="*" element={<NotFound />} />

        <Route path="/dashboard"element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}/>
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/profile" element={<MyProfile />} />
        <Route path="/employee/employees" element={<ProtectedRoute allowedRoles={["Employee"]}><EmployeeDirectory /></ProtectedRoute>} />
        <Route path="/employee/change-password" element={<ProtectedRoute allowedRoles={["Employee"]}><ChangePassword /></ProtectedRoute>} />
        <Route path="/employee/leaves" element={<ProtectedRoute allowedRoles={["Employee"]}><MyLeaves /></ProtectedRoute>} />
        <Route path="/leaves" element={<ProtectedRoute allowedRoles={["Admin", "HR"]}><LeaveManagement /></ProtectedRoute>} />
        <Route
              path="/attendance"
              element={
                <ProtectedRoute allowedRoles={["Admin", "HR"]}>
                  <Attendance />
                </ProtectedRoute>
              }
        />
        <Route
          path="/attendance/create"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR"]}>
              <CreateAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR"]}>
              <EditAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/employee/:employeeId"
          element={
            <ProtectedRoute allowedRoles={["Admin", "HR"]}>
              <EmployeeAttendanceCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/holidays"
          element={<ProtectedRoute allowedRoles={["Admin", "HR"]}><HolidayCalendar /></ProtectedRoute>}
        />
        <Route
          path="/my-attendance"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <MyAttendance />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
