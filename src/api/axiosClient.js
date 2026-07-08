import axios from "axios";

const axiosClient = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || "http://localhost:8081") + "/api",
});

// Centralized Interceptor to inject standard Authorization header
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("supabaseAccessToken");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosClient;