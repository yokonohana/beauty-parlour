import React, { useEffect, useState, useRef } from 'react';
import Header from '../header/header';
import '../../styles/reviews.css';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [current, setCurrent] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/reviews');
        const data = await res.json();
        const approved = data.filter((r) => r.approved);
        const result = approved.length > 0 ? approved : data;
        const shuffled = result.sort(() => Math.random() - 0.5);
        setReviews(shuffled);
      } catch (err) {
        console.error('Ошибка загрузки отзывов', err);
      }
    };

    fetchReviews();
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % reviews.length);
  const prev = () => setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length);
  const handleLeaveReviewClick = () => formRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setError('Пожалуйста, введите имя и комментарий.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, comment, rating }),
      });

      if (res.ok) {
        setSuccess(true);
        setName('');
        setComment('');
        setRating(5);
        setError('');
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError('Ошибка при отправке отзыва.');
      }
    } catch (err) {
      console.error(err);
      setError('Сервер недоступен.');
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

        {reviews.length > 0 ? (
          <div className="carousel-wrapper">
            <button className="carousel-arrow left" onClick={prev}>&lt;</button>
            <div className="review-card">
              <div className="review-header">
                <p className="review-author">{reviews[current]?.name || 'Аноним'}</p>
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} filled={i <= (reviews[current]?.rating || 0)} />
                  ))}
                </div>
              </div>
              <p className="review-comment">“{reviews[current]?.comment || 'Без комментария'}”</p>
            </div>
            <button className="carousel-arrow right" onClick={next}>&gt;</button>
          </div>
        ) : (
          <p className="no-reviews">Пока нет отзывов.</p>
        )}

        <div className="leave-review-wrapper">
          <button className="review-button" onClick={handleLeaveReviewClick}>
            Оставить отзыв
          </button>
        </div>

        <div ref={formRef} className="review-form-container">
          <form onSubmit={handleSubmit} className="review-form">
            <input
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <textarea
              placeholder="Ваш отзыв"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} onClick={() => setRating(i)}>
                  <Star filled={i <= rating} />
                </span>
              ))}
            </div>
            <button type="submit" className="submit-review">Отправить</button>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">Спасибо за ваш отзыв!</p>}
          </form>
        </div>
      </div>
    </>
  );
}
