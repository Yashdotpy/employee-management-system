import axiosClient from "../api/axiosClient";

export const getMyProfile = async () => {
  const response = await axiosClient.get("/employee/me");
  return response.data;
};

export const getEmployees = () =>
  axiosClient.get("/employee");

export const getEmployee = (id) =>
  axiosClient.get(`/employee/${id}`);

export const createEmployee = (data) =>
  axiosClient.post("/employee", data);

export const updateEmployee = (id, data) =>
  axiosClient.put(`/employee/${id}`, data);

export const deleteEmployee = (id) =>
  axiosClient.delete(`/employee/${id}`);