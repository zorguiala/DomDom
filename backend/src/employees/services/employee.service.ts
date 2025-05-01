import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Employee } from '../../entities/employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.dto';
import { EmployeeProductivityMetrics } from '../types/employee.types';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const existingEmployee = await this.employeeRepository.findOne({
      where: [
        { email: createEmployeeDto.email } as FindOptionsWhere<Employee>,
        { employeeId: createEmployeeDto.employeeId } as FindOptionsWhere<Employee>,
      ],
    });

    if (existingEmployee) {
      throw new BadRequestException('Employee with this email or ID already exists');
    }

    // First create the employee entity
    const employee = this.employeeRepository.create();

    // Then assign the properties
    Object.assign(employee, {
      ...createEmployeeDto,
      attendanceRecords: [],
      productionRecords: [],
    });

    return await this.employeeRepository.save(employee);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      order: {
        firstName: 'ASC',
        lastName: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['attendanceRecords', 'productionRecords'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async findByEmployeeId(employeeId: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with employee ID ${employeeId} not found`);
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);

    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingEmployee = await this.employeeRepository.findOne({
        where: { email: updateEmployeeDto.email },
      });

      if (existingEmployee) {
        throw new BadRequestException('Email already in use');
      }
    }

    // Apply updates to the existing entity
    Object.assign(employee, updateEmployeeDto);
    return await this.employeeRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    employee.isActive = false;
    await this.employeeRepository.save(employee);
  }

  async updateProductivityMetrics(
    id: string,
    metrics: EmployeeProductivityMetrics
  ): Promise<Employee> {
    const employee = await this.findOne(id);
    Object.assign(employee, metrics);
    return await this.employeeRepository.save(employee);
  }
}
