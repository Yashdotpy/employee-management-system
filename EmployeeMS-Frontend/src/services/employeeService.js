import axiosClient from "../api/axiosClient";

export const getMyProfile = async () => {
  const response = await axiosClient.get("/employee/me");
  return response.data;
};

export const getEmployees = () =>
  axiosClient.get("/employee");

export const getEmployeeDirectory = async () => {
  const response = await axiosClient.get("/employee/directory");
  return response.data;
};

export const changeMyPassword = async (data) => {
  const response = await axiosClient.post("/employee/me/change-password", data);
  return response.data;
};

export const getEmployee = (id) =>
  axiosClient.get(`/employee/${id}`);

export const createEmployee = (data) =>
  axiosClient.post("/employee", data);

export const updateEmployee = (id, data) =>
  axiosClient.put(`/employee/${id}`, data);

export const deleteEmployee = (id) =>
  axiosClient.delete(`/employee/${id}`);
