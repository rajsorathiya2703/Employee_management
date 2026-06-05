import axiosInstance from "./axios";

export const getMyAttendance = (
  employeeId: number,
  params: Record<string, unknown> = {}
) => {
  return axiosInstance.get(`/attendance/my-attendance/${employeeId}`, {
    params,
  });
};

export const punchIn = (employeeId: number) =>
  axiosInstance.post("/attendance/punch-in", { employeeId });

export const punchOut = (employeeId: number) =>
  axiosInstance.post("/attendance/punch-out", { employeeId });

export const getTodaySessions = (employeeId: number) =>
  axiosInstance.get(`/attendance/today-sessions/${employeeId}`);

export const getSessionsByAttendanceId = (attendanceId: number) =>
  axiosInstance.get(`/attendance/sessions/${attendanceId}`);
