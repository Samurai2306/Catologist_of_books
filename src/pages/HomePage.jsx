import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { booksAPI } from '../services/api'
import { API_CONFIG } from '../config/api'
import { useBookStore } from '../stores/useBookStore'
import BookCard from '../components/Book/BookCard'
import BookFilters from '../components/Book/BookFilters'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import Button from '../components/UI/Button'
import { useInView } from 'react-intersection-observer'
import { useEffect, useState } from 'react'
import './HomePage.css'

function HomePage() {
  const {
    searchQuery,
    selectedGenre,
    selectedAuthor,
    selectedYear,
    sortBy,
    viewedBooks,
  } = useBookStore()

  const [page, setPage] = useState(1)
  const [allBooks, setAllBooks] = useState([])
  const itemsPerPage = 12

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['books'],
    queryFn: () => booksAPI.getAll().then(res => res.data),
  })

  const { ref, inView } = useInView({
    threshold: 0.1,
  })

  useEffect(() => {
    if (data) {
      setAllBooks(data)
      setPage(1)
    }
  }, [data])

  useEffect(() => {
    if (inView && filteredBooks.length > page * itemsPerPage) {
      setPage(prev => prev + 1)
    }
  }, [inView])

  const filteredBooks = useMemo(() => {
    if (!allBooks || allBooks.length === 0) return []

    let filtered = [...allBooks]

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(book =>
        book.title?.toLowerCase().includes(query) ||
        book.authors?.some(a => 
          (typeof a === 'string' ? a : a.name)?.toLowerCase().includes(query)
        )
      )
    }

    // Фильтр по жанру
    if (selectedGenre) {
      filtered = filtered.filter(book =>
        book.genres?.some(g => 
          (typeof g === 'object' ? g.id : g) === selectedGenre
        )
      )
    }

    // Фильтр по автору
    if (selectedAuthor) {
      filtered = filtered.filter(book =>
        book.authors?.some(a => 
          (typeof a === 'object' ? a.id : a) === selectedAuthor
        )
      )
    }

    // Фильтр по году издания
    if (selectedYear) {
      filtered = filtered.filter(book =>
        book.publicationYear === Number(selectedYear)
      )
    }

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '')
        case 'date':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [allBooks, searchQuery, selectedGenre, selectedAuthor, selectedYear, sortBy])

  const displayedBooks = filteredBooks.slice(0, page * itemsPerPage)
  const hasMore = filteredBooks.length > displayedBooks.length

  // Получаем недавно просмотренные книги
  const recentBooks = useMemo(() => {
    if (!viewedBooks || viewedBooks.length === 0) return []
    return viewedBooks
      .map(id => allBooks.find(b => b.id === id))
      .filter(Boolean)
      .slice(0, 6)
  }, [viewedBooks, allBooks])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    const is404 = error.message?.includes('404') || error.message?.includes('не найден')
    return (
      <div className="error-container">
        <h2>Ошибка загрузки</h2>
        <p className="error-message">{error.message}</p>
        {is404 && (
          <div className="error-hint">
            <p>Возможные причины:</p>
            <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '0.5rem' }}>
              <li>API сервер недоступен или не запущен</li>
              <li>Неверный адрес API endpoint</li>
              <li>Проблемы с сетью или CORS</li>
            </ul>
            <p style={{ marginTop: '1rem' }}>
              Проверьте доступность API по адресу: <br />
              <code>{API_CONFIG.REST_API}</code>
            </p>
          </div>
        )}
        <Button onClick={() => refetch()} variant="primary" style={{ marginTop: '1.5rem' }}>
          Попробовать снова
        </Button>
      </div>
    )
  }

  return (
    <div className="home-page fade-in">
      <BookFilters />

      {recentBooks.length > 0 && (
        <section className="recent-section">
          <h2 className="section-title">Недавно просмотренные</h2>
          <div className="books-grid">
            {recentBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      <section className="books-section">
        <h2 className="section-title">
          Все книги {filteredBooks.length > 0 && `(${filteredBooks.length})`}
        </h2>
        {displayedBooks.length === 0 ? (
          <div className="empty-state">
            <p>Книги не найдены</p>
          </div>
        ) : (
          <>
            <div className="books-grid">
              {displayedBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
            {hasMore && (
              <div ref={ref} className="load-more-trigger">
                <LoadingSpinner />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default HomePage

