const taskService = require("./task.service");

const createTask = async (req, res) => {
    const result = await taskService.createTask(req.body);

    res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: result,
    });
};

const getAllTasks = async (req, res) => {
    const result = await taskService.getAllTasks(req.query);

    res.status(200).json({
        success: true,
        data: result,
    });
};

const getSingleTask = async (req, res) => {
    const result = await taskService.getSingleTask(req.params.id);

    res.status(200).json({
        success: true,
        data: result,
    });
};

const updateTask = async (req, res) => {
    const result = await taskService.updateTask(
        req.params.id,
        req.body
    );

    res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: result,
    });
};

const completeTask = async (req, res) => {
    const result = await taskService.completeTask(req.params.id);

    res.status(200).json({
        success: true,
        message: "Task completed",
        data: result,
    });
};

const deleteTask = async (req, res) => {
    const result = await taskService.deleteTask(req.params.id);

    res.status(200).json({
        success: true,
        message: "Task deleted",
        data: result,
    });
};

const restoreTask = async (req, res) => {
    const result = await taskService.restoreTask(req.params.id);

    res.status(200).json({
        success: true,
        message: "Task restored",
        data: result,
    });
};

const dashboardSummary = async (req, res) => {
    const result = await taskService.dashboardSummary();

    res.status(200).json({
        success: true,
        data: result,
    });
};

module.exports = {
    createTask,
    getAllTasks,
    getSingleTask,
    updateTask,
    completeTask,
    deleteTask,
    restoreTask,
    dashboardSummary,
};