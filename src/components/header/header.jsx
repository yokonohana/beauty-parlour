import logo from './../../img/icons/logo.svg'
import './header.css'

function Header () {
    return (
        <header>
            <div className="container">
                <div className='header'>
                <div className='header__row'>
                    <nav className='nav'>
                        <ul>
                        <a href="/services" className="nav-link">Услуги и цены</a>
                        <a href="/promotions" className="nav-link">Акции</a>
                        <a href="/reviews" className="nav-link">Отзывы</a>
                        <a href="/gallery" className="nav-link">Галерея</a>
                        <div className="logo">
                        <img src={logo} alt="Logo" />
                        </div>
                        <a href="/contacts" className="nav-link">Контакты</a>
                        <div className="auth-buttons">
                        <a href="/login" className="button login-button">Вход</a>
                        <a href="/register" className="button register-button">Регистрация</a>
                        </div>
                        </ul>
                    </nav>
                </div>
                </div>
            </div>
        </header>
    )
}

export default Header;