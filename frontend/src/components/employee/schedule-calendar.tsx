import React, { useState } from 'react';
import { Calendar, Badge, Select, Typography, Button, Space, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { EmployeeSchedule } from '../../types/employee-schedule';
import { Employee } from '../../types/employee';

const { Option } = Select;
const { Text } = Typography;

interface ScheduleCalendarProps {
  schedules: EmployeeSchedule[];
  employees: Employee[];
  onAddSchedule: (date: string) => void;
  onEditSchedule: (schedule: EmployeeSchedule) => void;
  onDeleteSchedule: (schedule: EmployeeSchedule) => void;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  schedules,
  employees,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
}) => {
  const { t } = useTranslation();
  const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>();

  const filteredSchedules = selectedEmployee
    ? schedules.filter(schedule => schedule.employeeId === selectedEmployee)
    : schedules;

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? (employee.name || `${employee.firstName} ${employee.lastName}`) : employeeId;
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'morning':
        return 'blue';
      case 'afternoon': 
        return 'green';
      case 'night': 
        return 'purple';
      default:
        return 'default';
    }
  };

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dateSchedules = filteredSchedules.filter(
      schedule => schedule.date === dateStr
    );

    return (
      <div className="schedule-cell">
        {dateSchedules.length > 0 ? (
          <>
            {dateSchedules.map(schedule => (
              <div key={schedule.id} style={{ marginBottom: 3 }}>
                <Badge
                  color={getShiftColor(schedule.shift)}
                  text={
                    <Space size="small">
                      <Text style={{ fontSize: '12px' }}>
                        {selectedEmployee ? t(`schedule.shifts.${schedule.shift}`) : getEmployeeName(schedule.employeeId)}
                      </Text>
                      <Space size="small">
                        <Tooltip title={t('common.edit')}>
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditSchedule(schedule);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSchedule(schedule);
                            }}
                          />
                        </Tooltip>
                      </Space>
                    </Space>
                  }
                />
              </div>
            ))}
          </>
        ) : (
          <Tooltip title={t('schedule.addScheduleForDate')}>
            <Button 
              type="text" 
              size="small" 
              icon={<PlusOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                onAddSchedule(dateStr);
              }}
            />
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <div className="schedule-calendar">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Space>
          <span>{t('schedule.filterEmployee')}:</span>
          <Select
            allowClear
            style={{ width: 200 }}
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            placeholder={t('schedule.allEmployees')}
          >
            {employees.map(employee => (
              <Option key={employee.id} value={employee.id}>
                {employee.name || `${employee.firstName} ${employee.lastName}`}
              </Option>
            ))}
          </Select>
        </Space>
      </div>
      <Calendar cellRender={dateCellRender} />
    </div>
  );
};
