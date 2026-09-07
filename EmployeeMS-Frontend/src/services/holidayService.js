import axiosClient from "../api/axiosClient";

export async function getHolidays() {
  const response = await axiosClient.get("/Holidays");
  return response.data;
}

export async function createHoliday(data) {
  const response = await axiosClient.post("/Holidays", data);
  return response.data;
}

export async function deleteHoliday(id) {
  const response = await axiosClient.delete(`/Holidays/${id}`);
  return response.data;
}
