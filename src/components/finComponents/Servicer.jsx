import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // для перехода на страницу записи
import Header from '../header/header';
import '../../styles/servicer.css';

const categories = [
  'Маникюр и педикюр',
  'Стрижки и укладки',
  'Ресницы и брови'
];

const descriptions = {
  'Маникюр и педикюр': 'Уход за руками и ногами, стильный маникюр и педикюр на любой вкус.',
  'Стрижки и укладки': 'Профессиональные стрижки, укладки и уход за волосами.',
  'Ресницы и брови': 'Оформление, ламинирование и окрашивание ресниц и бровей.'
};

export default function Services() {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [servicesData, setServicesData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // хук для перехода

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        setServicesData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка загрузки данных:', err);
        setLoading(false);
      });
  }, []);

  // Обработчик клика по кнопке «Записаться»
  const handleBookClick = () => {
    // При переходе передаём выбранную категорию в query-параметр
    navigate(`/booking`);
  };

  return (
    <div className="services-page">
      <Header />
      <div className="services-background">
        <div className="services-container">
          <h1 className="services-title">Услуги и стоимость</h1>

          <div className="services-tabs">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`tab-button ${activeCategory === category ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="category-description">
            {descriptions[activeCategory]}
          </div>

          {/* Кнопка «Записаться к мастеру» */}
          <div className="book-button-wrapper">
            <button 
              className="book-button" 
              onClick={handleBookClick}
            >
              Записаться к мастеру
            </button>
          </div>

          {loading ? (
            <p>Загрузка данных...</p>
          ) : (
            <div className="services-category-block">
              {Object.entries(servicesData)
                .filter(([subcategory]) => {
                  if (activeCategory === 'Маникюр и педикюр') {
                    return ['Маникюр', 'Педикюр', 'Комплексные услуги'].includes(subcategory);
                  } else if (activeCategory === 'Стрижки и укладки') {
                    return ['Стрижка и укладка', 'Окрашивание'].includes(subcategory);
                  } else if (activeCategory === 'Ресницы и брови') {
                    return ['Ресницы', 'Брови'].includes(subcategory);
                  }
                  return false;
                })
                .map(([subcategory, services]) => (
                  <div key={subcategory} className="subcategory-block">
                    <h2 className="subcategory-title">{subcategory}</h2>
                    <table className="services-table">
                      <thead>
                        <tr>
                          <th>Услуга</th>
                          <th>Цена в рублях</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(services) && services.map(service => (
                          <tr key={service.id}>
                            <td>
                              <div className="service-name">{service.name}</div>
                              {service.description && (
                                <div className="service-desc">{service.description}</div>
                              )}
                            </td>
                            <td>
                              {service.price} ₽{' '}
                              {service.note && <span className="service-note">({service.note})</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}