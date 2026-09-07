import axios from "axios";

const API_URL = "http://localhost:5115/api/admin";

export async function adminLogin(credentials) {
  const response = await axios.post(
    `${API_URL}/login`,
    credentials
  );

  return response.data;
}

export async function adminRefreshToken(refreshToken) {
  const response = await axios.post(
    `${API_URL}/refresh`,
    {
      refreshToken,
    }
  );

  return response.data;
}

export async function adminLogout(refreshToken) {
  const response = await axios.post(
    `${API_URL}/logout`,
    {
      refreshToken,
    }
  );

  return response.data;
}