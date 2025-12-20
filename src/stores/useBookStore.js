import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useBookStore = create(
  persist(
    (set) => ({
      // История просмотров
      viewedBooks: [],
      addViewedBook: (bookId) =>
        set((state) => {
          const filtered = state.viewedBooks.filter((id) => id !== bookId)
          return { viewedBooks: [bookId, ...filtered].slice(0, 10) }
        }),

      // Фильтры и поиск
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
    }),
    {
      name: 'book-storage',
      partialize: (state) => ({ viewedBooks: state.viewedBooks }),
    }
  )
)

