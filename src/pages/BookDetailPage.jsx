import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { booksAPI } from '../services/api'
import { useBookStore } from '../stores/useBookStore'
import { useEffect, useMemo } from 'react'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import BookCard from '../components/Book/BookCard'
import './BookDetailPage.css'

function BookDetailPage() {
  const [searchParams] = useSearchParams()
  const bookId = searchParams.get('id')
  const addViewedBook = useBookStore((state) => state.addViewedBook)

  const { data: book, isLoading, error } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => booksAPI.getById(bookId).then(res => res.data),
    enabled: !!bookId,
  })

  const { data: allBooks } = useQuery({
    queryKey: ['books'],
    queryFn: () => booksAPI.getAll().then(res => res.data),
  })

  useEffect(() => {
    if (book?.id) {
      addViewedBook(book.id)
    }
  }, [book, addViewedBook])

  // Похожие книги
  const similarBooks = useMemo(() => {
    if (!book || !allBooks || !Array.isArray(allBooks)) return []
    
    const bookGenreIds = new Set(
      (book.genres || []).map(g => String(typeof g === 'object' ? g.id : g))
    )
    const bookAuthorIds = new Set(
      (book.authors || []).map(a => String(typeof a === 'object' ? a.id : a))
    )
    
    return allBooks
      .filter(b => {
        if (b.id === book.id) return false
        
        const hasCommonGenre = (b.genres || []).some(bg => {
          const bgId = String(typeof bg === 'object' ? bg.id : bg)
          return bookGenreIds.has(bgId)
        })
        
        const hasCommonAuthor = (b.authors || []).some(ba => {
          const baId = String(typeof ba === 'object' ? ba.id : ba)
          return bookAuthorIds.has(baId)
        })
        
        return hasCommonGenre || hasCommonAuthor
      })
      .slice(0, 6)
  }, [book, allBooks])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !book) {
    return (
      <div className="error-container">
        <h2>Книга не найдена</h2>
        <p>{error?.message || 'Не удалось загрузить информацию о книге'}</p>
        <Link to="/" className="back-link">
          Вернуться на главную
        </Link>
      </div>
    )
  }

  const genre = book.genres?.[0]
  const genreName = typeof genre === 'object' ? genre.name : genre

  return (
    <div className="book-detail-page fade-in">
      {/* Хлебные крошки */}
      <nav className="breadcrumbs">
        <Link to="/" className="breadcrumb-link">Главная</Link>
        <span className="breadcrumb-separator">/</span>
        {genreName && (
          <>
            <span className="breadcrumb-text">{genreName}</span>
            <span className="breadcrumb-separator">/</span>
          </>
        )}
        <span className="breadcrumb-text">{book.title}</span>
      </nav>

      <div className="book-detail-container">
        <div className="book-detail-image">
          {book.imageUrl ? (
            <img 
              src={book.imageUrl} 
              alt={book.title}
              onError={(e) => {
                e.target.style.display = 'none'
                const placeholder = e.target.nextElementSibling || e.target.parentElement.querySelector('.book-detail-placeholder')
                if (placeholder) {
                  placeholder.style.display = 'flex'
                } else {
                  const div = document.createElement('div')
                  div.className = 'book-detail-placeholder'
                  div.textContent = '📖'
                  e.target.parentElement.appendChild(div)
                }
              }}
            />
          ) : null}
          <div className="book-detail-placeholder" style={{ display: book.imageUrl ? 'none' : 'flex' }}>📖</div>
        </div>

        <div className="book-detail-info">
          <h1 className="book-detail-title">{book.title}</h1>

          {book.authors && book.authors.length > 0 && (
            <div className="book-detail-meta">
              <span className="meta-label">Автор:</span>
              <span className="meta-value">
                {book.authors.map(a => typeof a === 'object' ? a.name : a).join(', ')}
              </span>
            </div>
          )}

          {book.genres && book.genres.length > 0 && (
            <div className="book-detail-meta">
              <span className="meta-label">Жанры:</span>
              <div className="book-detail-genres">
                {book.genres.map((genre, idx) => (
                  <span key={idx} className="genre-tag">
                    {typeof genre === 'object' ? genre.name : genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {book.publicationYear && (
            <div className="book-detail-meta">
              <span className="meta-label">Год издания:</span>
              <span className="meta-value">{book.publicationYear}</span>
            </div>
          )}

          {book.rating !== undefined && book.rating !== null && (
            <div className="book-detail-meta">
              <span className="meta-label">Рейтинг:</span>
              <span className="meta-value">
                {typeof book.rating === 'number' ? book.rating.toFixed(1) : book.rating} ⭐
              </span>
            </div>
          )}

          {book.description && (
            <div className="book-detail-description">
              <h3>Описание</h3>
              <p>{book.description}</p>
            </div>
          )}
        </div>
      </div>

      {similarBooks.length > 0 && (
        <section className="similar-books-section">
          <h2 className="section-title">Похожие книги</h2>
          <div className="books-grid">
            {similarBooks.map(similarBook => (
              <BookCard key={similarBook.id} book={similarBook} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default BookDetailPage

