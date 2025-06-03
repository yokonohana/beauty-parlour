import db from './db.js';

const initDatabase = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) CHECK (role IN ('client', 'admin')) NOT NULL DEFAULT 'client',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS masters (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        specialization TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS master_schedule (
        id SERIAL PRIMARY KEY,
        master_id INTEGER REFERENCES masters(id),
        day_of_week VARCHAR(10) CHECK (day_of_week IN (
          'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
        )) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL
      );

      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO services (name, description, price, created_at, updated_at) VALUES
        -- Маникюр
        ('Классический маникюр (обрезной)', 'Чистка, обработка кутикулы, придание формы ногтям.', 1500, NOW(), NOW()),
        ('Аппаратный маникюр', 'Безопасная обработка кожи и кутикулы с помощью аппарата.', 2000, NOW(), NOW()),
        ('Японский маникюр', 'Мягкая шлифовка ногтей и втирание в них специальных укрепляющих средств (минеральные пасты и полировочные пудры, воск, масло).', 2500, NOW(), NOW()),
        ('Покрытие гель-лаком', 'Долговременное покрытие с устойчивым блеском.', 2500, NOW(), NOW()),
        ('Наращивание ногтей гелем с покрытием', 'Создание идеальной длины и формы с помощью геля.', 3500, NOW(), NOW()),
        ('Наращивание ногтей акрилом с покрытием', 'Прочное и долговечное покрытие, выравнивающее ногтевую пластину.', 3500, NOW(), NOW()),
        ('Коррекция наращенных ногтей', 'Коррекция отросших наращенных ногтей.', 2500, NOW(), NOW()),
        ('Дизайн ногтей', 'Узор, роспись, стразы, фольга, блестки и другие элементы.', 300, NOW(), NOW()),
        ('Снятие покрытия', 'Аккуратное снятие гель-лака или шеллака.', 500, NOW(), NOW()),

        -- Педикюр
        ('Классический педикюр (обрезной)', 'Обработка стоп, удаление мозолей, обработка кутикулы.', 2500, NOW(), NOW()),
        ('Аппаратный педикюр', 'Безболезненная обработка стоп и ногтей с помощью аппарата.', 3000, NOW(), NOW()),
        ('Покрытие гель-лаком (педикюр)', 'Нанесение базового, цветного и топового покрытий.', 1000, NOW(), NOW()),
        ('SPA-педикюр', 'Расслабляющая ванночка, пилинг, массаж стоп и увлажнение.', 4000, NOW(), NOW()),
        ('Мужской педикюр', 'Обработка стоп и ногтей с учетом особенностей мужской кожи.', 3500, NOW(), NOW()),
        ('Снятие покрытия (педикюр)', 'Аккуратное снятие гель-лака или шеллака.', 500, NOW(), NOW()),

        -- Комплексные услуги
        ('Комплекс руки №1', 'Маникюр + покрытие гель-лаком + снятие', 3000, NOW(), NOW()),
        ('Комплекс руки №2', 'Маникюр + покрытие гель-лаком + снятие + дизайн (2 ногтя)', 4000, NOW(), NOW()),
        ('Комплекс руки №3', 'Маникюр + покрытие гель-лаком + снятие + дизайн (2 ногтя) + наращивание (2-3 ногтя)', 5000, NOW(), NOW()),
        ('Комплекс руки №4', 'Маникюр + покрытие гель-лаком + снятие + наращивание + дизайн (все ногти)', 7500, NOW(), NOW()),
        ('Комплекс ноги №1', 'Педикюр + покрытие гель-лаком + снятие', 4500, NOW(), NOW()),
        ('Комплекс ноги №2', 'Педикюр + покрытие гель-лаком + снятие + СПА-педикюр', 5000, NOW(), NOW()),
        ('Комплекс ноги №3', 'Педикюр + покрытие гель-лаком + снятие + мужской педикюр', 6000, NOW(), NOW()),
        ('Комплекс всё и сразу', 'Комплекс руки №4 + Комплекс ноги №3', 13000, NOW(), NOW()),
        ('Стрижка женская', 'Классическая женская стрижка (цена зависит от длины волос).', 2500, NOW(), NOW()),
        ('Стрижка женская горячими ножницами', 'Стрижка горячими ножницами для предотвращения сечения волос.', 3000, NOW(), NOW()),
        ('Стрижка челки', 'Подравнивание и оформление челки.', 600, NOW(), NOW()),
        ('Стрижка одним срезом (без мытья головы)', 'Минимальная стрижка без мытья головы.', 1000, NOW(), NOW()),
        ('Полировка волос (без мытья головы)', 'Удаление секущихся кончиков специальной машинкой.', 2000, NOW(), NOW()),
        ('Полировка волос (с мытьем головы и укладкой)', 'Полировка волос с комплексным уходом.', 2500, NOW(), NOW()),
        ('Консультация специалиста', 'Подбор процедуры, подходящей под ваш тип волос (при записи).', 0, NOW(), NOW()),
        ('Мытье головы и укладка на брашинг', 'Стандартное мытье головы и укладка (цена до 2200 ₽ зависит от длины волос).', 2200, NOW(), NOW()),
        ('Свадебная прическа', 'Создание индивидуального образа для свадьбы.', 5000, NOW(), NOW()),
        ('Вечерняя прическа', 'Прическа для торжественного мероприятия.', 3500, NOW(), NOW()),
        ('Био завивка', 'Мягкая химическая завивка (цена зависит от длины волос).', 7000, NOW(), NOW()),
        ('Сложное окрашивание', 'Балаяж, шатуш, омбре и т.п. (зависит от длины волос).', 10000, NOW(), NOW()),
        ('Тонирование', 'Легкое окрашивание для изменения оттенка (от 7000 ₽).', 7000, NOW(), NOW()),
        ('Окрашивание в 1 тон', 'Классическое однотонное окрашивание (от 5000 ₽).', 5000, NOW(), NOW()),
        ('Окрашивание корней', 'Окрашивание отросших корней.', 5000, NOW(), NOW()),
        ('Окрашивание ресниц', 'Изменение цвета ресниц специальной краской.', 1100, NOW(), NOW()),
        ('Ламинирование ресниц', 'Подкручивание и укрепление натуральных ресниц.', 3000, NOW(), NOW()),
        ('Наращивание ресниц', 'Объемное наращивание ресниц.', 4000, NOW(), NOW()),
        ('Снятие наращенных ресниц', 'Безопасное снятие ресниц.', 500, NOW(), NOW()),
        ('Коррекция бровей + окрашивание', 'Форма + окрашивание краской или хной.', 1700, NOW(), NOW()),
        ('Коррекция бровей (воск, пинцет)', 'Коррекция формы бровей.', 800, NOW(), NOW()),
        ('Окрашивание бровей', 'Изменение цвета бровей специальной краской или хной.', 1000, NOW(), NOW()),
        ('Долговременная укладка бровей', 'Ламинирование, окрашивание и коррекция формы.', 2900, NOW(), NOW());

      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        discount DECIMAL(5, 2) NOT NULL,
        start_data DATE,
        end_data DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

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

      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        image_url VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),     -- ← Добавлен user_id
        name TEXT,                                -- можно оставить, если хотите одновременно хранить текстовое имя
        master_id INTEGER REFERENCES masters(id),
        rating INT NOT NULL,
        comment TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contact_info (
        id SERIAL PRIMARY KEY,
        address VARCHAR(255),
        phone VARCHAR(20),
        working_hours VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS security_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Все таблицы успешно созданы!');
    process.exit();
  } catch (err) {
    console.error('❌ Ошибка при создании таблиц:', err);
    process.exit(1);
  }
};

initDatabase();
