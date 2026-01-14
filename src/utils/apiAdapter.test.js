import { describe, it, expect } from 'vitest'
import {
  adaptBookFromAPI,
  adaptBooksFromAPI,
  adaptBookToAPI,
  adaptAuthorFromAPI,
  adaptAuthorsFromAPI,
  adaptGenreFromAPI,
  adaptGenresFromAPI,
} from './apiAdapter'

describe('API Adapters', () => {
  describe('adaptBookFromAPI', () => {
    it('should adapt book from API format to app format', () => {
      const apiBook = {
        id: 1,
        name: 'Test Book',
        year_of_release: 2023,
        description: 'Test description',
        image: 'test.jpg',
        rating: 4.5,
        author: [
          { id: 1, full_name: 'John Doe' },
          { id: 2, full_name: 'Jane Smith' }
        ],
        genre: [
          { id: 1, name: 'Fiction' },
          { id: 2, name: 'Drama' }
        ]
      }

      const result = adaptBookFromAPI(apiBook)

      expect(result).toMatchObject({
        id: 1,
        title: 'Test Book',
        publicationYear: 2023,
        description: 'Test description',
        rating: 4.5,
        authors: [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' }
        ],
        genres: [
          { id: 1, name: 'Fiction' },
          { id: 2, name: 'Drama' }
        ]
      })
      expect(result.imageUrl).toContain('test.jpg')
    })

    it('should handle null input', () => {
      const result = adaptBookFromAPI(null)
      expect(result).toBeNull()
    })

    it('should handle missing optional fields', () => {
      const apiBook = {
        id: 1,
        name: 'Minimal Book'
      }

      const result = adaptBookFromAPI(apiBook)

      expect(result).toMatchObject({
        id: 1,
        title: 'Minimal Book',
        description: '',
        imageUrl: null,
        authors: [],
        genres: []
      })
    })

    it('should handle different image URL formats', () => {
      const testCases = [
        { image: 'http://example.com/image.jpg', expected: 'http://example.com/image.jpg' },
        { image: '/images/test.jpg', expected: expect.stringContaining('/images/test.jpg') },
        { image: 'relative.jpg', expected: expect.stringContaining('/image/relative.jpg') }
      ]

      testCases.forEach(({ image, expected }) => {
        const result = adaptBookFromAPI({ id: 1, name: 'Test', image })
        expect(result.imageUrl).toEqual(expected)
      })
    })
  })

  describe('adaptBooksFromAPI', () => {
    it('should adapt array of books', () => {
      const apiBooks = [
        { id: 1, name: 'Book 1', author: [], genre: [] },
        { id: 2, name: 'Book 2', author: [], genre: [] }
      ]

      const result = adaptBooksFromAPI(apiBooks)

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Book 1')
      expect(result[1].title).toBe('Book 2')
    })

    it('should return empty array for non-array input', () => {
      expect(adaptBooksFromAPI(null)).toEqual([])
      expect(adaptBooksFromAPI(undefined)).toEqual([])
      expect(adaptBooksFromAPI({})).toEqual([])
    })
  })

  describe('adaptBookToAPI', () => {
    it('should adapt book from app format to API format', () => {
      const appBook = {
        title: 'Test Book',
        publicationYear: 2023,
        description: 'Test description',
        imageUrl: '/images/test.jpg',
        genreIds: [1, 2],
        authorIds: [3, 4]
      }

      const result = adaptBookToAPI(appBook)

      expect(result).toEqual({
        name: 'Test Book',
        year_of_release: 2023,
        description: 'Test description',
        image: 'test.jpg',
        genre: [1, 2],
        author: [3, 4]
      })
    })

    it('should handle different image URL formats', () => {
      const testCases = [
        { imageUrl: '/images/test.jpg', expected: 'test.jpg' },
        { imageUrl: 'http://example.com/images/test.jpg', expected: 'test.jpg' },
        { imageUrl: 'simple.jpg', expected: 'simple.jpg' }
      ]

      testCases.forEach(({ imageUrl, expected }) => {
        const result = adaptBookToAPI({ title: 'Test', imageUrl })
        expect(result.image).toBe(expected)
      })
    })

    it('should handle genre and author objects', () => {
      const appBook = {
        title: 'Test',
        genres: [{ id: 1, name: 'Fiction' }, { id: 2, name: 'Drama' }],
        authors: [{ id: 3, name: 'Author 1' }]
      }

      const result = adaptBookToAPI(appBook)

      expect(result.genre).toEqual([1, 2])
      expect(result.author).toEqual([3])
    })
  })

  describe('adaptAuthorFromAPI', () => {
    it('should adapt author from API format', () => {
      const apiAuthor = { id: 1, full_name: 'John Doe' }
      const result = adaptAuthorFromAPI(apiAuthor)

      expect(result).toEqual({ id: 1, name: 'John Doe' })
    })

    it('should handle null input', () => {
      expect(adaptAuthorFromAPI(null)).toBeNull()
    })

    it('should handle different name formats', () => {
      expect(adaptAuthorFromAPI({ id: 1, full_name: 'Test' }).name).toBe('Test')
      expect(adaptAuthorFromAPI({ id: 1, name: 'Test' }).name).toBe('Test')
      expect(adaptAuthorFromAPI('String Author')).toEqual({ id: undefined, name: 'String Author' })
    })
  })

  describe('adaptAuthorsFromAPI', () => {
    it('should adapt array of authors', () => {
      const apiAuthors = [
        { id: 1, full_name: 'Author 1' },
        { id: 2, full_name: 'Author 2' }
      ]

      const result = adaptAuthorsFromAPI(apiAuthors)

      expect(result).toEqual([
        { id: 1, name: 'Author 1' },
        { id: 2, name: 'Author 2' }
      ])
    })

    it('should return empty array for non-array input', () => {
      expect(adaptAuthorsFromAPI(null)).toEqual([])
      expect(adaptAuthorsFromAPI(undefined)).toEqual([])
    })
  })

  describe('adaptGenreFromAPI', () => {
    it('should adapt genre from API format', () => {
      const apiGenre = { id: 1, name: 'Fiction' }
      const result = adaptGenreFromAPI(apiGenre)

      expect(result).toEqual({ id: 1, name: 'Fiction' })
    })

    it('should handle null input', () => {
      expect(adaptGenreFromAPI(null)).toBeNull()
    })
  })

  describe('adaptGenresFromAPI', () => {
    it('should adapt array of genres', () => {
      const apiGenres = [
        { id: 1, name: 'Fiction' },
        { id: 2, name: 'Drama' }
      ]

      const result = adaptGenresFromAPI(apiGenres)

      expect(result).toEqual([
        { id: 1, name: 'Fiction' },
        { id: 2, name: 'Drama' }
      ])
    })

    it('should return empty array for non-array input', () => {
      expect(adaptGenresFromAPI(null)).toEqual([])
    })
  })
})
