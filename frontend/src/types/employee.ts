export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  name?: string; // Display name combining first and last
  role: string;
  isActive: boolean;
  department?: string;
  position?: string;
  email?: string;
  phone?: string;
  hireDate?: string;
  productivityRate?: number;
  qualityScore?: number;
  efficiencyScore?: number;
}