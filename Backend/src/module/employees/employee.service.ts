import prisma from "../../config/prisma";
import { Prisma } from "@prisma/client";

export const createEmployee = async (payload: Prisma.EmployeeCreateInput) => {
  return prisma.employee.create({ data: payload });
};

export const getEmployees = async () => {
  return prisma.employee.findMany();
};
