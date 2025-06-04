// src/components/BookingPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../header/header';
import '../../styles/gallery.css';

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Состояния
  const [date, setDate] = useState(null);
  const [availability, setAvailability] = useState([]); // [{ masterId, masterName, slots: [ '09:00', ... ] }, …]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedMasterId, setSelectedMasterId] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Читаем category из URL-параметров (?category=…)
  const params = new URLSearchParams(location.search);
  const category = params.get('category'); // Например: "Маникюр и педикюр"

  // 1) Как только category и date появились — синхронизируем URL (чтобы было ?category=…&date=…)
  useEffect(() => {
    if (category && date) {
      const encodedCat = encodeURIComponent(category);
      const encodedDt = encodeURIComponent(date);
      navigate(`/booking?category=${encodedCat}&date=${encodedDt}`, { replace: true });
    }
  }, [category, date, navigate]);

  // 2) При изменении location.search и появлении в нём date — загружаем доступность
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const urlDate = query.get('date');

    if (!category) {
      return; // без категории не запрашиваем ничего
    }
    if (!urlDate) {
      setAvailability([]);
      setLoading(false);
      return;
    }

    // Запрос к API
    setLoading(true);
    setError(null);
    setAvailability([]);
    setSelectedMasterId('');
    setSelectedTime('');

    fetch(`/api/availability?category=${encodeURIComponent(category)}&date=${encodeURIComponent(urlDate)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // data — массив: [{ masterId, masterName, slots: [ '09:00', '09:30', … ] }, …]
        setAvailability(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка при получении доступности:', err);
        setError('Не удалось получить доступные слоты. Попробуйте позже.');
        setLoading(false);
      });
  }, [category, location.search]);

  // Получаем сегодня (в формате YYYY-MM-DD) для фильтра «только будущее время»
  const todayString = new Date().toISOString().slice(0, 10);

  // Когда меняется selectedMasterId, сбрасываем выбранное время
  useEffect(() => {
    setSelectedTime('');
  }, [selectedMasterId]);

  // Собираем варианты мастеров (у которых есть slots.length > 0)
  const mastersWithSlots = availability.filter((item) => item.slots && item.slots.length > 0);

  // Находим объект выбранного мастера
  const chosenMasterObj = mastersWithSlots.find((m) => String(m.masterId) === selectedMasterId);

  // Варианты времени для выбранного мастера
  let timeOptions = [];
  if (chosenMasterObj) {
    if (date === todayString) {
      // Фильтруем слоты, оставляя только те, что идут позже текущего времени
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      timeOptions = chosenMasterObj.slots.filter((slot) => {
        // slot формат 'HH:MM'
        const [hh, mm] = slot.split(':').map(Number);
        const slotMinutes = hh * 60 + mm;
        return slotMinutes > currentMinutes;
      });
    } else {
      timeOptions = chosenMasterObj.slots.slice(); // все слоты, если дата не сегодня
    }
  }

  return (
    <div className="booking-page-container">
      <Header />

      <div className="booking-widget">
        <h1 className="bw-title">Запись на приём</h1>
        <p className="bw-subtitle">Выберите дату и мастера</p>

        {/* Если категории нет — подсказка */}
        {!category && (
          <p className="bw-info">Категория не указана. Перейдите из раздела «Услуги и цены».</p>
        )}

        {/* Выбор даты */}
        <div className="bw-field">
          <label htmlFor="booking-date">Дата:</label>
          <input
            id="booking-date"
            type="date"
            value={date || ''}
            onChange={(e) => setDate(e.target.value)}
            className="bw-input"
          />
        </div>

        {/* Если дата указана и идёт загрузка */}
        {date && loading && <p className="bw-info">Загрузка доступных слотов…</p>}

        {/* Если дата указана и есть ошибка */}
        {date && !loading && error && <p className="bw-error">{error}</p>}

        {/* Если дата указана, загрузка прошла, но мастеров нет */}
        {date && !loading && !error && mastersWithSlots.length === 0 && (
          <p className="bw-info">
            К сожалению, нет доступных слотов на {date} для категории «{category}».
          </p>
        )}

        {/* Если есть мастера с доступными слотами — выводим селекты */}
        {date && !loading && !error && mastersWithSlots.length > 0 && (
          <>
            {/* Селект «Мастер» */}
            <div className="bw-field">
              <label htmlFor="master-select">Мастер:</label>
              <select
                id="master-select"
                value={selectedMasterId}
                onChange={(e) => setSelectedMasterId(e.target.value)}
                className="bw-select"
              >
                <option value="">— Выберите мастера —</option>
                {mastersWithSlots.map((m) => (
                  <option key={m.masterId} value={m.masterId}>
                    {m.masterName}
                  </option>
                ))}
              </select>
            </div>

            {/* Селект «Время» */}
            <div className="bw-field">
              <label htmlFor="time-select">Время:</label>
              <select
                id="time-select"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={!selectedMasterId || timeOptions.length === 0}
                className="bw-select"
              >
                <option value="">
                  {timeOptions.length === 0
                    ? 'Нет доступного времени'
                    : '— Выберите время —'}
                </option>
                {timeOptions.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Здесь вы можете добавить кнопку «Подтвердить запись» */}
        {/* Например: */}
        {date && !loading && !error && selectedMasterId && selectedTime && (
          <button
            className="bw-button"
            onClick={() => {
              // ваша логика подтверждения, например POST /api/appointments
              alert(
                `Запись к мастеру ${chosenMasterObj.masterName} на ${date} в ${selectedTime}`
              );
            }}
          >
            Записаться
          </button>
        )}
      </div>
    </div>
  );
}
