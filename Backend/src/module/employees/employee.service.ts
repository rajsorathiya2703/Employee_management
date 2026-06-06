import prisma from "../../config/prisma";
import { Prisma } from "@prisma/client";

export const createEmployee = async (payload: Prisma.EmployeeCreateInput) => {
  return prisma.employee.create({ data: payload });
};

export const getEmployees = async () => {
  return prisma.employee.findMany();
};

// ── Profile ───────────────────────────────────────────────────────────────────

/** Safe subset returned to the client — never exposes password / tokens */
const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  personalEmail: true,
  designation: true,
  department: true,
  branch: true,
  dateOfJoining: true,
  profilePhoto: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const getProfileById = async (id: number) => {
  return prisma.employee.findUnique({
    where: { id },
    select: PROFILE_SELECT,
  });
};

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  personalEmail?: string;
  designation?: string;
  department?: string;
  branch?: string;
  dateOfJoining?: string; // ISO string from client
  profilePhoto?: string;
}

export const updateProfile = async (id: number, payload: UpdateProfilePayload) => {
  const { dateOfJoining, ...rest } = payload;
  return prisma.employee.update({
    where: { id },
    data: {
      ...rest,
      ...(dateOfJoining ? { dateOfJoining: new Date(dateOfJoining) } : {}),
    },
    select: PROFILE_SELECT,
  });
};
