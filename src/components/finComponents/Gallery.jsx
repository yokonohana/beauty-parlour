import React, { useState, useEffect } from 'react';
import Header from '../header/header';
import '../../styles/gallery.css';

const categories = [
  'Маникюр и педикюр',
  'Стрижки и укладки',
  'Ресницы и брови',
];

const currentUserRole = 'admin'; // заменить в будущем авторизацией

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [loading, setLoading] = useState(false);

  const fetchImages = async (description) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/gallery?description=${encodeURIComponent(description)}`);
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error('Ошибка при загрузке изображений:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(selectedCategory);
  }, [selectedCategory]);

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить фото?')) return;

    try {
      await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });
      fetchImages(selectedCategory);
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  return (
    <>
      <Header />
      <div className="gallery-page">
        <h2 className="gallery-title">Галерея</h2>
        <p className="gallery-subtitle">Работы наших профессионалов</p>

        {/* Фильтрация по категориям */}
        <div className="gallery-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Галерея */}
        {loading ? (
          <p>Загрузка изображений...</p>
        ) : (
          <div className="gallery-grid">
            {images.map((img) => (
              <div key={img.id} className="gallery-item">
                <img src={img.image_url} alt={`Работа: ${img.description}`} />
                {currentUserRole === 'admin' && (
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(img.id)}
                  >
                    Удалить
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
