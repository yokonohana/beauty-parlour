import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../header/header';
import '../../styles/booking.css';

const WEEK_DAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель',
  'Май', 'Июнь', 'Июль', 'Август',
  'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function generateCalendar(year, monthIndex) {
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const firstWeekdayRaw = new Date(year, monthIndex, 1).getDay(); 
  const firstWeekday = firstWeekdayRaw === 0 ? 6 : firstWeekdayRaw - 1; 

  const daysArray = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const wdRaw = new Date(year, monthIndex, d).getDay();
    const wd = wdRaw === 0 ? 6 : wdRaw - 1;
    daysArray.push({ day: d, weekday: wd });
  }
  return { days: daysArray, offset: firstWeekday };
}

export default function BookingWidget() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get('category') || '';

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [masters, setMasters] = useState([]);
  const [selectedMasterId, setSelectedMasterId] = useState(null);
  const [availability, setAvailability] = useState({});   

  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    if (!category) {
      setMasters([]);
      return;
    }

    fetch(`/api/masters?category=${encodeURIComponent(category)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Ошибка загрузки мастеров');
        return res.json();
      })
      .then((data) => {
        setMasters(data);
        setSelectedMasterId(null);
        setSelectedDay(null);
        setSelectedTime('');
      })
      .catch((err) => {
        console.error('Ошибка при fetch /api/masters:', err);
        setMasters([]);
      });
  }, [category]);

  useEffect(() => {
    if (!selectedMasterId) {
      setAvailability({});
      setSelectedDay(null);
      setSelectedTime('');
      return;
    }
    const year = currentYear;
    const month = String(currentMonth + 1).padStart(2, '0');

    fetch(`/api/availability?masterId=${selectedMasterId}&year=${year}&month=${month}`)
      .then((res) => {
        if (!res.ok) throw new Error('Ошибка загрузки availability');
        return res.json();
      })
      .then((data) => {
        setAvailability(data);
        setSelectedDay(null);
        setSelectedTime('');
      })
      .catch((err) => {
        console.error('Ошибка при fetch /api/availability:', err);
        setAvailability({});
      });
  }, [selectedMasterId, currentYear, currentMonth]);

  if (!category) {
    return (
      <div className="booking-widget-wrapper">
        <Header />
        <div className="booking-widget">
          <h1 className="bw-title">Запись на приём</h1>
          <p className="bw-subtitle">Категория не указана</p>
          <p className="bw-info">Пожалуйста, выберите услугу в разделе «Услуги и цены».</p>
        </div>
      </div>
    );
  }
  if (masters.length === 0) {
    return (
      <div className="booking-widget-wrapper">
        <Header />
        <div className="booking-widget">
          <h1 className="bw-title">Запись на приём</h1>
          <p className="bw-subtitle">Категория: «{category}»</p>
          <p className="bw-info">В данной категории ещё нет мастеров.</p>
        </div>
      </div>
    );
  }
  const { days, offset } = generateCalendar(currentYear, currentMonth);
  const availableDatesInMonth = new Set(
    Object.keys(availability)
      .filter((dateStr) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        return y === currentYear && m - 1 === currentMonth;
      })
      .map((dateStr) => {
        const parts = dateStr.split('-').map(Number);
        return parts[2];
      })
  );

  const handleDayClick = (day) => {
    if (availableDatesInMonth.has(day)) {
      setSelectedDay(day);
      setSelectedTime('');
    }
  };

  const selectedDateKey = selectedDay
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : '';

  const timeOptionsForSelectedDay = selectedDay && availability[selectedDateKey]
    ? availability[selectedDateKey]
    : [];

  return (
    <div className="booking-widget-wrapper">
      <Header />

      <div className="booking-widget">
        <h1 className="bw-title">Запись на приём</h1>
        <p className="bw-subtitle">Категория: «{category}»</p>

        <div className="bw-field">
          <label htmlFor="master-select">Мастер:</label>
          <select
            id="master-select"
            className="bw-select"
            value={selectedMasterId || ''}
            onChange={(e) => setSelectedMasterId(e.target.value || null)}
          >
            <option value="">— Выберите мастера —</option>
            {masters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {!selectedMasterId && (
          <p className="bw-info">Сначала выберите мастера в категории «{category}».</p>
        )}

        {selectedMasterId && (
          <>
            <div className="bw-worktime">Время работы: 09:00–17:00</div>

            <div className="bw-calendar">
              <div className="bw-month-header">
                {MONTHS[currentMonth]} {currentYear}
              </div>

              <div className="bw-weekdays">
                {WEEK_DAYS.map((wd) => (
                  <div key={wd} className="bw-weekday-cell">{wd}</div>
                ))}
              </div>

              <div className="bw-days-grid">
                {Array.from({ length: offset }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="bw-day-cell bw-day-empty" />
                ))}

                {days.map(({ day }) => {
                  const isAvailable = availableDatesInMonth.has(day);
                  const isSelected = day === selectedDay;
                  const cellClasses = ['bw-day-cell'];
                  if (isAvailable) cellClasses.push('bw-day-available');
                  if (isSelected) cellClasses.push('bw-day-selected');

                  return (
                    <button
                      key={day}
                      className={cellClasses.join(' ')}
                      disabled={!isAvailable}
                      onClick={() => handleDayClick(day)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="bw-dropdowns">
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
                      ? timeOptionsForSelectedDay.length
                        ? '— Выберите время —'
                        : 'Нет слотов'
                      : 'Сначала выберите дату'}
                  </option>
                  {timeOptionsForSelectedDay.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            {selectedDay && selectedTime && (
              <button
                className="bw-button"
                onClick={() => {
                  const masterObj = masters.find((m) => m.id === Number(selectedMasterId));
                  alert(
                    `Вы записаны к мастеру ${masterObj.name} на ${currentYear}-${
                      String(currentMonth + 1).padStart(2, '0')
                    }-${String(selectedDay).padStart(2, '0')} в ${selectedTime}`
                  );
                }}
              >
                Запись
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
