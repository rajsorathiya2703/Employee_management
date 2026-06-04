import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/tasks",
});

export const getTasks = (params) => API.get("/", { params });

export const getDashboard = () => API.get("/dashboard");

export const createTask = (data) => API.post("/", data);

export const updateTask = (id, data) => API.patch(`/${id}`, data);

export const completeTask = (id) =>
    API.patch(`/${id}/complete`);

export const deleteTask = (id) =>
    API.patch(`/${id}/delete`);

export const restoreTask = (id) =>
    API.patch(`/${id}/restore`);