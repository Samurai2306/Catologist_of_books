/**
 * Утилиты для работы с авторизацией API
 * API требует Basic Auth для всех операций кроме GET и /image/
 */

/**
 * Сохранение учетных данных в localStorage
 */
export const saveAuthCredentials = (username, password) => {
  try {
    localStorage.setItem('api_auth', JSON.stringify({ username, password }))
    return true
  } catch (error) {
    console.error('Ошибка сохранения учетных данных:', error)
    return false
  }
}

/**
 * Получение сохраненных учетных данных
 */
export const getAuthCredentials = () => {
  try {
    const stored = localStorage.getItem('api_auth')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Ошибка получения учетных данных:', error)
  }
  return null
}

/**
 * Удаление сохраненных учетных данных
 */
export const clearAuthCredentials = () => {
  try {
    localStorage.removeItem('api_auth')
    return true
  } catch (error) {
    console.error('Ошибка удаления учетных данных:', error)
    return false
  }
}

/**
 * Проверка наличия сохраненных учетных данных
 */
export const hasAuthCredentials = () => {
  return getAuthCredentials() !== null
}

