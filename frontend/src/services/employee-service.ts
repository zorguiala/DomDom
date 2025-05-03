import api from "./api";
import { Employee } from "../types/employee";
import { AttendanceRecord } from "../types/attendance";
import { EmployeeProductivity } from "../types/employee";
import { EmployeeSchedule } from "../types/employee-schedule";

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
    const response = await api.get("/employees");
    return response.data;
  },
  async getAttendance(startDate?: string, endDate?: string): Promise<AttendanceRecord[]> {
    // Add date range if provided
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = queryString ? `/employees/attendance?${queryString}` : '/employees/attendance/today';
    
    const response = await api.get(url);
    return response.data;
  },
  async getProductivity(startDate?: string, endDate?: string): Promise<EmployeeProductivity[]> {
    // Add date range if provided
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = `/employees/productivity${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },
  async getSchedules(startDate?: string, endDate?: string): Promise<EmployeeSchedule[]> {
    // Add date range if provided
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = `/employees/schedules${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },
  async createSchedule(schedule: Omit<EmployeeSchedule, "id">): Promise<EmployeeSchedule> {
    // Create a schedule for the employee
    const { employeeId, ...scheduleData } = schedule;
    const response = await api.post(`/employees/${employeeId}/schedule`, scheduleData);
    return response.data;
  },
  async updateSchedule(id: string, schedule: Omit<EmployeeSchedule, "id">): Promise<EmployeeSchedule> {
    // Update a specific schedule using its ID and the employee ID
    const { employeeId, ...scheduleData } = schedule;
    const response = await api.put(`/employees/${employeeId}/schedule/${id}`, scheduleData);
    return response.data;
  },
  async deleteSchedule(id: string, employeeId: string): Promise<void> {
    // Delete a specific schedule
    await api.delete(`/employees/${employeeId}/schedule/${id}`);
  },
  async getEmployeeSchedules(employeeId: string, startDate?: string, endDate?: string): Promise<EmployeeSchedule[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = `/employees/${employeeId}/schedule${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  }
};
