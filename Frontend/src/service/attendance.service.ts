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

export const getMonthlyAttendance = (employeeId: number, month: number, year: number) =>
  axiosInstance.get(`/attendance/monthly/${employeeId}`, { params: { month, year } });

// ── Attendance Requests ──────────────────────────────────────────────────────

export const getAttendanceRequests = (
  employeeId: number,
  params: Record<string, unknown> = {}
) => axiosInstance.get(`/attendance/requests/${employeeId}`, { params });

export const createAttendanceRequest = (data: {
  employeeId: number;
  date: string;
  type: string;
  reason: string;
}) => axiosInstance.post("/attendance/requests", data);

export const deleteAttendanceRequest = (id: number) =>
  axiosInstance.delete(`/attendance/requests/${id}`);
