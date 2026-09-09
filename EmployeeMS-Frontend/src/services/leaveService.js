import axiosClient from "../api/axiosClient";

export async function getMyLeaves() {
  const response = await axiosClient.get("/Leaves/my");
  return response.data;
}

export async function getLeaves() {
  const response = await axiosClient.get("/Leaves");
  return response.data;
}

export async function getEmployeeLeaves(employeeId) {
  const response = await axiosClient.get(`/Leaves/employee/${employeeId}`);
  return response.data;
}

export async function createLeave(data) {
  const response = await axiosClient.post("/Leaves", data);
  return response.data;
}

export async function updateLeaveStatus(id, status) {
  const response = await axiosClient.put(`/Leaves/${id}/status`, { status });
  return response.data;
}
