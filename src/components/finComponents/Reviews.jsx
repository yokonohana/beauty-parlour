import React, { useEffect, useState, useRef } from 'react';
import Header from '../header/header';
import '../../styles/reviews.css';

export default function ReviewsPage() {
  const [allReviews, setAllReviews] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [current, setCurrent] = useState(0);
  const formRef = useRef(null);

  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('https://beauty-parlour.onrender.com/api/reviews?status=approved');
        if (!res.ok) throw new Error(`Сервер вернул ошибку ${res.status}`);

        const data = await res.json();
        const reviewsArray = Array.isArray(data)
          ? data
          : data.rows && Array.isArray(data.rows)
          ? data.rows
          : [];

        const shuffled = [...reviewsArray].sort(() => Math.random() - 0.5);
        const five = shuffled.slice(0, 5);

        setAllReviews(reviewsArray);
        setFeatured(five);
        setCurrent(0);
      } catch (err) {
        console.error('Ошибка загрузки отзывов:', err);
        setError('Не удалось загрузить отзывы. Попробуйте позже.');
      }
    };

    fetchReviews();
  }, []);

  const carouselNext = () => {
    if (featured.length === 0) return;
    setCurrent(prev => (prev + 1) % featured.length);
  };

  const carouselPrev = () => {
    if (featured.length === 0) return;
    setCurrent(prev => (prev - 1 + featured.length) % featured.length);
  };

  const handleLeaveReviewClick = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) {
      setError('Пожалуйста, введите имя и комментарий.');
      return;
    }

    try {
      const res = await fetch('https://beauty-parlour.onrender.com/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName.trim(),
          rating: Number(rating),
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setError('');
        setUserName('');
        setRating(5);
        setComment('');
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError('Ошибка при отправке отзыва. Попробуйте позже.');
      }
    } catch (err) {
      console.error('Ошибка при отправке отзыва:', err);
      setError('Сервер недоступен. Попробуйте позже.');
    }
  };

  const Star = ({ filled }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? 'gold' : '#ccc'}
      width="20"
      height="20"
    >
      <path d="M12 2c.4 0 .7.2.9.5l2.7 5.5 6.1.9c.9.1 1.2 1.2.6 1.8l-4.4 4.3 1 6.1c.2.9-.8 1.6-1.6 1.2L12 19.8l-5.5 2.9c-.8.4-1.8-.3-1.6-1.2l1-6.1-4.4-4.3c-.6-.6-.3-1.7.6-1.8l6.1-.9 2.7-5.5c.2-.3.5-.5.9-.5z" />
    </svg>
  );

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <h2 className="review-title">Отзывы наших клиентов</h2>
        <hr className="review-divider" />

        {error && <p className="error-text">{error}</p>}

        {featured.length > 0 ? (
          <div className="carousel-wrapper">
            <button className="carousel-arrow left" onClick={carouselPrev}>
              &lt;
            </button>

            <div className="review-card">
              <div className="review-header">
                <p className="review-author">
                  {featured[current].name
                    ? `Пользователь ${featured[current].name}`
                    : 'Анонимный пользователь'}
                </p>
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      filled={i <= (featured[current].rating || 0)}
                    />
                  ))}
                </div>
              </div>
              <p className="review-comment">
                “{featured[current].comment || 'Без комментария'}”
              </p>
            </div>

            <button className="carousel-arrow right" onClick={carouselNext}>
              &gt;
            </button>
          </div>
        ) : (
          !error && <p className="no-reviews">Пока нет отзывов.</p>
        )}

        <div className="leave-review-wrapper">
          <button className="review-button" onClick={handleLeaveReviewClick}>
            Оставить отзыв
          </button>
        </div>

        <div ref={formRef} className="review-form-container">
          <form onSubmit={handleSubmit} className="review-form">
            <div className="input-row">
              <label className="label-inline">
                Ваше имя:
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  required
                />
              </label>
              <label className="label-inline">
                Рейтинг:
                <div className="rating-stars-inline">
                  {[1, 2, 3, 4, 5].map(i => (
                    <span
                      key={i}
                      onClick={() => setRating(i)}
                      className="star-clickable"
                    >
                      <Star filled={i <= rating} />
                    </span>
                  ))}
                </div>
              </label>
            </div>

            <label className="label-block">
              Комментарий:
              <textarea
                placeholder="Ваш отзыв"
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
              />
            </label>

            <button type="submit" className="submit-review">
              Отправить отзыв
            </button>
            {success && (
              <p className="success-text">Спасибо! Ваш отзыв успешно отправлен.</p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
