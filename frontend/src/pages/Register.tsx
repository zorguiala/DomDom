import { useState } from "react";
import { Card, Form, Input, Button, Alert, Typography, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const { Title } = Typography;

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);

    if (values.password !== values.confirmPassword) {
      setError(t("auth.passwordMismatch"));
      setIsSubmitting(false);
      return;
    }

    try {
      await register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(t("auth.registrationError"));
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "64px auto",
        padding: "0 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Title level={2}>{t("auth.register")}</Title>

      <Card style={{ width: "100%" }}>
        {error && (
          <Alert message={error} type="error" style={{ marginBottom: 24 }} />
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="firstName"
            label={t("auth.firstName")}
            rules={[{ required: true, message: t("auth.required") }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={t("auth.lastName")}
            rules={[{ required: true, message: t("auth.required") }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label={t("auth.email")}
            rules={[
              { required: true, message: t("auth.required") },
              { type: "email", message: t("auth.invalidEmail") },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label={t("auth.password")}
            rules={[{ required: true, message: t("auth.required") }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={t("auth.confirmPassword")}
            rules={[{ required: true, message: t("auth.required") }]}
          >
            <Input.Password />
          </Form.Item>

          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              block
            >
              {t("auth.signUp")}
            </Button>

            <Button type="link" onClick={() => navigate("/login")} block>
              {t("auth.alreadyHaveAccount")}
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
