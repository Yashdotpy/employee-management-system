import axiosClient from "../api/axiosClient";

const login = async (loginData) => {
  const response = await axiosClient.post("/auth/login", loginData);

  return response.data;
};

const register = async (registerData) => {
  const response = await axiosClient.post("/auth/register", registerData);

  return response.data;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export default {
  login,
  register,
  logout,
};