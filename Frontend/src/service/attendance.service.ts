import axiosInstance from "./axios";

export const getMyAttendance = (
  employeeId: number,
  params: Record<string, unknown> = {}
) => {
  return axiosInstance.get(`/attendance/my-attendance/${employeeId}`, {
    params,
  });
};
