import './promo.css'
import promoImg from './../../img/images/image2.png'

const Promo = () => {
    return ( <section className="promo">
        <div className="container">
            <div className="promo__content">
                <div className="promo__img">
                    <img src={promoImg} alt="Promo" />
                 </div>
                <div className="promo__text">
                Студия BLISS — ваш уголок гармонии и красоты. Мы создаем идеальные образы, чтобы вы чувствовали себя уверенно 
                и уходили с улыбкой.
                </div>
            </div>
        </div>
    </section> );
}
 
export default Promo;