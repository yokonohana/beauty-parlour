import React from "react";
import "./ServicesPage.css";
import nail from './../../img/images/ногти.png'
import lash from './../../img/images/ресницы.png'
import hair from './../../img/images/укладка.png'

const services = [
  {
    id: 1,
    title: "Забота о руках и ногах",
    description:
      "Уход за ногтями — наша страсть. Мы сделаем всё идеально: бережно, красиво и с вниманием к деталям.",
    image: nail, 
  },
  {
    id: 2,
    title: "Стрижки, укладки и уход",
    description:
      "Стрижка, окраска, завивка или укладка – приложим все усилия, чтобы вы выглядели безупречно и уходили с улыбкой.",
    image: hair, 
  },
  {
    id: 3,
    title: "Ресницы и брови",
    description:
      "Стремитесь к совершенству? Мы сделаем ваши брови и ресницы идеальными, подчеркнув вашу индивидуальность.",
    image: lash, 
  },
];

const ServicesPage = () => {
  return (
    <div className="services-page">
      <h1 className="services-header">Цена на наши УСЛУГИ</h1>
      <p className="services-subheader">
        всё, что мы предлагаем, и наши расценки
      </p>

      <div className="services-list">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            {/* Картинка услуги */}
            <img
              src={service.image}
              alt={service.title}
              className="service-image"
            />

            {/* Текстовый блок */}
            <div className="service-text">
              <h2 className="service-title">{service.title}</h2>
              <p className="service-description">{service.description}</p>
              <button className="service-button">Подробнее</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;