import React from 'react';
import { Link } from 'react-router-dom';
import logo from './../../img/icons/logo.svg';
import './header.css';

function Header() {
  return (
    <header>
      <div className="container">
        <div className='header'>
          <div className='header__row'>
            <nav className='nav'>
              <ul>
                <li><Link to="/services" className="nav-link">Услуги и цены</Link></li>
                <li><Link to="/promotions" className="nav-link">Акции</Link></li>
                <li><Link to="/reviews" className="nav-link">Отзывы</Link></li>
                <li><Link to="/gallery" className="nav-link">Галерея</Link></li>
                <li className="logo">
                  <img src={logo} alt="Logo" />
                </li>
                <li><Link to="/contacts" className="nav-link">Контакты</Link></li>
                <li className="auth-buttons">
                  <Link to="/auth" className="button login-button">Вход</Link>
                  <Link to="/registration" className="button register-button">Регистрация</Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
