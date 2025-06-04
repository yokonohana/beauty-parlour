import db from './db.js';

const initDatabase = async () => {
  try {
    await db.query(`

      -- 1. Таблица users
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) CHECK (role IN ('client','admin')) NOT NULL DEFAULT 'client',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 2. Таблица masters + вставка мастеров (обязательно перед master_schedule)
      CREATE TABLE IF NOT EXISTS masters (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        specialization TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO masters (name, specialization)
      VALUES
        ('Ольга Иванова','Маникюр и педикюр'),
        ('Екатерина Петрова','Стрижки и укладки'),
        ('Марина Сидорова','Ресницы и брови'),
        ('Алексей Смирнов','Стрижки и укладки'),
        ('Ирина Кузнецова','Маникюр и педикюр'),
        ('Алина Орлова','Ресницы и брови'),
        ('Виктория Миронова','Ресницы и брови')
      ON CONFLICT DO NOTHING;

      -- 3. Таблица master_schedule + вставка расписания
      CREATE TABLE IF NOT EXISTS master_schedule (
        id SERIAL PRIMARY KEY,
        master_id INTEGER REFERENCES masters(id),
        day_of_week VARCHAR(10) CHECK (
          day_of_week IN (
            'monday','tuesday','wednesday','thursday','friday','saturday','sunday'
          )
        ) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL
      );
      INSERT INTO master_schedule (master_id, day_of_week, start_time, end_time)
      VALUES
        (1,'monday','09:00:00','13:00:00'),
        (1,'wednesday','10:00:00','14:00:00'),
        (1,'friday','09:30:00','13:30:00'),
        (2,'tuesday','11:00:00','15:00:00'),
        (2,'thursday','10:00:00','14:00:00'),
        (2,'saturday','09:00:00','13:00:00'),
        (3,'monday','10:00:00','14:00:00'),
        (3,'wednesday','09:00:00','13:00:00'),
        (3,'friday','11:00:00','15:00:00'),
        (3,'sunday','10:00:00','14:00:00'),
        (4,'tuesday','09:00:00','13:00:00'),
        (4,'thursday','12:00:00','16:00:00'),
        (4,'saturday','10:00:00','14:00:00'),
        (5,'monday','09:30:00','13:30:00'),
        (5,'wednesday','11:00:00','15:00:00'),
        (5,'friday','10:00:00','14:00:00'),
        (6,'tuesday','10:00:00','14:00:00'),
        (6,'thursday','09:00:00','13:00:00'),
        (6,'saturday','11:00:00','15:00:00'),
        (7,'monday','11:00:00','15:00:00'),
        (7,'wednesday','12:00:00','16:00:00'),
        (7,'friday','09:00:00','13:00:00'),
        (7,'sunday','10:00:00','14:00:00')
      ON CONFLICT DO NOTHING;

      -- 4. Таблица services (DROP + CREATE + INSERT)
      DROP TABLE IF EXISTS services;
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        subcategory VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO services (name, description, price, category, subcategory)
      VALUES
        -- ==== Маникюр и педикюр ====
        ('Классический маникюр (обрезной)',  'Чистка, обработка кутикулы, придание формы ногтям.', 1500, 'Маникюр и педикюр', 'Маникюр'),
        ('Аппаратный маникюр',               'Обработка кожи и кутикулы аппаратным методом.', 2000, 'Маникюр и педикюр', 'Маникюр'),
        ('Японский маникюр',                 'Шлифовка ногтей и втирание укрепляющих средств.', 2500, 'Маникюр и педикюр', 'Маникюр'),
        ('Покрытие гель-лаком (маникюр)',    'Долговременное гелевое покрытие с блеском.', 2500, 'Маникюр и педикюр', 'Маникюр'),
        ('Наращивание ногтей гелем с покрытием','Создание формы с помощью геля.', 3500, 'Маникюр и педикюр', 'Маникюр'),
        ('Коррекция наращенных ногтей',      'Коррекция отросших ногтей.', 2500, 'Маникюр и педикюр', 'Маникюр'),
        ('Дизайн ногтей',                    'Узор, стразы, фольга, блестки и т.д.', 300,  'Маникюр и педикюр', 'Маникюр'),
        ('Снятие покрытия (маникюр)',        'Снятие гель-лака/шеллака.', 500,  'Маникюр и педикюр', 'Маникюр'),  
        ('Классический педикюр (обрезной)',  'Обработка стоп, удаление мозолей, работа с кутикулой.', 2500, 'Маникюр и педикюр', 'Педикюр'),
        ('Аппаратный педикюр',               'Обработка стоп и ногтей аппаратом.', 3000, 'Маникюр и педикюр', 'Педикюр'),
        ('Покрытие гель-лаком (педикюр)',    'Нанесение базового и цветного покрытия.', 1000, 'Маникюр и педикюр', 'Педикюр'),
        ('SPA-педикюр',                      'Ванночка, пилинг, массаж и увлажнение стоп.', 4000, 'Маникюр и педикюр', 'Педикюр'),
        ('Мужской педикюр',                  'Обработка мужских стоп и ногтей.', 3500, 'Маникюр и педикюр', 'Педикюр'),
        ('Снятие покрытия (педикюр)',        'Снятие гель-лака/шеллака.', 500,  'Маникюр и педикюр', 'Педикюр'),
        ('Комплекс руки №1',                 'Маникюр + гель-лак + снятие', 3000, 'Маникюр и педикюр', 'Комплексные услуги'),
        ('Комплекс руки №2',                 'Маникюр + гель-лак + снятие + дизайн (2 ногтя)', 4000, 'Маникюр и педикюр', 'Комплексные услуги'),
        ('Комплекс ноги №1',                 'Педикюр + гель-лак + снятие', 4500, 'Маникюр и педикюр', 'Комплексные услуги'),
        ('Комплекс ноги №2',                 'Педикюр + гель-лак + снятие + SPA-педикюр', 5000, 'Маникюр и педикюр', 'Комплексные услуги'),
        ('Комплекс ноги №3',                 'Педикюр + гель-лак + снятие + мужской педикюр', 6000, 'Маникюр и педикюр', 'Комплексные услуги'),
        ('Комплекс всё и сразу',             'Руки №4 + Ноги №3', 13000, 'Маникюр и педикюр', 'Комплексные услуги'),
        ('Стрижка женская','Классическая стрижка (зависит от длины волос).', 2500, 'Стрижки и укладки', 'Стрижка и укладка'),
        ('Стрижка горячими ножницами','Предотвращает сечение волос.', 3000, 'Стрижки и укладки', 'Стрижка и укладка'),
        ('Стрижка челки','Оформление челки.', 600, 'Стрижки и укладки', 'Стрижка и укладка'),
        ('Стрижка одним срезом (без мытья)', 'Минимальная стрижка без мытья.', 1000, 'Стрижки и укладки', 'Стрижка и укладка'),
        ('Консультация специалиста (волосы)','Подбор процедуры по типу волос.', 0, 'Стрижки и укладки', 'Стрижка и укладка'),
        ('Мытье головы и укладка','Мытьё и укладка (цена зависит от длины).', 2200, 'Стрижки и укладки', 'Стрижка и укладка'),
        ('Био завивка','Мягкая химическая завивка (зависит от длины).', 7000, 'Стрижки и укладки', 'Окрашивание'),
        ('Сложное окрашивание','Балаяж, шатуш, омбре и т.д. (зависит от длины).', 10000,'Стрижки и укладки', 'Окрашивание'),
        ('Тонирование','Лёгкое изменение оттенка (от 7000₽).', 7000, 'Стрижки и укладки', 'Окрашивание'),
        ('Окрашивание в один тон','Однотонное окрашивание (от 5000₽).', 5000, 'Стрижки и укладки', 'Окрашивание'),
        ('Окрашивание корней','Покраска отросших корней.', 5000, 'Стрижки и укладки', 'Окрашивание'),
        ('Окрашивание ресниц','Изменение цвета ресниц краской.', 1100, 'Ресницы и брови', 'Ресницы'),
        ('Ламинирование ресниц','Укрепление натуральных ресниц.', 3000, 'Ресницы и брови', 'Ресницы'),
        ('Наращивание ресниц','Объёмное или классическое наращивание.', 4000, 'Ресницы и брови', 'Ресницы'),
        ('Снятие наращенных ресниц','Безопасное снятие ресниц.', 500, 'Ресницы и брови', 'Ресницы'),
        ('Коррекция бровей + окрашивание','Форма + окрашивание краской/хной.', 1700, 'Ресницы и брови', 'Брови'),
        ('Коррекция бровей (воск, пинцет)','Коррекция формы бровей.', 800, 'Ресницы и брови', 'Брови'),
        ('Окрашивание бровей','Изменение цвета бровей краской/хной.', 1000, 'Ресницы и брови', 'Брови'),
        ('Долговременная укладка бровей','Ламинирование, окрашивание и коррекция формы.', 2900, 'Ресницы и брови', 'Брови'
      )
      ON CONFLICT DO NOTHING;

      -- 5. Таблица promotions
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        discount DECIMAL(5, 2) NOT NULL,
        start_data DATE,
        end_data DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 6. Таблица appointments
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        service_id INTEGER REFERENCES services(id),
        master_id INTEGER REFERENCES masters(id),
        appointment_data TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        promotion_id INTEGER REFERENCES promotions(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 7. Таблица gallery
      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        image_url VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 8. Таблица reviews
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name TEXT,
        master_id INTEGER REFERENCES masters(id),
        rating INT NOT NULL,
        comment TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 9. Таблица contact_info
      CREATE TABLE IF NOT EXISTS contact_info (
        id SERIAL PRIMARY KEY,
        address VARCHAR(255),
        phone VARCHAR(20),
        working_hours VARCHAR(255)
      );

      -- 10. Таблица security_logs
      CREATE TABLE IF NOT EXISTS security_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Все таблицы успешно созданы и заполнены!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка при создании таблиц:', err);
    process.exit(1);
  }
};

initDatabase();
