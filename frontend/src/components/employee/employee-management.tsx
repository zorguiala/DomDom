import { Table, Typography, Tabs, Button, message, Modal } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Employee } from "../../types/employee";
import { AttendanceRecord } from "../../types/attendance";
import { EmployeeProductivity } from "../../types/employee";
import { EmployeeSchedule } from "../../types/employee-schedule";
import { employeeService } from "../../services/employee-service";
import { ScheduleForm } from "./schedule-form";
import { ScheduleCalendar } from "./schedule-calendar";

export function EmployeeManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isScheduleFormVisible, setIsScheduleFormVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<EmployeeSchedule | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [scheduleViewMode, setScheduleViewMode] = useState<'table' | 'calendar'>('table');

  // Get standard date range for default queries (current month)
  const getDefaultDateRange = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const defaultRange = getDefaultDateRange();

  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: employeeService.getEmployees,
  });

  const { data: attendance, isLoading: loadingAttendance } = useQuery<
    AttendanceRecord[]
  >({
    queryKey: ["attendance"],
    queryFn: () => employeeService.getAttendance(defaultRange.startDate, defaultRange.endDate),
  });

  const { data: productivity, isLoading: loadingProductivity } = useQuery<
    EmployeeProductivity[]
  >({
    queryKey: ["employeeProductivity"],
    queryFn: () => employeeService.getProductivity(defaultRange.startDate, defaultRange.endDate),
  });

  const { data: schedules, isLoading: loadingSchedules } = useQuery<
    EmployeeSchedule[]
  >({
    queryKey: ["employeeSchedules"],
    queryFn: () => employeeService.getSchedules(defaultRange.startDate, defaultRange.endDate),
  });

  // Mutations for schedule operations
  const createScheduleMutation = useMutation({
    mutationFn: (schedule: Omit<EmployeeSchedule, "id">) => 
      employeeService.createSchedule(schedule),
    onSuccess: () => {
      message.success(t('schedule.addSuccess'));
      queryClient.invalidateQueries({ queryKey: ["employeeSchedules"] });
      setIsScheduleFormVisible(false);
    },
    onError: () => {
      message.error(t('schedule.addError'));
    }
  });

  const updateScheduleMutation = useMutation({
    mutationFn: ({ id, schedule }: { id: string, schedule: Omit<EmployeeSchedule, "id"> }) => 
      employeeService.updateSchedule(id, schedule),
    onSuccess: () => {
      message.success(t('schedule.updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ["employeeSchedules"] });
      setIsScheduleFormVisible(false);
      setSelectedSchedule(undefined);
    },
    onError: () => {
      message.error(t('schedule.updateError'));
    }
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: ({ id, employeeId }: { id: string, employeeId: string }) => 
      employeeService.deleteSchedule(id, employeeId),
    onSuccess: () => {
      message.success(t('schedule.deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: ["employeeSchedules"] });
    },
    onError: () => {
      message.error(t('schedule.deleteError'));
    }
  });

  const employeeColumns = [
    {
      title: t("employee.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("employee.position"),
      dataIndex: "position",
      key: "position",
    },
    {
      title: t("employee.email"),
      dataIndex: "email",
      key: "email",
    },
    // Add more columns as needed
  ];

  const attendanceColumns = [
    {
      title: t("attendance.employeeName"),
      dataIndex: "employeeName",
      key: "employeeName",
      render: (_: any, record: AttendanceRecord) => {
        const emp = employees?.find((e) => e.id === record.employeeId);
        return emp ? emp.name : record.employeeId;
      },
    },
    {
      title: t("attendance.date"),
      dataIndex: "date",
      key: "date",
    },
    {
      title: t("attendance.status"),
      dataIndex: "status",
      key: "status",
    },
  ];

  const productivityColumns = [
    {
      title: t("productivity.employeeName"),
      dataIndex: "employeeName",
      key: "employeeName",
      render: (_: any, record: EmployeeProductivity) => {
        const emp = employees?.find((e) => e.id === record.employeeId);
        return emp
          ? emp.name || `${emp.firstName} ${emp.lastName}`
          : record.employeeId;
      },
    },
    { title: t("productivity.period"), dataIndex: "period", key: "period" },
    { title: t("productivity.output"), dataIndex: "output", key: "output" },
    {
      title: t("productivity.efficiency"),
      dataIndex: "efficiency",
      key: "efficiency",
      render: (val: number) => `${val}%`,
    },
  ];

  const scheduleColumns = [
    {
      title: t("schedule.employeeName"),
      dataIndex: "employeeName",
      key: "employeeName",
      render: (_: any, record: EmployeeSchedule) => {
        const emp = employees?.find((e) => e.id === record.employeeId);
        return emp
          ? emp.name || `${emp.firstName} ${emp.lastName}`
          : record.employeeId;
      },
    },
    { title: t("schedule.date"), dataIndex: "date", key: "date" },
    { title: t("schedule.shift"), dataIndex: "shift", key: "shift" },
    { title: t("schedule.notes"), dataIndex: "notes", key: "notes" },
    {
      title: t("common.actions"),
      key: "actions",
      render: (_: any, record: EmployeeSchedule) => (
        <div>
          <Button 
            type="link" 
            onClick={() => {
              setSelectedSchedule(record);
              setIsScheduleFormVisible(true);
            }}
          >
            {t("common.edit")}
          </Button>
          <Button 
            type="link" 
            danger
            onClick={() => showDeleteConfirm(record.id, record.employeeId)}
          >
            {t("common.delete")}
          </Button>
        </div>
      ),
    },
  ];

  const handleScheduleSubmit = (schedule: EmployeeSchedule) => {
    if (schedule.id) {
      const { id, ...scheduleData } = schedule;
      updateScheduleMutation.mutate({ id, schedule: scheduleData });
    } else {
      const { id, ...scheduleData } = schedule;
      createScheduleMutation.mutate(scheduleData);
    }
  };

  const handleAddSchedule = (date?: string) => {
    setSelectedSchedule(undefined);
    if (date) {
      setSelectedDate(date);
    }
    setIsScheduleFormVisible(true);
  };

  const showDeleteConfirm = (scheduleId: string, employeeId: string) => {
    Modal.confirm({
      title: t('schedule.confirmDelete'),
      content: t('schedule.deleteWarning'),
      okText: t('common.yes'),
      okType: 'danger',
      cancelText: t('common.no'),
      onOk() {
        deleteScheduleMutation.mutate({ id: scheduleId, employeeId });
      },
    });
  };

  const renderScheduleView = () => {
    if (scheduleViewMode === 'calendar') {
      return (
        <ScheduleCalendar
          schedules={schedules || []}
          employees={employees || []}
          onAddSchedule={(date) => {
            setSelectedDate(date);
            handleAddSchedule(date);
          }}
          onEditSchedule={(schedule) => {
            setSelectedSchedule(schedule);
            setIsScheduleFormVisible(true);
          }}
          onDeleteSchedule={(schedule) => showDeleteConfirm(schedule.id, schedule.employeeId)}
        />
      );
    }

    return (
      <>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => handleAddSchedule()}
          >
            {t('schedule.addSchedule')}
          </Button>
        </div>
        <Table
          columns={scheduleColumns}
          dataSource={schedules || []}
          loading={loadingSchedules}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </>
    );
  };

  return (
    <div>
      <Typography.Title level={2}>
        {t("employee.managementTitle")}
      </Typography.Title>
      <Tabs
        defaultActiveKey="employees"
        items={[
          {
            key: "employees",
            label: t("employee.tab.employees"),
            children: (
              <Table
                columns={employeeColumns}
                dataSource={employees || []}
                loading={isLoading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ),
          },
          {
            key: "attendance",
            label: t("employee.tab.attendance"),
            children: (
              <Table
                columns={attendanceColumns}
                dataSource={attendance || []}
                loading={loadingAttendance}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ),
          },
          {
            key: "productivity",
            label: t("employee.tab.productivity"),
            children: (
              <Table
                columns={productivityColumns}
                dataSource={productivity || []}
                loading={loadingProductivity}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ),
          },
          {
            key: "schedules",
            label: t("employee.tab.schedules"),
            children: (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button.Group>
                    <Button
                      type={scheduleViewMode === 'table' ? 'primary' : 'default'}
                      onClick={() => setScheduleViewMode('table')}
                    >
                      {t('schedule.viewTable')}
                    </Button>
                    <Button
                      type={scheduleViewMode === 'calendar' ? 'primary' : 'default'}
                      onClick={() => setScheduleViewMode('calendar')}
                    >
                      {t('schedule.viewCalendar')}
                    </Button>
                  </Button.Group>
                </div>
                {renderScheduleView()}
              </div>
            ),
          },
        ]}
      />

      {isScheduleFormVisible && employees && (
        <ScheduleForm
          visible={isScheduleFormVisible}
          onCancel={() => {
            setIsScheduleFormVisible(false);
            setSelectedSchedule(undefined);
          }}
          onSubmit={handleScheduleSubmit}
          initialValues={selectedSchedule ? {
            ...selectedSchedule
          } : selectedDate ? {
            id: '',
            employeeId: '',
            date: selectedDate,
            shift: 'morning',
            notes: ''
          } : undefined}
          employees={employees}
        />
      )}
    </div>
  );
}
