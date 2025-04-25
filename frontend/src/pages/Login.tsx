import { useState } from "react";
import { Card, Form, Input, Button, Alert, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [form] = Form.useForm();

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      setError("");
      await login(values.email, values.password);
      // Use replace: true to prevent going back to login page
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(t("auth.invalidCredentials"));
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Card style={{ maxWidth: 400, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={2}>{t("auth.login")}</Title>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: t("auth.emailRequired"),
              },
              {
                type: "email",
                message: t("auth.invalidEmail"),
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t("auth.email")}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: t("auth.passwordRequired"),
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t("auth.password")}
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              {t("auth.login")}
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text>
              {t("auth.noAccount")}{" "}
              <Link to="/register">{t("auth.register")}</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}
