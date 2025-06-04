import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";
import "../../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onLogin = async (data) => {
    try {
      const response = await fetch("https://beauty-parlour.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const text = await response.text();
        let resData;
        try {
          resData = JSON.parse(text);
        } catch {
          throw new Error("Ошибка входа: пустой или невалидный JSON-ответ");
        }
        throw new Error(resData.error || "Ошибка входа");
      }

      setToastMessage("Вход выполнен успешно!");
      setTimeout(() => {
        navigate("/Home");
      }, 1500);
    } catch (err) {
      console.error(err);
      setToastMessage(err.message || "Ошибка входа");
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <h2>ВХОД</h2>

        {renderInput("Электронная почта", "email", control, errors, {
          required: "Поле обязательно для заполнения",
          pattern: {
            value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
            message: "Неверный формат email",
          },
        }, "email")}

        {renderInput("Пароль", "password", control, errors, {
          required: "Поле обязательно для заполнения",
        }, "password")}

        <div className="btn">
          <button type="button" onClick={handleSubmit(onLogin)}>ВОЙТИ</button>
        </div>

        <p className="description" style={{ marginTop: "16px", textAlign: "center", textDecoration: "underline", cursor: "pointer" }}>
          Забыли пароль?
        </p>
      </div>
      
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
}

function renderInput(label, name, control, errors, rules, type = "text") {
  return (
    <>
      <label htmlFor={name} className="label">{label}</label>
      <div className="input-wrapper">
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field }) => (
            <input
              id={name}
              type={type}
              placeholder={label}
              {...field}
              className="input"
            />
          )}
        />
        {errors[name] && (
          <span className="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          </span>
        )}
      </div>
    </>
  );
}