import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";
import "../../styles/registration.css";

export default function Register() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      last_name: "",
      phone: "",
      email: "",
      password: "",
    },
  });

  const onRegister = async (data) => {
    try {
      const response = await fetch("https://beauty-parlour.onrender.com/api/auth/register", {
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
          throw new Error("Ошибка регистрации: пустой или невалидный JSON-ответ");
        }
        throw new Error(resData.error || "Ошибка регистрации");
      }

      setToastMessage("Регистрация прошла успешно!");
      setTimeout(() => {
        navigate("/auth");
      }, 1500);
    } catch (err) {
      console.error("Ошибка регистрации:", err.message);
      setToastMessage(err.message || "Ошибка при регистрации");
    }
  };

  return (
    <div className="register-page">
      <div className="container">
        <h2>Регистрация</h2>
        {renderInput("Имя", "name", control, errors, { required: true })}
        {renderInput("Фамилия", "last_name", control, errors, { required: true })}
        {renderInput("Номер телефона", "phone", control, errors, {
          required: true,
          pattern: {
            value: /^[0-9+()\s-]{7,}$/,
            message: "Некорректный номер телефона",
          },
        })}
        {renderInput("Электронная почта", "email", control, errors, {
          required: true,
          pattern: {
            value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
            message: "Неверный формат email",
          },
        }, "email")}
        {renderInput("Пароль", "password", control, errors, {
          required: true,
        }, "password")}

        <div className="btn">
          <button type="button" onClick={handleSubmit(onRegister)}>
            Зарегистрироваться
          </button>
        </div>
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
      <label htmlFor={name} className="label">
        {label}
      </label>
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="red"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
