import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API_URL = 'http://158.160.203.172:8080';
const USERNAME = 'admin';
const PASSWORD = '6812363';

// Функция для получения книг без изображения
async function findBookWithoutImage() {
  try {
    const response = await axios.get(`${API_URL}/book/`);
    const books = Array.isArray(response.data) ? response.data : [response.data];
    const withoutImage = books.filter(b => !b.image || b.image === null || b.image === '');
    
    console.log('Книги без изображения:');
    if (withoutImage.length === 0) {
      console.log('Все книги имеют изображения');
      return null;
    }
    
    withoutImage.forEach(b => {
      console.log(`ID: ${b.id}, Название: ${b.name || b.title || 'Без названия'}`);
    });
    
    return withoutImage[0];
  } catch (error) {
    console.error('Ошибка при получении книг:', error.message);
    if (error.response) {
      console.error('Детали:', error.response.data);
    }
    return null;
  }
}

// Функция для загрузки изображения из файла
async function uploadImageFromFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не найден: ${filePath}`);
    }
    
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);
    const fileName = filePath.split('/').pop().split('\\').pop();
    
    formData.append('image', fileStream, {
      filename: fileName,
      contentType: 'image/jpeg' // или определить по расширению
    });
    
    console.log(`Загрузка изображения: ${fileName}...`);
    
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
    
    console.log('Изображение загружено успешно:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error.message);
    if (error.response) {
      console.error('Детали ошибки:', error.response.data);
    }
    throw error;
  }
}

// Функция для обновления книги с новым изображением
async function updateBookWithImage(bookId, imageName) {
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
    
    // Обновляем книгу с новым изображением
    const updateData = {
      name: book.name || book.title,
      year_of_release: book.year_of_release || book.publicationYear || null,
      description: book.description || '',
      image: imageName,
      author: authorIds,
      genre: genreIds
    };
    
    console.log(`Обновление книги ID ${bookId} с изображением: ${imageName}...`);
    
    const response = await axios.put(`${API_URL}/book/?id=${bookId}`, updateData, {
      auth: {
        username: USERNAME,
        password: PASSWORD
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Книга успешно обновлена:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении книги:', error.message);
    if (error.response) {
      console.error('Детали ошибки:', error.response.data);
    }
    throw error;
  }
}

// Основная функция
async function main() {
  console.log('=== Проверка загрузки изображений через FormData ===\n');
  
  // Находим книгу без изображения
  const book = await findBookWithoutImage();
  
  if (!book) {
    console.log('\nНет книг без изображения для тестирования.');
    return;
  }
  
  console.log(`\nНайдена книга для обновления:`);
  console.log(`ID: ${book.id}`);
  console.log(`Название: ${book.name || book.title || 'Без названия'}`);
  console.log(`Текущее изображение: ${book.image || 'отсутствует'}`);
  
  console.log('\n=== Инструкция ===');
  console.log('Для загрузки изображения:');
  console.log('1. Сохраните изображение в файл (например, book-image.jpg)');
  console.log('2. Запустите: node upload-image.mjs <путь_к_файлу>');
  console.log('\nИли используйте функцию напрямую в коде.');
  
  // Если передан путь к файлу как аргумент
  const imagePath = process.argv[2];
  if (imagePath) {
    try {
      const uploadResult = await uploadImageFromFile(imagePath);
      if (uploadResult && uploadResult.name) {
        await updateBookWithImage(book.id, uploadResult.name);
        console.log('\n✅ Изображение успешно загружено и привязано к книге!');
      }
    } catch (error) {
      console.error('\n❌ Ошибка при загрузке:', error.message);
    }
  }
}

main().catch(console.error);
