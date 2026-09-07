import axiosClient from "../api/axiosClient";

const createUser = async (userData) => {
  const response = await axiosClient.post("/admin/users", userData);
  return response.data;
};

export default {
  createUser,
};