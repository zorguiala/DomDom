import { Space } from "antd";
import { useTranslation } from "react-i18next";
import { EmployeeManagement } from "../components/employee/employee-management";

export default function Employees() {
  const { t } = useTranslation();

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <EmployeeManagement />
    </Space>
  );
}
