import React from "react";
import "./ContactsPage.css";
import map from "./../../img/images/map.png"

const ContactsPage = () => {
  return (
    <div className="contacts-page">
      {/* Заголовок страницы */}
      <header className="contacts-header">
        <h1>Контактная информация</h1>
        <p>для связи с нами</p>
      </header>

      {/* Контактная информация */}
      <div className="contacts-container">
        {/* Карта */}
        <div className="map-section">
          <img
            src={map}
            alt="Карта расположения"
            className="map-image"
          />
        </div>

        {/* Информация о контактах */}
        <div className="info-section">
          <p className="info-text">
            <strong>Адрес:</strong> ул. Пушкина, д. Колотушкина, 12
          </p>
          <p className="info-text">
            <strong>Телефон:</strong> +7 (999) 999-99-99
          </p>
          <div className="working-hours">
            <p>Мы работаем каждый день с <strong>10:00 до 21:00</strong></p>
            <p>Запишитесь на приём, и мы будем рады видеть вас в нашем салоне.</p>
          </div>
          <p className="info-text">
            <strong>Email:</strong>{" "}
            <a href="mailto:bliss@gmail.com">bliss@gmail.com</a>
          </p>
        </div>
      </div>

      {/* Социальные сети */}
      <footer className="contacts-footer">
        <div className="social-icons">
          <a href="#" aria-label="Instagram">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="#" aria-label="Telegram">
            <i className="fab fa-telegram-plane"></i>
          </a>
          <a href="#" aria-label="WhatsApp">
            <i className="fab fa-whatsapp"></i>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ContactsPage;