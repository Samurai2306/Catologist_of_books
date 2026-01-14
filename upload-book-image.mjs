/**
 * Скрипт для загрузки изображения на книгу через FormData
 * 
 * Использование:
 *   node upload-book-image.mjs <путь_к_изображению> [bookId]
 * 
 * Пример:
 *   node upload-book-image.mjs book-image.jpg 1
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API_URL = 'http://158.160.203.172:8080';
const USERNAME = 'admin';
const PASSWORD = '6812363';

async function uploadImageToBook(imagePath, bookId = null) {
  try {
    // 1. Проверяем существование файла
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Файл не найден: ${imagePath}`);
    }
    
    // 2. Находим книгу для обновления
    let book;
    if (bookId) {
      const response = await axios.get(`${API_URL}/book/?id=${bookId}`);
      book = response.data;
    } else {
      // Ищем книгу без изображения
      const response = await axios.get(`${API_URL}/book/`);
      const books = Array.isArray(response.data) ? response.data : [response.data];
      const withoutImage = books.filter(b => !b.image || b.image.trim() === '');
      
      if (withoutImage.length === 0) {
        console.log('Все книги имеют изображения. Используется первая книга для замены.');
        book = books[0];
      } else {
        book = withoutImage[0];
      }
    }
    
    console.log(`\nКнига для обновления:`);
    console.log(`  ID: ${book.id}`);
    console.log(`  Название: ${book.name || book.title || 'Без названия'}`);
    console.log(`  Текущее изображение: ${book.image || 'отсутствует'}`);
    
    // 3. Загружаем изображение через FormData
    console.log(`\nЗагрузка изображения: ${imagePath}...`);
    
    const formData = new FormData();
    const fileStream = fs.createReadStream(imagePath);
    const fileName = imagePath.split('/').pop().split('\\').pop();
    
    formData.append('image', fileStream, {
      filename: fileName,
      contentType: 'image/jpeg' // Можно определить по расширению
    });
    
    const uploadResponse = await axios.post(`${API_URL}/image/url`, formData, {
      auth: {
        username: USERNAME,
        password: PASSWORD
      },
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    const imageName = uploadResponse.data.name;
    console.log(`✓ Изображение загружено: ${imageName}`);
    
    // 4. Обновляем книгу с новым изображением
    console.log(`\nОбновление книги...`);
    
    // API ожидает массивы ID (чисел), а не объекты
    const authorIds = Array.isArray(book.author) 
      ? book.author.map(a => typeof a === 'object' ? a.id : a).filter(Boolean)
      : [];
    const genreIds = Array.isArray(book.genre)
      ? book.genre.map(g => typeof g === 'object' ? g.id : g).filter(Boolean)
      : [];
    
    const updateData = {
      name: book.name || book.title,
      year_of_release: book.year_of_release || book.publicationYear || null,
      description: book.description || '',
      image: imageName,
      author: authorIds,
      genre: genreIds
    };
    
    const updateResponse = await axios.put(`${API_URL}/book/?id=${book.id}`, updateData, {
      auth: {
        username: USERNAME,
        password: PASSWORD
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✓ Книга успешно обновлена!`);
    console.log(`\nРезультат:`);
    console.log(`  Книга ID: ${updateResponse.data.id}`);
    console.log(`  Название: ${updateResponse.data.name || updateResponse.data.title}`);
    console.log(`  Изображение: ${updateResponse.data.image || 'не указано'}`);
    console.log(`  URL изображения: ${API_URL}/image/${imageName}`);
    
    return {
      success: true,
      book: updateResponse.data,
      imageName,
      imageUrl: `${API_URL}/image/${imageName}`
    };
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    if (error.response) {
      console.error('Детали:', JSON.stringify(error.response.data, null, 2));
      console.error('Статус:', error.response.status);
    }
    throw error;
  }
}

// Основная функция
const imagePath = process.argv[2];
const bookId = process.argv[3] ? parseInt(process.argv[3]) : null;

if (!imagePath) {
  console.log('Использование: node upload-book-image.mjs <путь_к_изображению> [bookId]');
  console.log('Пример: node upload-book-image.mjs book-image.jpg 1');
  process.exit(1);
}

uploadImageToBook(imagePath, bookId)
  .then(() => {
    console.log('\n✅ Готово!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Ошибка при выполнении:', error.message);
    process.exit(1);
  });
