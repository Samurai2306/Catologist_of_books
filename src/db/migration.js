/**
 * Утилита для миграции данных из LocalStorage в IndexedDB
 */

import { authDataAPI, viewedBooksAPI, userDataAPI } from './database'

/**
 * Миграция данных авторизации
 */
const migrateAuthData = async () => {
  try {
    const authData = localStorage.getItem('api_auth')
    if (authData) {
      const { username, password } = JSON.parse(authData)
      await authDataAPI.saveCredentials(username, password)
      console.log('✓ Авторизационные данные мигрированы в IndexedDB')
      // Удаляем из localStorage после успешной миграции
      localStorage.removeItem('api_auth')
    }
  } catch (error) {
    console.error('Ошибка миграции авторизационных данных:', error)
  }
}

/**
 * Миграция истории просмотров книг из Zustand persist
 */
const migrateViewedBooks = async () => {
  try {
    const bookStorageData = localStorage.getItem('book-storage')
    if (bookStorageData) {
      const { state } = JSON.parse(bookStorageData)
      if (state?.viewedBooks && Array.isArray(state.viewedBooks)) {
        // Добавляем каждую книгу в IndexedDB
        for (const bookId of state.viewedBooks) {
          await viewedBooksAPI.add(bookId)
        }
        console.log(`✓ История просмотров (${state.viewedBooks.length} книг) мигрирована в IndexedDB`)
        
        // Удаляем просмотренные книги из localStorage, оставляя остальное состояние
        const updatedState = { ...state, viewedBooks: [] }
        localStorage.setItem('book-storage', JSON.stringify({ state: updatedState, version: 0 }))
      }
    }
  } catch (error) {
    console.error('Ошибка миграции истории просмотров:', error)
  }
}

/**
 * Миграция других данных из localStorage
 */
const migrateOtherData = async () => {
  try {
    // Список ключей для миграции (можно расширить при необходимости)
    const keysToMigrate = [
      'user_preferences',
      'theme',
      'language',
    ]
    
    for (const key of keysToMigrate) {
      const value = localStorage.getItem(key)
      if (value !== null) {
        try {
          // Пытаемся распарсить как JSON
          const parsedValue = JSON.parse(value)
          await userDataAPI.set(key, parsedValue)
        } catch {
          // Если не JSON, сохраняем как строку
          await userDataAPI.set(key, value)
        }
        // localStorage.removeItem(key) // Опционально: удалить после миграции
      }
    }
  } catch (error) {
    console.error('Ошибка миграции дополнительных данных:', error)
  }
}

/**
 * Проверка, была ли выполнена миграция
 */
const checkMigrationStatus = async () => {
  try {
    const migrationCompleted = await userDataAPI.get('migration_completed')
    return migrationCompleted === true
  } catch (error) {
    console.error('Ошибка проверки статуса миграции:', error)
    return false
  }
}

/**
 * Установка флага завершения миграции
 */
const setMigrationCompleted = async () => {
  try {
    await userDataAPI.set('migration_completed', true)
    await userDataAPI.set('migration_date', new Date().toISOString())
  } catch (error) {
    console.error('Ошибка установки флага миграции:', error)
  }
}

/**
 * Главная функция миграции
 * Выполняется один раз при первой загрузке приложения
 */
export const runMigration = async () => {
  try {
    // Проверяем, не была ли миграция уже выполнена
    const alreadyMigrated = await checkMigrationStatus()
    
    if (alreadyMigrated) {
      console.log('Миграция уже была выполнена ранее')
      return { success: true, alreadyMigrated: true }
    }
    
    console.log('Начинается миграция данных из LocalStorage в IndexedDB...')
    
    // Выполняем все миграции
    await Promise.all([
      migrateAuthData(),
      migrateViewedBooks(),
      migrateOtherData(),
    ])
    
    // Устанавливаем флаг завершения
    await setMigrationCompleted()
    
    console.log('✓ Миграция успешно завершена!')
    
    return { success: true, alreadyMigrated: false }
  } catch (error) {
    console.error('Критическая ошибка при миграции:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Функция для принудительного повторного запуска миграции (для отладки)
 */
export const forceMigration = async () => {
  await userDataAPI.remove('migration_completed')
  return await runMigration()
}

export default runMigration
