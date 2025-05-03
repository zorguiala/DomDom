import { Employee } from '../../entities/employee.entity';
import { EmployeeAttendance } from '../../entities/employee-attendance.entity';
import { EmployeeScheduleShift } from '../../entities/employee-schedule.entity';

export interface EmployeeAttendanceSummary {
  present: number;
  absent: number;
  total: number;
  records: EmployeeAttendance[];
}

export interface EmployeeAttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  averageHoursPerDay: number;
}

export interface EmployeeProductivityMetrics {
  id: string;
  employeeId: string;
  period: string;
  productivityRate: number;
  qualityScore: number;
  efficiencyScore: number;
  totalProductionCount: number;
  totalQualityIssues: number;
}

export type EmployeeProductivity = EmployeeProductivityMetrics;

export interface EmployeeSchedule {
  id: string;
  employeeId: string;
  shift: EmployeeScheduleShift;
  date: Date;
  notes?: string;
}

export interface EmployeeWithAttendance extends Employee {
  attendanceRecords: EmployeeAttendance[];
}
