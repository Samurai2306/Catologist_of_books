/**
 * Book Store с использованием IndexedDB вместо LocalStorage
 */

import { create } from 'zustand'
import { viewedBooksAPI } from '../db/database'

export const useBookStore = create((set, get) => ({
  // История просмотров
  viewedBooks: [],
  
  // Загрузка истории просмотров из IndexedDB
  loadViewedBooks: async () => {
    try {
      const books = await viewedBooksAPI.getAll()
      set({ viewedBooks: books.map(b => b.bookId) })
    } catch (error) {
      console.error('Ошибка загрузки истории просмотров:', error)
    }
  },
  
  // Добавление просмотренной книги
  addViewedBook: async (bookId) => {
    try {
      await viewedBooksAPI.add(bookId)
      // Обновляем локальное состояние
      const books = await viewedBooksAPI.getAll()
      set({ viewedBooks: books.map(b => b.bookId) })
    } catch (error) {
      console.error('Ошибка добавления просмотренной книги:', error)
      // Фоллбэк на локальное состояние при ошибке
      set((state) => {
        const filtered = state.viewedBooks.filter((id) => id !== bookId)
        return { viewedBooks: [bookId, ...filtered].slice(0, 10) }
      })
    }
  },
  
  // Очистка истории просмотров
  clearViewedBooks: async () => {
    try {
      await viewedBooksAPI.clear()
      set({ viewedBooks: [] })
    } catch (error) {
      console.error('Ошибка очистки истории просмотров:', error)
    }
  },

  // Фильтры и поиск (остаются в памяти, не требуют персистентности)
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  selectedGenre: null,
  setSelectedGenre: (genre) => set({ selectedGenre: genre }),

  selectedAuthor: null,
  setSelectedAuthor: (author) => set({ selectedAuthor: author }),

  selectedYear: null,
  setSelectedYear: (year) => set({ selectedYear: year }),

  sortBy: 'title',
  setSortBy: (sort) => set({ sortBy: sort }),

  // Сброс фильтров
  resetFilters: () =>
    set({
      searchQuery: '',
      selectedGenre: null,
      selectedAuthor: null,
      selectedYear: null,
      sortBy: 'title',
    }),
}))

// Инициализация: загрузка данных при создании store
if (typeof window !== 'undefined') {
  useBookStore.getState().loadViewedBooks()
}
