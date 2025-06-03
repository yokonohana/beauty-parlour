import React from 'react';
import '../../styles/promotions.css';
import Header from '../header/header';
import promoSpecial1 from '../../img/promotion1.png';
import promoSpecial2 from '../../img/promotion2.png';
import promoSpecial3 from '../../img/promotion3.png';
import promoSpecial4 from '../../img/promotion4.png';

export default function Promotions() {
  const promotionsData = [
    {
      id: 1,
      title: 'Скидка 20% на первое посещение',
      description: 'Только для новых клиентов действует скидка на любые услуги салона',
      image: promoSpecial1,
    },
    {
      id: 2,
      title: 'Маникюр + педикюр всего за 3000₽',
      description: 'Комплексный уход по выгодной цене, только до конца месяца!',
      image: promoSpecial2,
    },
    {
      id: 3,
      title: 'Стрижка и окрашивание – 30% скидка',
      description: 'Предложение действительно в будние дни с 10:00 до 13:00',
      image: promoSpecial3,
    },
    {
      id: 4,
      title: 'Новая акция “Шикарная прическа”',
      description: 'Получите бесплатную укладку при любом окрашивании волос',
      image: promoSpecial4,
    },
  ];

  return (
    <>
      <Header />

      <div className="promotions-page">
        <div className="promotions-container">
          <div className="promotions-header">
            <h1 className="promotions-title">Акции</h1>
            <p className="promotions-subtitle">
              Специальные предложения от студии BLISS
            </p>
          </div>

          <div className="promotions-list">
            {promotionsData.map((promo) => (
              <div key={promo.id} className="promo-card">
                <div className="promo-card__text">
                  <h2 className="promo-card__title">{promo.title}</h2>
                  <p className="promo-card__description">{promo.description}</p>
                  <button className="promo-card__button">Подробнее</button>
                </div>
                <div className="promo-card__image-wrapper">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="promo-card__image"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
