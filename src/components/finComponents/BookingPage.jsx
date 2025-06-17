import React, { useEffect, useState } from 'react';
import Header from '../header/header';
import Toast from './Toast';
import '../../styles/booking.css';

const WEEK_DAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function generateCalendar(year, monthIndex) {
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysArray = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const weekday = new Date(year, monthIndex, d).getDay();
    const weekdayIndex = weekday === 0 ? 6 : weekday - 1;
    daysArray.push({ day: d, weekday: weekdayIndex });
  }

  return { days: daysArray, offset };
}

export default function BookingWidget() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [groupedServices, setGroupedServices] = useState({});
  const [flatServices, setFlatServices] = useState([]);
  const [procedureId, setProcedureId] = useState('');
  const [masters, setMasters] = useState([]);
  const [selectedMasterId, setSelectedMasterId] = useState(null);
  const [availability, setAvailability] = useState({});
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedTimes, setBookedTimes] = useState({});
  const [toast, setToast] = useState({ show: false, message: '' });

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setGroupedServices(data);
        setFlatServices(Object.values(data).flat());
      })
      .catch(() => {
        setGroupedServices({});
        setFlatServices([]);
      });
  }, []);

  useEffect(() => {
    if (!procedureId || flatServices.length === 0) return;
    const selected = flatServices.find(s => String(s.id) === String(procedureId));
    if (!selected?.category) return;

    fetch(`/api/masters?category=${encodeURIComponent(selected.category)}`)
      .then(res => res.json())
      .then(setMasters)
      .catch(() => setMasters([]));
  }, [procedureId, flatServices]);

  useEffect(() => {
    if (!selectedMasterId) return;
    const year = currentYear;
    const month = String(currentMonth + 1).padStart(2, '0');

    fetch(`/api/availability?masterId=${selectedMasterId}&year=${year}&month=${month}`)
      .then(res => res.json())
      .then(setAvailability)
      .catch(() => setAvailability({}));
  }, [selectedMasterId, currentYear, currentMonth]);

  const { days, offset } = generateCalendar(currentYear, currentMonth);
  const selectedDateKey = selectedDay
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : '';

  const availableDatesInMonth = new Set(
    Object.keys(availability)
      .filter(date => {
        const [y, m] = date.split('-').map(Number);
        return y === currentYear && m - 1 === currentMonth;
      })
      .map(date => Number(date.split('-')[2]))
  );

  const timeOptions = selectedDay && availability[selectedDateKey]
    ? availability[selectedDateKey]
        .filter((_, i) => i % 4 === 0)
        .filter(time => !(bookedTimes[selectedDateKey] || []).includes(time))
    : [];

  const handleDayClick = (day) => {
    if (availableDatesInMonth.has(day)) {
      setSelectedDay(day);
      setSelectedTime('');
    }
  };

  const handleBooking = async () => {
    if (!userId) {
      setToast({ show: true, message: 'Пожалуйста, войдите или зарегистрируйтесь для записи' });
      return;
    }

    const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          masterId: Number(selectedMasterId),
          serviceId: Number(procedureId),
          date,
          time: selectedTime
        })
      });

      if (!res.ok) throw new Error();

      setBookedTimes(prev => ({
        ...prev,
        [date]: [...(prev[date] || []), selectedTime]
      }));

      setToast({ show: true, message: 'Вы успешно записаны!' });
      setSelectedTime('');
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Ошибка при записи. Попробуйте позже' });
    }
  };

  return (
    <div className="booking-widget-wrapper">
      <Header />
      <div className="booking-widget">
        <h1 className="bw-title">Запись на приём</h1>

        <div className="bw-field">
          <label htmlFor="procedure-select">Процедура:</label>
          <select
            id="procedure-select"
            className="bw-select"
            value={procedureId}
            onChange={(e) => setProcedureId(e.target.value)}
          >
            <option value="">— Выберите процедуру —</option>
            {Object.entries(groupedServices).map(([subcategory, items]) => (
              <optgroup key={subcategory} label={subcategory}>
                {items.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {procedureId && (
          <div className="bw-field">
            <label htmlFor="master-select">Мастер:</label>
            <select
              id="master-select"
              className="bw-select"
              value={selectedMasterId || ''}
              onChange={(e) => setSelectedMasterId(e.target.value || null)}
            >
              <option value="">— Выберите мастера —</option>
              {masters.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        )}

        {selectedMasterId && (
          <>
            <div className="bw-calendar">
              <div className="bw-month-header">{MONTHS[currentMonth]} {currentYear}</div>
              <div className="bw-weekdays">
                {WEEK_DAYS.map(day => (
                  <div key={day} className="bw-weekday-cell">{day}</div>
                ))}
              </div>
              <div className="bw-days-grid">
                {Array.from({ length: offset }).map((_, i) => (
                  <div key={`empty-${i}`} className="bw-day-cell bw-day-empty" />
                ))}
                {days.map(({ day }) => {
                  const isAvailable = availableDatesInMonth.has(day);
                  const isSelected = selectedDay === day;
                  const classList = ['bw-day-cell'];
                  if (isAvailable) classList.push('bw-day-available');
                  if (isSelected) classList.push('bw-day-selected');

                  return (
                    <button
                      key={day}
                      className={classList.join(' ')}
                      disabled={!isAvailable}
                      onClick={() => handleDayClick(day)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bw-field">
              <label htmlFor="time-select">Время:</label>
              <select
                id="time-select"
                className="bw-select"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={!selectedDay}
              >
                <option value="">
                  {selectedDay
                    ? timeOptions.length ? '— Выберите время —' : 'Нет доступных слотов'
                    : 'Сначала выберите дату'}
                </option>
                {timeOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {selectedDay && selectedTime && procedureId && (
              <button className="bw-button" onClick={handleBooking}>
                Записаться
              </button>
            )}
          </>
        )}

        {toast.show && (
          <Toast message={toast.message} onClose={() => setToast({ show: false, message: '' })} />
        )}
      </div>
    </div>
  );
}
