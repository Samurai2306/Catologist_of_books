/**
 * Адаптеры для преобразования данных между форматом API и форматом приложения
 */

import { API_CONFIG } from '../config/api'

// Get the base URL for images - always use proxy in production
const getImageBaseUrl = () => {
  // In production, images are served through the proxy at /api
  // In development, use the direct external API URL
  return API_CONFIG.REST_API;
}

// Преобразование книги из формата API в формат приложения
export const adaptBookFromAPI = (apiBook) => {
  if (!apiBook) return null

  const imageBase = getImageBaseUrl();

  // Обработка изображения - API возвращает путь относительно /images/
  let imageUrl = null
  if (apiBook.image) {
    if (apiBook.image.startsWith('http')) {
      // Полный URL - используем как есть
      imageUrl = apiBook.image
    } else if (apiBook.image.startsWith('/')) {
      // Абсолютный путь - добавляем базовый URL API
      imageUrl = `${imageBase}${apiBook.image}`
    } else {
      // Относительный путь - формируем полный URL
      // API использует /image/ (единственное число), а не /images/
      imageUrl = `${imageBase}/image/${apiBook.image}`
    }
  }

  return {
    id: apiBook.id,
    title: apiBook.name || apiBook.title,
    publicationYear: apiBook.year_of_release || apiBook.publicationYear || null,
    description: apiBook.description || '',
    imageUrl,
    rating: apiBook.rating || null,
    // Преобразование авторов
    authors: apiBook.author
      ? apiBook.author.map(author => ({
          id: author.id,
          name: author.full_name || author.name || author,
        }))
      : apiBook.authors || [],
    // Преобразование жанров
    genres: apiBook.genre
      ? apiBook.genre.map(genre => ({
          id: genre.id,
          name: genre.name || genre,
        }))
      : apiBook.genres || [],
    createdAt: apiBook.createdAt || null,
  }
}

// Преобразование массива книг из формата API
export const adaptBooksFromAPI = (apiBooks) => {
  if (!Array.isArray(apiBooks)) return []
  return apiBooks.map(adaptBookFromAPI)
}

// Преобразование книги из формата приложения в формат API
export const adaptBookToAPI = (appBook) => {
  // Обработка изображения: API ожидает только имя файла, а не полный путь
  let image = null
  if (appBook.imageUrl) {
    // Если это относительный путь /images/filename.jpg, извлекаем только имя файла
    if (appBook.imageUrl.startsWith('/images/')) {
      image = appBook.imageUrl.replace('/images/', '')
    } 
    // Если это полный URL, извлекаем имя файла из пути
    else if (appBook.imageUrl.includes('/images/')) {
      const parts = appBook.imageUrl.split('/images/')
      image = parts[parts.length - 1]
    }
    // Если это просто имя файла, используем как есть
    else if (!appBook.imageUrl.includes('/') && !appBook.imageUrl.startsWith('http')) {
      image = appBook.imageUrl
    }
    // Если это полный URL без /images/, оставляем как есть (может быть внешняя ссылка)
    else {
      image = appBook.imageUrl
    }
  }

  return {
    name: appBook.title,
    year_of_release: appBook.publicationYear || null,
    description: appBook.description || '',
    image,
    genre: Array.isArray(appBook.genreIds) ? appBook.genreIds : (appBook.genres?.map(g => typeof g === 'object' ? g.id : g) || []),
    author: Array.isArray(appBook.authorIds) ? appBook.authorIds : (appBook.authors?.map(a => typeof a === 'object' ? a.id : a) || []),
  }
}

// Преобразование автора из формата API
export const adaptAuthorFromAPI = (apiAuthor) => {
  if (!apiAuthor) return null
  return {
    id: apiAuthor.id,
    name: apiAuthor.full_name || apiAuthor.name || apiAuthor,
  }
}

// Преобразование массива авторов из формата API
export const adaptAuthorsFromAPI = (apiAuthors) => {
  if (!Array.isArray(apiAuthors)) return []
  return apiAuthors.map(adaptAuthorFromAPI)
}

// Преобразование жанра из формата API
export const adaptGenreFromAPI = (apiGenre) => {
  if (!apiGenre) return null
  return {
    id: apiGenre.id,
    name: apiGenre.name || apiGenre,
  }
}

// Преобразование массива жанров из формата API
export const adaptGenresFromAPI = (apiGenres) => {
  if (!Array.isArray(apiGenres)) return []
  return apiGenres.map(adaptGenreFromAPI)
}

