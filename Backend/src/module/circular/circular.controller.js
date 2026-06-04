const circularService = require("./circular.service");

const createCircular = async (req, res) => {
  try {
    const result = await circularService.createCircular(req.body);

    res.status(201).json({
      success: true,
      message: "Circular created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllCirculars = async (req, res) => {
  try {
    const result = await circularService.getAllCirculars(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCircularById = async (req, res) => {
  try {
    const result = await circularService.getCircularById(req.params.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCircular = async (req, res) => {
  try {
    const result = await circularService.updateCircular(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Circular updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteCircular = async (req, res) => {
  try {
    await circularService.deleteCircular(req.params.id);

    res.status(200).json({
      success: true,
      message: "Circular deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCircular,
  getAllCirculars,
  getCircularById,
  updateCircular,
  deleteCircular,
};