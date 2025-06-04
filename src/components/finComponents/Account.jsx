import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Header from '../header/header';
import Toast from './Toast';
import '../../styles/account.css';

export default function ContactInfo() {
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://beauty-parlour.onrender.com/api/contacts');
        if (!res.ok) throw new Error(`Ошибка сети: ${res.status}`);
        const data = await res.json();

        setFormData({
          name: data.name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          password: ''
        });
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        setToastMessage('Не удалось загрузить данные');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://beauty-parlour.onrender.com/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setToastMessage('Данные успешно обновлены');
      } else {
        setToastMessage('Ошибка при обновлении данных');
      }
    } catch (err) {
      console.error('Ошибка при обновлении:', err);
      setToastMessage('Ошибка сервера при обновлении');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <>
      <Header />
      <div className="contact-page">
        <form className="contact-form" onSubmit={handleSubmit}>
          <h2 className="contact-title">Личные данные</h2>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Имя"
            className="contact-input"
          />
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Фамилия"
            className="contact-input"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="contact-input"
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Телефон"
            className="contact-input"
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Новый пароль"
              className="contact-input password-input"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={togglePasswordVisibility}
              aria-label="Показать/скрыть пароль"
            >
              {showPassword ? <FaEyeSlash color="#333" size={18} /> : <FaEye color="#333" size={18} />}
            </button>
          </div>

          <button type="submit" className="contact-button">Изменить</button>
        </form>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}
    </>
  );
}
