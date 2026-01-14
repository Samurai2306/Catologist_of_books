/**
 * IndexedDB конфигурация с использованием Dexie.js
 * Заменяет LocalStorage для более эффективного хранения данных
 */

import Dexie from 'dexie'

// Создаем экземпляр базы данных
export const db = new Dexie('BookCatalogDB')

// Определяем схему базы данных
db.version(1).stores({
  // Книги - история просмотров и кэш
  viewedBooks: '++id, bookId, viewedAt',
  bookCache: 'id, title, author, category, createdAt',
  
  // Пользовательские данные и настройки
  userData: 'key, value',
  
  // Фильтры и поиск
  searchHistory: '++id, query, timestamp',
  
  // Авторизация
  authData: 'key, value, updatedAt',
  
  // Сообщения чата (для оффлайн доступа)
  chatMessages: '++id, timestamp, username, text',
})

// Вспомогательные функции для работы с userData
export const userDataAPI = {
  async get(key) {
    const item = await db.userData.get(key)
    return item ? item.value : null
  },
  
  async set(key, value) {
    await db.userData.put({ key, value })
  },
  
  async remove(key) {
    await db.userData.delete(key)
  },
  
  async clear() {
    await db.userData.clear()
  },
}

// API для работы с историей просмотров
export const viewedBooksAPI = {
  async getAll() {
    return await db.viewedBooks
      .orderBy('viewedAt')
      .reverse()
      .limit(10)
      .toArray()
  },
  
  async add(bookId) {
    // Удаляем дубликаты
    await db.viewedBooks
      .where('bookId')
      .equals(bookId)
      .delete()
    
    // Добавляем новую запись
    await db.viewedBooks.add({
      bookId,
      viewedAt: new Date().toISOString(),
    })
    
    // Оставляем только последние 10
    const all = await db.viewedBooks
      .orderBy('viewedAt')
      .reverse()
      .toArray()
    
    if (all.length > 10) {
      const toDelete = all.slice(10)
      await Promise.all(toDelete.map(item => db.viewedBooks.delete(item.id)))
    }
  },
  
  async clear() {
    await db.viewedBooks.clear()
  },
}

// API для работы с авторизацией
export const authDataAPI = {
  async getCredentials() {
    const item = await db.authData.get('credentials')
    return item ? item.value : null
  },
  
  async saveCredentials(username, password) {
    await db.authData.put({
      key: 'credentials',
      value: { username, password },
      updatedAt: new Date().toISOString(),
    })
  },
  
  async clearCredentials() {
    await db.authData.delete('credentials')
  },
  
  async hasCredentials() {
    const credentials = await this.getCredentials()
    return credentials !== null
  },
}

// API для работы с историей поиска
export const searchHistoryAPI = {
  async getRecent(limit = 10) {
    return await db.searchHistory
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray()
  },
  
  async add(query) {
    if (!query || !query.trim()) return
    
    // Удаляем дубликаты
    await db.searchHistory
      .where('query')
      .equals(query)
      .delete()
    
    // Добавляем новую запись
    await db.searchHistory.add({
      query,
      timestamp: new Date().toISOString(),
    })
    
    // Оставляем только последние 20
    const all = await db.searchHistory
      .orderBy('timestamp')
      .reverse()
      .toArray()
    
    if (all.length > 20) {
      const toDelete = all.slice(20)
      await Promise.all(toDelete.map(item => db.searchHistory.delete(item.id)))
    }
  },
  
  async clear() {
    await db.searchHistory.clear()
  },
}

// API для кэша книг
export const bookCacheAPI = {
  async get(id) {
    return await db.bookCache.get(id)
  },
  
  async set(book) {
    await db.bookCache.put({
      ...book,
      createdAt: new Date().toISOString(),
    })
  },
  
  async getAll() {
    return await db.bookCache.toArray()
  },
  
  async clear() {
    await db.bookCache.clear()
  },
  
  async removeOld(daysOld = 7) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    await db.bookCache
      .where('createdAt')
      .below(cutoffDate.toISOString())
      .delete()
  },
}

// API для сообщений чата
export const chatMessagesAPI = {
  async getAll() {
    return await db.chatMessages
      .orderBy('timestamp')
      .toArray()
  },
  
  async add(message) {
    await db.chatMessages.add({
      ...message,
      timestamp: message.timestamp || new Date().toISOString(),
    })
  },
  
  async clear() {
    await db.chatMessages.clear()
  },
  
  async getRecent(limit = 100) {
    return await db.chatMessages
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray()
  },
}

export default db
