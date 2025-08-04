import axios from "axios";

const API_BASE_URL = "https://backend.hrms.pixelsoft.online/"; 

//http://localhost:8000/
//https://kannattu-llp.onrender.com

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;