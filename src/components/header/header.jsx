import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './../../img/icons/logo.svg';
import './header.css';

function Header() {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }

    const handleStorageChange = () => {
      const updatedName = localStorage.getItem('userName');
      setUserName(updatedName || '');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userLastName');
    setUserName('');
    navigate('/'); // ← переход на главную страницу
  };

  return (
    <header>
      <div className="container">
        <div className="header">
          <div className="header__row">
            <nav className="nav">
              <ul>
                <li><Link to="/services" className="nav-link">Услуги и цены</Link></li>
                <li><Link to="/promotions" className="nav-link">Акции</Link></li>
                <li><Link to="/reviews" className="nav-link">Отзывы</Link></li>
                <li><Link to="/gallery" className="nav-link">Галерея</Link></li>
                <li className="logo">
                  <Link to="/home" className="nav-link">
                    <img src={logo} alt="Logo" />
                  </Link>
                </li>
                <li><Link to="/contacts" className="nav-link">Контакты</Link></li>
                <li className="auth-buttons">
                  {userName ? (
                    <div className="user-block">
                      <div className="user-info">
                        <div className="user-icon-circle">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V22h19.2v-2.8c0-3.2-6.4-4.8-9.6-4.8z"/>
                          </svg>
                        </div>
                        <span className="user-name">{userName}</span>
                      </div>
                      <button className="button logout-button" onClick={handleLogout}>
                        Выйти
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link to="/auth" className="button login-button">Вход</Link>
                      <Link to="/registration" className="button register-button">Регистрация</Link>
                    </>
                  )}
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
