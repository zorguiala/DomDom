import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Employee } from '../../entities/employee.entity';
import { EmployeeAttendance } from '../../entities/employee-attendance.entity';
import { CreateEmployeeDto, MarkAttendanceDto } from '../dto/employee.dto';

@Injectable()
export class EmployeeCreationService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeAttendance)
    private readonly employeeAttendanceRepository: Repository<EmployeeAttendance>
  ) {}

  /**
   * Create a new employee record.
   */
  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    // Check if employee with same email or employeeId exists
    const existingEmployee = await this.employeeRepository.findOne({
      where: [
        { email: dto.email } as FindOptionsWhere<Employee>,
        { employeeId: dto.employeeId } as FindOptionsWhere<Employee>,
      ],
    });

    if (existingEmployee) {
      throw new BadRequestException('Employee with this email or ID already exists');
    }

    // Create employee entity with proper type casting
    const employee = this.employeeRepository.create();
    Object.assign(employee, dto);

    return await this.employeeRepository.save(employee);
  }

  /**
   * Mark attendance for an employee (check-in/check-out).
   */
  async markAttendance(dto: MarkAttendanceDto): Promise<EmployeeAttendance> {
    const employee = await this.employeeRepository.findOne({
      where: { employeeId: dto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${dto.employeeId} not found`);
    }

    // Find existing attendance record for the day
    const attendance = await this.employeeAttendanceRepository.findOne({
      where: {
        employee: { id: employee.id },
        clockIn: dto.checkInTime,
      } as FindOptionsWhere<EmployeeAttendance>,
      relations: ['employee'],
    });

    if (attendance) {
      // Update existing attendance record
      if (dto.checkOutTime) {
        if (new Date(dto.checkOutTime) <= attendance.clockIn) {
          throw new BadRequestException('Check-out time must be after check-in time');
        }

        attendance.clockOut = new Date(dto.checkOutTime);
        attendance.notes = dto.notes || '';

        // Calculate duration in hours
        const duration =
          (attendance.clockOut.getTime() - attendance.clockIn.getTime()) / (1000 * 60 * 60);
        attendance.durationHours = Number(duration.toFixed(2));
      }
      return await this.employeeAttendanceRepository.save(attendance);
    }

    // Create new attendance record
    if (!dto.checkInTime) {
      throw new BadRequestException('Check-in time is required for new attendance record');
    }

    // Create attendance entity with proper type casting
    const newAttendance = this.employeeAttendanceRepository.create();
    Object.assign(newAttendance, {
      employee,
      clockIn: new Date(dto.checkInTime),
      clockOut: dto.checkOutTime ? new Date(dto.checkOutTime) : null,
      notes: dto.notes || '',
    });

    if (dto.checkOutTime) {
      if (new Date(dto.checkOutTime) <= new Date(dto.checkInTime)) {
        throw new BadRequestException('Check-out time must be after check-in time');
      }

      const duration =
        (new Date(dto.checkOutTime).getTime() - new Date(dto.checkInTime).getTime()) /
        (1000 * 60 * 60);
      newAttendance.durationHours = Number(duration.toFixed(2));
    }

    return await this.employeeAttendanceRepository.save(newAttendance);
  }
}
