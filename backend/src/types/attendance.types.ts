export interface AttendanceSummaryItem {
  employeeId: number;
  employeeName: string;
  totalHours: number;
  averageHoursPerDay: number;
  daysPresent: number;
  clockIns: number;
  clockOuts: number;
}
