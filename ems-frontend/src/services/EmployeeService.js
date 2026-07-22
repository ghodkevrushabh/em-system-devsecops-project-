import axios from "axios";
import { getToken } from "./AuthService";

const EMPLOYEE_REST_API_BASE_URL = "http://192.168.56.138:8080/api/employees";

// Add a request interceptor to attach the JWT token
axios.interceptors.request.use(function (config) {
    const token = getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

export const listEmployees = () => axios.get(EMPLOYEE_REST_API_BASE_URL);

export const createEmployee = (employee) => axios.post(EMPLOYEE_REST_API_BASE_URL, employee);

export const getEmployee = (employeeId) => axios.get(EMPLOYEE_REST_API_BASE_URL + '/' + employeeId);

export const updateEmployee = (employeeId, employee) => axios.put(EMPLOYEE_REST_API_BASE_URL + '/' + employeeId, employee);

export const deleteEmployee = (employeeId) => axios.delete(EMPLOYEE_REST_API_BASE_URL + '/' + employeeId);
