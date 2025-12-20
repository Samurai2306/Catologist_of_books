import axios from 'axios'
import { API_CONFIG, API_ENDPOINTS } from '../config/api'
import { 
  adaptBookFromAPI, 
  adaptBooksFromAPI, 
  adaptBookToAPI,
  adaptAuthorFromAPI,
  adaptAuthorsFromAPI,
  adaptGenreFromAPI,
  adaptGenresFromAPI,
} from '../utils/apiAdapter'

const apiClient = axios.create({
  baseURL: API_CONFIG.REST_API,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Функция для получения учетных данных Basic Auth
import { getAuthCredentials as getStoredAuth } from '../utils/auth'

const getAuthCredentials = () => {
  // Сначала проверяем сохраненные в localStorage
  const stored = getStoredAuth()
  if (stored && stored.username && stored.password) {
    return stored
  }
  
  // Затем проверяем переменные окружения
  const envUsername = import.meta.env.VITE_API_USERNAME
  const envPassword = import.meta.env.VITE_API_PASSWORD
  
  if (envUsername && envPassword) {
    return {
      username: envUsername,
      password: envPassword,
    }
  }
  
  // Значения по умолчанию (для тестирования)
  // ВАЖНО: Для работы с API нужны реальные учетные данные!
  return {
    username: 'admin',
    password: 'admin',
  }
}

// Интерцептор для добавления Basic Auth к запросам, которые требуют авторизацию
apiClient.interceptors.request.use(
  (config) => {
    // GET запросы и /image/ endpoints не требуют авторизацию
    const isGetRequest = config.method?.toLowerCase() === 'get'
    const isImageEndpoint = config.url?.includes('/image/')
    
    if (!isGetRequest && !isImageEndpoint) {
      const { username, password } = getAuthCredentials()
      // Добавляем Basic Auth заголовок
      config.auth = {
        username,
        password,
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Произошла ошибка'
    
    if (error.response) {
      // Сервер ответил с кодом ошибки
      const status = error.response.status
      const data = error.response.data
      
      switch (status) {
        case 404:
          message = data?.message || 'Ресурс не найден. Проверьте доступность API сервера.'
          break
        case 400:
          message = data?.message || 'Неверный запрос. Проверьте введенные данные.'
          break
        case 401:
          message = data?.message || 'Требуется авторизация. Проверьте учетные данные в настройках административной панели.'
          // Добавляем флаг для показа настроек авторизации
          error.isAuthError = true
          break
        case 403:
          message = data?.message || 'Доступ запрещен.'
          break
        case 500:
          message = data?.message || 'Внутренняя ошибка сервера.'
          break
        default:
          message = data?.message || `Ошибка ${status}: ${error.response.statusText || 'Неизвестная ошибка'}`
      }
    } else if (error.request) {
      // Запрос был отправлен, но ответа не получено
      message = 'Сервер не отвечает. Проверьте подключение к интернету и доступность API.'
    } else {
      // Ошибка при настройке запроса
      message = error.message || 'Ошибка при выполнении запроса.'
    }
    
    return Promise.reject(new Error(message))
  }
)

// API для книг
export const booksAPI = {
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.BOOKS)
    // Преобразуем ответ из формата API в формат приложения
    return {
      ...response,
      data: adaptBooksFromAPI(response.data),
    }
  },
  getById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.BOOK_BY_ID(id))
    return {
      ...response,
      data: adaptBookFromAPI(response.data),
    }
  },
  create: (data) => {
    // Преобразование данных в формат API
    const apiData = adaptBookToAPI(data)
    return apiClient.post(API_ENDPOINTS.BOOKS, apiData)
  },
  update: (id, data) => {
    // Преобразование данных в формат API
    const apiData = adaptBookToAPI(data)
    return apiClient.put(API_ENDPOINTS.BOOK_BY_ID(id), apiData)
  },
  delete: (id) => apiClient.delete(API_ENDPOINTS.BOOK_BY_ID(id)),
}

// API для авторов
export const authorsAPI = {
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTHORS)
    return {
      ...response,
      data: adaptAuthorsFromAPI(response.data),
    }
  },
  getById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.AUTHOR_BY_ID(id))
    return {
      ...response,
      data: adaptAuthorFromAPI(response.data),
    }
  },
  create: (data) => {
    // API ожидает { full_name: string } для авторов
    const apiData = {
      full_name: data.name,
    }
    return apiClient.post(API_ENDPOINTS.AUTHORS, apiData)
  },
  update: (id, data) => {
    const apiData = {
      full_name: data.name,
    }
    return apiClient.put(API_ENDPOINTS.AUTHOR_BY_ID(id), apiData)
  },
  delete: (id) => apiClient.delete(API_ENDPOINTS.AUTHOR_BY_ID(id)),
}

// API для жанров
export const genresAPI = {
  getAll: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GENRES)
    return {
      ...response,
      data: adaptGenresFromAPI(response.data),
    }
  },
  getById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.GENRE_BY_ID(id))
    return {
      ...response,
      data: adaptGenreFromAPI(response.data),
    }
  },
  create: (data) => apiClient.post(API_ENDPOINTS.GENRES, data),
  update: (id, data) => apiClient.put(API_ENDPOINTS.GENRE_BY_ID(id), data),
  delete: (id) => apiClient.delete(API_ENDPOINTS.GENRE_BY_ID(id)),
}

// API для изображений
export const imagesAPI = {
  upload: async (formData) => {
    // API ожидает поле 'image', а не 'file'
    const apiFormData = new FormData()
    const file = formData.get('file') || formData.get('image')
    if (file) {
      apiFormData.append('image', file)
    }
    const response = await apiClient.post(API_ENDPOINTS.IMAGES, apiFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    // API возвращает { name: string }, преобразуем в полный путь
    if (response.data?.name) {
      return {
        ...response,
        data: {
          ...response.data,
          url: `/images/${response.data.name}`,
          imageUrl: `/images/${response.data.name}`,
        },
      }
    }
    return response
  },
}

export default apiClient

