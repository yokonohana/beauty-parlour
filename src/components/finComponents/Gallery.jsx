import React, { useState, useEffect } from 'react';
import Header from '../header/header';
import '../../styles/gallery.css';

const categories = [
  'Маникюр и педикюр',
  'Стрижки и укладки',
  'Ресницы и брови',
];

const folderToCategory = {
  manicure: 'Маникюр и педикюр',
  hairstyles: 'Стрижки и укладки',
  eyelashes: 'Ресницы и брови',
};

export default function Gallery() {
  const [images, setImages] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const [filteredImages, setFilteredImages] = useState([]);

  useEffect(() => {
    const allImageModules = import.meta.glob(
      '/src/img/gallery/**/*.{png,jpg,jpeg,svg}',
      {
        eager: true,
        import: 'default',
      }
    );

    const tempArr = [];
    let idCounter = 1;

    for (const filePath in allImageModules) {
      const segments = filePath.split('/');
      const folderName = segments[4];
      const category = folderToCategory[folderName] || 'Без категории';

      tempArr.push({
        id: idCounter++,
        image_url: allImageModules[filePath],
        description: category,
      });
    }

    setImages(tempArr);
  }, []);

  useEffect(() => {
    const filtered = images.filter(
      (img) => img.description === selectedCategory
    );
    setFilteredImages(filtered);
  }, [images, selectedCategory]);

  return (
    <>
      <Header />

      <div className="gallery-page">
        <h2 className="gallery-title">Галерея</h2>
        <p className="gallery-subtitle">Работы наших профессионалов</p>
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

        <div className="gallery-grid">
          {filteredImages.length === 0 ? (
            <p className="no-images">Нет фотографий в этой категории</p>
          ) : (
            filteredImages.map((img) => (
              <div key={img.id} className="gallery-item">
                <img
                  src={img.image_url}
                  alt={`Фото №${img.id}`}
                  className="gallery-img"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
