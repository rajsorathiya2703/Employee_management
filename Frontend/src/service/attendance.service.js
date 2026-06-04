import axiosInstance from "./axios";

export const getMyAttendance = (employeeId, params = {}) => {
  return axiosInstance.get(
    `/attendance/my-attendance/${employeeId}`,
    {
      params,
    }
  );
};