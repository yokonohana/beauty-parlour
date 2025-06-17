import React, { useEffect, useState } from 'react';
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

  const [appointments, setAppointments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contactRes = await fetch('/api/contacts', {
          headers: { 'x-user-id': userId }
        });

        if (!contactRes.ok) throw new Error(`Ошибка профиля: ${contactRes.status}`);
        const contactData = await contactRes.json();

        setFormData({
          name: contactData.name || '',
          last_name: contactData.last_name || '',
          email: contactData.email || '',
          phone: contactData.phone || '',
          password: ''
        });
      } catch (error) {
        console.error('Ошибка профиля:', error);
        setToastMessage('Не удалось загрузить данные');
      }
    };

    const fetchAppointments = async () => {
      try {
        const res = await fetch('/api/user/appointments', {
          headers: {
            'x-user-id': userId
          }
        });
        if (!res.ok) throw new Error('Ошибка получения записей');
        const data = await res.json();
        const upcoming = data.filter(app =>
          new Date(app.appointment_data) > new Date()
        );
        setAppointments(upcoming);
      } catch (error) {
        console.error('Ошибка записей:', error);
        setToastMessage('Не удалось загрузить записи');
      }
    };

    if (userId) {
      fetchData();
      fetchAppointments();
    } else {
      setToastMessage('Вы не авторизованы');
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/contacts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(formData)
      });

      setToastMessage(res.ok ? 'Данные обновлены' : 'Ошибка при обновлении');
    } catch (err) {
      console.error('Ошибка при обновлении:', err);
      setToastMessage('Ошибка сервера при обновлении');
    }
  };

  const handleCancel = async (id) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      });

      if (!res.ok) throw new Error('Ошибка при отмене');

      setAppointments(prev => prev.filter(a => a.id !== id));
      setToastMessage('Запись отменена');
    } catch (err) {
      console.error('Ошибка при удалении', err);
      setToastMessage('Ошибка при отмене записи');
    }
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
              onClick={() => setShowPassword(prev => !prev)}
              aria-label="Показать/скрыть пароль"
            >
              {showPassword ? <FaEyeSlash color="#333" size={18} /> : <FaEye color="#333" size={18} />}
            </button>
          </div>

          <button type="submit" className="contact-button">Изменить</button>
        </form>

        {/* ——— Записи ——— */}
        <div className="appointments-container">
          {appointments.length > 0 ? (
            appointments.map(app => (
              <div className="appointment-card" key={app.id}>
                <div className="appointment-date">
                  {new Date(app.appointment_data).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }).toUpperCase()} &bull; {new Date(app.appointment_data).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="appointment-info">
                  <span className="appointment-master">{app.master_name}</span>
                  <span className="appointment-service">{app.service_name}</span>
                  <span className="appointment-price">{app.price} ₽</span>
                </div>
                <button
                  className="cancel-button"
                  onClick={() => handleCancel(app.id)}
                  title="Отменить запись"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <p className="no-appointments">Нет записей</p>
          )}
        </div>
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </>
  );
}
