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
import _ from 'lodash'
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

  const filteredBooks = useMemo(() => {
    if (_.isEmpty(allBooks)) return []

    let filtered = _.cloneDeep(allBooks)

    // Поиск с использованием lodash
    if (!_.isEmpty(searchQuery)) {
      const query = _.toLower(searchQuery)
      filtered = _.filter(filtered, book => {
        const titleMatch = _.includes(_.toLower(_.get(book, 'title', '')), query)
        const authorMatch = _.some(
          _.get(book, 'authors', []),
          a => _.includes(_.toLower(_.isString(a) ? a : _.get(a, 'name', '')), query)
        )
        return titleMatch || authorMatch
      })
    }

    // Фильтр по жанру
    if (!_.isNil(selectedGenre)) {
      const genreId = String(selectedGenre)
      filtered = _.filter(filtered, book =>
        _.some(_.get(book, 'genres', []), g => {
          const gId = _.isObject(g) ? _.get(g, 'id') : g
          return String(gId) === genreId
        })
      )
    }

    // Фильтр по автору
    if (!_.isNil(selectedAuthor)) {
      const authorId = String(selectedAuthor)
      filtered = _.filter(filtered, book =>
        _.some(_.get(book, 'authors', []), a => {
          const aId = _.isObject(a) ? _.get(a, 'id') : a
          return String(aId) === authorId
        })
      )
    }

    // Фильтр по году издания
    if (!_.isNil(selectedYear)) {
      const yearValue = Number(selectedYear)
      filtered = _.filter(filtered, book => _.get(book, 'publicationYear') === yearValue)
    }

    // Сортировка с использованием lodash orderBy
    switch (sortBy) {
      case 'title':
        filtered = _.orderBy(filtered, [book => _.toLower(_.get(book, 'title', ''))], ['asc'])
        break
      case 'date':
        filtered = _.orderBy(filtered, [book => new Date(_.get(book, 'createdAt', 0))], ['desc'])
        break
      case 'rating':
        filtered = _.orderBy(filtered, [book => _.get(book, 'rating', 0)], ['desc'])
        break
      default:
        break
    }

    return filtered
  }, [allBooks, searchQuery, selectedGenre, selectedAuthor, selectedYear, sortBy])

  useEffect(() => {
    if (inView && filteredBooks.length > page * itemsPerPage) {
      setPage(prev => prev + 1)
    }
  }, [inView, filteredBooks, page, itemsPerPage])

  const displayedBooks = filteredBooks.slice(0, page * itemsPerPage)
  const hasMore = filteredBooks.length > displayedBooks.length

  // Получаем недавно просмотренные книги с использованием lodash
  const recentBooks = useMemo(() => {
    if (_.isEmpty(viewedBooks)) return []
    return _.chain(viewedBooks)
      .map(id => _.find(allBooks, b => b.id === id))
      .compact()
      .take(6)
      .value()
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
            <p className="empty-state-icon">📚</p>
            <p className="empty-state-text">Книги не найдены</p>
            <p className="empty-state-hint">
              {searchQuery || selectedGenre || selectedAuthor || selectedYear
                ? 'Попробуйте изменить фильтры поиска'
                : 'В каталоге пока нет книг'}
            </p>
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

