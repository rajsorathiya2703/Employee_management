const employeeService = require("./employee.service");

const createEmployee = async (req, res) => {
  try {
    const employee = await employeeService.createEmployee(req.body);

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getEmployees = async (req, res) => {
  const employees = await employeeService.getEmployees();

  res.json({
    success: true,
    data: employees,
  });
};

module.exports = {
  createEmployee,
  getEmployees,
};