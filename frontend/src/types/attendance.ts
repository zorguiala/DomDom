export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: string; // e.g. "Present", "Absent", "Late"
}
