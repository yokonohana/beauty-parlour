import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import '../../styles/auth.css';

export default function Login() {
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

  const onLogin = (data) => {
    navigate("/account");
    reset();
  };

  return (
    <div className="container">
      <h2 className="heading">Вход в приложение:</h2>

      <label htmlFor="email" className="label">Email:</label>
      <Controller
        control={control}
        name="email"
        rules={{ required: "Поле обязательно для заполнения" }}
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
        <button type="button" onClick={handleSubmit(onLogin)}>Войти</button>
        <button type="button" onClick={() => navigate("/registration")}>Регистрация</button>
      </div>
    </div>
  );
}
