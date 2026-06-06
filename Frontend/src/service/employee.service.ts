import axiosInstance from "./axios";

export interface EmployeeProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  personalEmail: string | null;
  designation: string | null;
  department: string | null;
  branch: string | null;
  dateOfJoining: string | null;   // ISO string
  profilePhoto: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  personalEmail?: string;
  designation?: string;
  department?: string;
  branch?: string;
  dateOfJoining?: string;   // "YYYY-MM-DD"
  profilePhoto?: string;
}

export const getEmployeeProfile = (id: number) =>
  axiosInstance.get<{ success: boolean; data: EmployeeProfile }>(
    `/employees/profile/${id}`
  );

export const updateEmployeeProfile = (id: number, payload: UpdateProfilePayload) =>
  axiosInstance.patch<{ success: boolean; data: EmployeeProfile }>(
    `/employees/profile/${id}`,
    payload
  );

export const uploadProfilePhoto = (id: number, file: File) => {
  const formData = new FormData();
  formData.append("photo", file);
  return axiosInstance.post<{ success: boolean; data: EmployeeProfile }>(
    `/employees/profile/${id}/photo`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};
