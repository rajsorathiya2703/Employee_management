const service = require("./attendance.service");
const prisma = require("../../config/prisma");

const punchIn = async (req, res) => {
  try {
    const result = await service.punchIn(
      Number(req.body.employeeId)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const punchOut = async (req, res) => {
  try {
    await service.punchOut(
      Number(req.body.employeeId)
    );

    res.json({
      success: true,
      message: "Punch out successful",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { pageIndex = 0, pageSize = 10 } = req.query;

    const page = parseInt(pageIndex) + 1;
    const limit = parseInt(pageSize);

    const [data, total] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          employeeId: Number(employeeId),
        },
        skip: pageIndex * limit,
        take: limit,
        orderBy: {
          attendanceDate: "desc",
        },
      }),
      prisma.attendance.count({
        where: {
          employeeId: Number(employeeId),
        },
      }),
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        total,
        pageIndex: parseInt(pageIndex),
        pageSize: limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  punchIn,
  punchOut,
  getMyAttendance,
};