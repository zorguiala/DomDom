import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Select, Button, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { EmployeeSchedule } from '../../types/employee-schedule';
import { Employee } from '../../types/employee';
import dayjs from 'dayjs';

const { Option } = Select;

interface ScheduleFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (schedule: EmployeeSchedule) => void;
  initialValues?: EmployeeSchedule;
  employees: Employee[];
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  employees,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>(
    initialValues?.employeeId
  );

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: initialValues.date ? dayjs(initialValues.date) : undefined,
      });
      setSelectedEmployee(initialValues.employeeId);
    } else {
      form.resetFields();
      setSelectedEmployee(undefined);
    }
  }, [initialValues, form, visible]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const schedule: EmployeeSchedule = {
        id: initialValues?.id || '',
        employeeId: values.employeeId,
        date: values.date.format('YYYY-MM-DD'),
        shift: values.shift,
        notes: values.notes,
      };
      onSubmit(schedule);
      form.resetFields();
    });
  };

  const shiftOptions = [
    { value: 'morning', label: t('schedule.shifts.morning') },
    { value: 'afternoon', label: t('schedule.shifts.afternoon') },
    { value: 'night', label: t('schedule.shifts.night') },
  ];

  return (
    <Modal
      open={visible}
      title={initialValues ? t('schedule.editSchedule') : t('schedule.addSchedule')}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t('common.cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {t('common.save')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          employeeId: selectedEmployee,
          date: initialValues?.date ? dayjs(initialValues.date) : undefined,
          shift: initialValues?.shift || 'morning',
          notes: initialValues?.notes || '',
        }}
      >
        <Form.Item
          name="employeeId"
          label={t('schedule.employee')}
          rules={[{ required: true, message: t('validation.required') }]}
        >
          <Select
            placeholder={t('schedule.selectEmployee')}
            onChange={(value) => setSelectedEmployee(value)}
          >
            {employees.map((employee) => (
              <Option key={employee.id} value={employee.id}>
                {employee.name || `${employee.firstName} ${employee.lastName}`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="date"
          label={t('schedule.date')}
          rules={[{ required: true, message: t('validation.required') }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="shift"
          label={t('schedule.shift')}
          rules={[{ required: true, message: t('validation.required') }]}
        >
          <Select placeholder={t('schedule.selectShift')}>
            {shiftOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="notes" label={t('schedule.notes')}>
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
