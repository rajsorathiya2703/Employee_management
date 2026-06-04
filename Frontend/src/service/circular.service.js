import axios from "axios";

const API_URL = "http://localhost:5000/api/circulars";

export const getCirculars = (params) =>
    axios.get(API_URL, { params });

export const getCircularById = (id) =>
    axios.get(`${API_URL}/${id}`);