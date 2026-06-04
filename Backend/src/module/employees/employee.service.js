const prisma = require("../../config/prisma");

const createEmployee = async (payload) => {
  return prisma.employee.create({
    data: payload,
  });
};

const getEmployees = async () => {
  return prisma.employee.findMany();
};

module.exports = {
  createEmployee,
  getEmployees,
};