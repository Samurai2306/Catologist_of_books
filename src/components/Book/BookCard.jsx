import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { useBookStore } from '../../stores/useBookStore'
import './BookCard.css'

function BookCard({ book }) {
  const cardRef = useRef(null)
  const addViewedBook = useBookStore((state) => state.addViewedBook)

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        {
          opacity: 0,
          y: 30,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
        }
      )
    }
  }, [])

  const handleClick = () => {
    addViewedBook(book.id)
  }

  return (
    <Link 
      ref={cardRef}
      to={`/book?id=${book.id}`} 
      className="book-card glass glass-hover"
      onClick={handleClick}
    >
      <div className="book-card-image">
        {book.imageUrl ? (
          <img 
            src={book.imageUrl} 
            alt={book.title}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none'
              const placeholder = e.target.nextElementSibling || e.target.parentElement.querySelector('.book-card-placeholder')
              if (placeholder) {
                placeholder.style.display = 'flex'
              } else {
                const div = document.createElement('div')
                div.className = 'book-card-placeholder'
                div.textContent = '📖'
                e.target.parentElement.appendChild(div)
              }
            }}
          />
        ) : null}
        <div className="book-card-placeholder" style={{ display: book.imageUrl ? 'none' : 'flex' }}>📖</div>
      </div>
      <div className="book-card-content">
        <h3 className="book-card-title">{book.title}</h3>
        {book.authors && book.authors.length > 0 && (
          <p className="book-card-author">
            {book.authors.map(a => a.name || a).join(', ')}
          </p>
        )}
        {book.genres && book.genres.length > 0 && (
          <div className="book-card-genres">
            {book.genres.slice(0, 2).map((genre, idx) => (
              <span key={idx} className="book-card-genre">
                {typeof genre === 'object' ? genre.name : genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

export default BookCard

