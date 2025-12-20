/**
 * Адаптеры для преобразования данных между форматом API и форматом приложения
 */

// Преобразование книги из формата API в формат приложения
export const adaptBookFromAPI = (apiBook) => {
  if (!apiBook) return null

  // Обработка изображения - API возвращает путь относительно /images/
  let imageUrl = null
  if (apiBook.image) {
    if (apiBook.image.startsWith('http')) {
      imageUrl = apiBook.image
    } else if (apiBook.image.startsWith('/')) {
      imageUrl = apiBook.image
    } else {
      imageUrl = `/images/${apiBook.image}`
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
  return {
    name: appBook.title,
    year_of_release: appBook.publicationYear || null,
    description: appBook.description || '',
    image: appBook.imageUrl || null,
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

