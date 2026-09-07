import axiosClient from "../api/axiosClient";

// Get all attendance records
export async function getAllAttendance() {
  const response = await axiosClient.get("/Attendance");

  return response.data;
}

// Get attendance by ID
export async function getAttendanceById(id) {
  const response = await axiosClient.get(
    `/Attendance/${id}`
  );

  return response.data;
}

// Get attendance of a specific employee
export async function getEmployeeAttendance(employeeId) {
  const response = await axiosClient.get(
    `/Attendance/employee/${employeeId}`
  );

  return response.data;
}

// Get logged-in employee's own attendance
export async function getMyAttendance() {
  const response = await axiosClient.get(
    "/Attendance/my"
  );

  return response.data;
}

export async function getMyTodayAttendance() {
  const response = await axiosClient.get("/Attendance/my/today");
  return response.data;
}

export async function clockIn() {
  const response = await axiosClient.post("/Attendance/my/clock-in");
  return response.data;
}

export async function clockOut() {
  const response = await axiosClient.post("/Attendance/my/clock-out");
  return response.data;
}

// Create attendance
export async function createAttendance(data) {
  const response = await axiosClient.post(
    "/Attendance",
    data
  );

  return response.data;
}

// Update attendance
export async function updateAttendance(id, data) {
  const response = await axiosClient.put(
    `/Attendance/${id}`,
    data
  );

  return response.data;
}

// Delete attendance
export async function deleteAttendance(id) {
  const response = await axiosClient.delete(
    `/Attendance/${id}`
  );

  return response.data;
}

export const getTodayAttendanceReport = () =>
  axiosClient.get("/attendance/report/today");

export const getEmployeeAttendanceSummary = (
  year,
  month
) =>
  axiosClient.get(
    `/attendance/report/employees?year=${year}&month=${month}`
  );
