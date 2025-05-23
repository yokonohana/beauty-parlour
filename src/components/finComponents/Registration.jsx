import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import '../../styles/auth.css';

export default function Register() {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onRegister = (data) => {
    reset();
    navigate("/auth");
  };

  return (
    <div className="container">
      <h2 className="heading">Регистрация:</h2>

      <label htmlFor="email" className="label">Email:</label>
      <Controller
        control={control}
        name="email"
        rules={{
          required: "Поле обязательно для заполнения",
          pattern: {
            value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
            message: "Неверный формат email",
          },
        }}
        render={({ field }) => (
          <input
            id="email"
            type="email"
            placeholder="example@gmail.com"
            {...field}
            className="input"
          />
        )}
      />
      {errors.email && <p className="error">{errors.email.message}</p>}

      <label htmlFor="password" className="label">Пароль:</label>
      <Controller
        control={control}
        name="password"
        rules={{ required: "Поле обязательно для заполнения" }}
        render={({ field }) => (
          <input
            id="password"
            type="password"
            placeholder="Введите пароль"
            {...field}
            className="input"
          />
        )}
      />
      {errors.password && <p className="error">{errors.password.message}</p>}

      <div className="btn">
        <button type="button" onClick={() => navigate("/auth")}>Войти</button>
        <button type="button" onClick={handleSubmit(onRegister)}>Зарегистрироваться</button>
      </div>
    </div>
  );
}
