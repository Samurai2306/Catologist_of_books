import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authorsAPI, genresAPI, booksAPI } from '../../services/api'
import { useBookStore } from '../../stores/useBookStore'
import Input from '../UI/Input'
import Select from '../UI/Select'
import Button from '../UI/Button'
import './BookFilters.css'

function BookFilters() {
  const {
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    selectedAuthor,
    setSelectedAuthor,
    selectedYear,
    setSelectedYear,
    sortBy,
    setSortBy,
    resetFilters,
  } = useBookStore()

  const [localSearch, setLocalSearch] = useState(searchQuery)

  const { data: authorsData } = useQuery({
    queryKey: ['authors'],
    queryFn: () => authorsAPI.getAll().then(res => res.data),
  })

  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: () => genresAPI.getAll().then(res => res.data),
  })

  const { data: booksData } = useQuery({
    queryKey: ['books'],
    queryFn: () => booksAPI.getAll().then(res => res.data),
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, setSearchQuery])

  const authors = authorsData || []
  const genres = genresData || []
  
  // Получаем уникальные годы издания
  const availableYears = useMemo(() => {
    if (!booksData) return []
    const years = booksData
      .map(book => book.publicationYear)
      .filter(year => year != null && year !== '')
      .sort((a, b) => b - a)
    return [...new Set(years)]
  }, [booksData])

  const sortOptions = [
    { value: 'title', label: 'По названию' },
    { value: 'date', label: 'По дате добавления' },
    { value: 'rating', label: 'По рейтингу' },
  ]

  return (
    <div className="book-filters glass">
      <div className="filters-header">
        <h2 className="filters-title">Фильтры и поиск</h2>
        <Button variant="secondary" onClick={resetFilters} size="small">
          Сбросить
        </Button>
      </div>
      <div className="filters-content">
        <Input
          type="text"
          placeholder="Поиск по названию..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="filter-input"
        />
        <Select
          placeholder="Все жанры"
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value || null)}
          options={genres.map(g => ({
            value: g.id,
            label: g.name || g,
          }))}
        />
        <Select
          placeholder="Все авторы"
          value={selectedAuthor}
          onChange={(e) => setSelectedAuthor(e.target.value || null)}
          options={authors.map(a => ({
            value: a.id,
            label: a.name || a,
          }))}
        />
        <Select
          placeholder="Все годы"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value || null)}
          options={availableYears.map(year => ({
            value: year,
            label: year.toString(),
          }))}
        />
        <Select
          label="Сортировка"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          options={sortOptions}
        />
      </div>
    </div>
  )
}

export default BookFilters

