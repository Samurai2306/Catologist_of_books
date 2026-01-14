/**
 * Утилиты для работы с авторизацией API через IndexedDB
 * Замена для auth.js с использованием Dexie.js
 */

import { authDataAPI } from '../db/database'

/**
 * Сохранение учетных данных в IndexedDB
 */
export const saveAuthCredentials = async (username, password) => {
  try {
    await authDataAPI.saveCredentials(username, password)
    return true
  } catch (error) {
    console.error('Ошибка сохранения учетных данных:', error)
    return false
  }
}

/**
 * Получение сохраненных учетных данных из IndexedDB
 */
export const getAuthCredentials = async () => {
  try {
    return await authDataAPI.getCredentials()
  } catch (error) {
    console.error('Ошибка получения учетных данных:', error)
    return null
  }
}

/**
 * Удаление сохраненных учетных данных
 */
export const clearAuthCredentials = async () => {
  try {
    await authDataAPI.clearCredentials()
    return true
  } catch (error) {
    console.error('Ошибка удаления учетных данных:', error)
    return false
  }
}

/**
 * Проверка наличия сохраненных учетных данных
 */
export const hasAuthCredentials = async () => {
  try {
    return await authDataAPI.hasCredentials()
  } catch (error) {
    console.error('Ошибка проверки учетных данных:', error)
    return false
  }
}

/**
 * Синхронная версия для обратной совместимости
 * Использует кэш в памяти
 */
let credentialsCache = null
let cacheInitialized = false

export const initAuthCache = async () => {
  if (!cacheInitialized) {
    credentialsCache = await getAuthCredentials()
    cacheInitialized = true
  }
}

export const getAuthCredentialsSync = () => {
  return credentialsCache
}

export const saveAuthCredentialsSync = async (username, password) => {
  const result = await saveAuthCredentials(username, password)
  if (result) {
    credentialsCache = { username, password }
  }
  return result
}

export const clearAuthCredentialsSync = async () => {
  const result = await clearAuthCredentials()
  if (result) {
    credentialsCache = null
  }
  return result
}
