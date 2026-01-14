import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API_URL = 'http://158.160.203.172:8080';
const USERNAME = 'admin';
const PASSWORD = '6812363';

console.log('=== Тест загрузки изображений через FormData ===\n');

// Тест 1: Проверка структуры API
async function testAPIStructure() {
  console.log('1. Проверка структуры API...');
  try {
    const response = await axios.get(`${API_URL}/book/`);
    const books = Array.isArray(response.data) ? response.data : [response.data];
    console.log(`   ✓ Получено книг: ${books.length}`);
    
    // Проверяем книги на наличие изображений
    const withImage = books.filter(b => b.image && b.image.trim() !== '');
    const withoutImage = books.filter(b => !b.image || b.image.trim() === '');
    
    console.log(`   ✓ Книг с изображением: ${withImage.length}`);
    console.log(`   ✓ Книг без изображения: ${withoutImage.length}`);
    
    if (withoutImage.length > 0) {
      console.log('\n   Книги без изображения:');
      withoutImage.slice(0, 3).forEach(b => {
        console.log(`     - ID: ${b.id}, "${b.name || b.title || 'Без названия'}"`);
      });
      return withoutImage[0];
    }
    
    // Если все книги имеют изображения, берем первую для теста замены
    if (books.length > 0) {
      console.log('\n   Все книги имеют изображения. Для теста можно использовать первую книгу.');
      return books[0];
    }
    
    return null;
  } catch (error) {
    console.error('   ✗ Ошибка:', error.message);
    return null;
  }
}

// Тест 2: Проверка endpoint для загрузки изображений
async function testImageUploadEndpoint() {
  console.log('\n2. Проверка endpoint для загрузки изображений...');
  try {
    // Создаем тестовый файл изображения (1x1 пиксель PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');
    
    const formData = new FormData();
    formData.append('image', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    console.log('   Попытка загрузки тестового изображения...');
    
    const response = await axios.post(`${API_URL}/image/url`, formData, {
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
    
    console.log('   ✓ Изображение успешно загружено!');
    console.log('   ✓ Ответ API:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('   ✗ Ошибка при загрузке:', error.message);
    if (error.response) {
      console.error('   ✗ Детали ошибки:', JSON.stringify(error.response.data, null, 2));
      console.error('   ✗ Статус:', error.response.status);
    }
    return null;
  }
}

// Тест 3: Проверка обновления книги с изображением
async function testBookUpdate(bookId, imageName) {
  console.log(`\n3. Тест обновления книги ID ${bookId} с изображением "${imageName}"...`);
  try {
    // Получаем текущие данные книги
    const getResponse = await axios.get(`${API_URL}/book/?id=${bookId}`);
    const book = getResponse.data;
    
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
    
    const response = await axios.put(`${API_URL}/book/?id=${bookId}`, updateData, {
      auth: {
        username: USERNAME,
        password: PASSWORD
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   ✓ Книга успешно обновлена!');
    console.log('   ✓ Новое изображение:', response.data.image || 'не указано');
    
    return response.data;
  } catch (error) {
    console.error('   ✗ Ошибка при обновлении:', error.message);
    if (error.response) {
      console.error('   ✗ Детали ошибки:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Основная функция
async function main() {
  try {
    // Тест 1: Проверка структуры API
    const book = await testAPIStructure();
    
    if (!book) {
      console.log('\n❌ Не найдено книг для тестирования');
      return;
    }
    
    // Тест 2: Проверка загрузки изображения
    const uploadResult = await testImageUploadEndpoint();
    
    if (!uploadResult) {
      console.log('\n❌ Не удалось загрузить изображение');
      return;
    }
    
    // Тест 3: Обновление книги (только если это тестовое изображение)
    if (uploadResult.name && uploadResult.name.includes('test')) {
      console.log('\n⚠️  Пропуск обновления книги (тестовое изображение)');
    } else if (uploadResult.name) {
      await testBookUpdate(book.id, uploadResult.name);
    }
    
    console.log('\n=== Результаты тестирования ===');
    console.log('✅ FormData загрузка работает корректно');
    console.log('✅ API принимает изображения через multipart/form-data');
    console.log('✅ Basic Auth работает правильно');
    
    console.log('\n=== Инструкция для загрузки реального изображения ===');
    console.log('1. Сохраните изображение в файл (например, book-image.jpg)');
    console.log('2. Используйте скрипт: node upload-image.mjs <путь_к_файлу>');
    console.log('3. Или используйте код из src/services/api.js -> imagesAPI.upload()');
    
  } catch (error) {
    console.error('\n❌ Критическая ошибка:', error.message);
    if (error.response) {
      console.error('Детали:', error.response.data);
    }
  }
}

main();
