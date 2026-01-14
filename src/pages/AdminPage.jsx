import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { booksAPI, authorsAPI, genresAPI, imagesAPI } from '../services/api'
import Button from '../components/UI/Button'
import Modal from '../components/UI/Modal'
import Input from '../components/UI/Input'
import Select from '../components/UI/Select'
import MultiSelect from '../components/UI/MultiSelect'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import AuthSettings from '../components/Admin/AuthSettings'
import { hasAuthCredentials } from '../utils/auth'
import toast from 'react-hot-toast'
import './AdminPage.css'

function AdminPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('books')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState(null) // 'create' | 'edit'
  const [editingItem, setEditingItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showAuthSettings, setShowAuthSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Загрузка данных
  const { data: books, isLoading: booksLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => booksAPI.getAll().then(res => res.data),
  })

  const { data: authors, isLoading: authorsLoading } = useQuery({
    queryKey: ['authors'],
    queryFn: () => authorsAPI.getAll().then(res => res.data),
  })

  const { data: genres, isLoading: genresLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: () => genresAPI.getAll().then(res => res.data),
  })

  // Мутации для книг
  const createBookMutation = useMutation({
    mutationFn: (data) => booksAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['books'])
      toast.success('Книга успешно создана')
      setIsModalOpen(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка при создании книги')
    },
  })

  const updateBookMutation = useMutation({
    mutationFn: ({ id, data }) => booksAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['books'])
      toast.success('Книга успешно обновлена')
      setIsModalOpen(false)
      setEditingItem(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка при обновлении книги')
      if (error.isAuthError || error.message?.includes('401') || error.message?.includes('авторизац')) {
        setTimeout(() => {
          if (window.confirm('Требуется авторизация. Открыть настройки авторизации?')) {
            setShowAuthSettings(true)
          }
        }, 1000)
      }
    },
  })

  const deleteBookMutation = useMutation({
    mutationFn: (id) => booksAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['books'])
      toast.success('Книга успешно удалена')
      setDeleteConfirm(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка при удалении книги')
      if (error.isAuthError || error.message?.includes('401') || error.message?.includes('авторизац')) {
        setTimeout(() => {
          if (window.confirm('Требуется авторизация. Открыть настройки авторизации?')) {
            setShowAuthSettings(true)
          }
        }, 1000)
      }
    },
  })

  // Мутации для авторов
  const createAuthorMutation = useMutation({
    mutationFn: (data) => authorsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['authors'])
      toast.success('Автор успешно создан')
      setIsModalOpen(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка при создании автора')
      if (error.isAuthError || error.message?.includes('401') || error.message?.includes('авторизац')) {
        setTimeout(() => {
          if (window.confirm('Требуется авторизация. Открыть настройки авторизации?')) {
            setShowAuthSettings(true)
          }
        }, 1000)
      }
    },
  })

  const updateAuthorMutation = useMutation({
    mutationFn: ({ id, data }) => authorsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['authors'])
      toast.success('Автор успешно обновлен')
      setIsModalOpen(false)
      setEditingItem(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка при обновлении автора')
      if (error.isAuthError || error.message?.includes('401') || error.message?.includes('авторизац')) {
        setTimeout(() => {
          if (window.confirm('Требуется авторизация. Открыть настройки авторизации?')) {
            setShowAuthSettings(true)
          }
        }, 1000)
      }
    },
  })

  const deleteAuthorMutation = useMutation({
    mutationFn: (id) => authorsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['authors'])
      toast.success('Автор успешно удален')
      setDeleteConfirm(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка при удалении автора')
      if (error.isAuthError || error.message?.includes('401') || error.message?.includes('авторизац')) {
        setTimeout(() => {
          if (window.confirm('Требуется авторизация. Открыть настройки авторизации?')) {
            setShowAuthSettings(true)
          }
        }, 1000)
      }
    },
  })

  // Мутации для жанров
  const createGenreMutation = useMutation({
    mutationFn: (data) => genresAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['genres'])
      toast.success('Жанр успешно создан')
      setIsModalOpen(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка при создании жанра')
      if (error.isAuthError || error.message?.includes('401') || error.message?.includes('авторизац')) {
        setTimeout(() => {
          if (window.confirm('Требуется авторизация. Открыть настройки авторизации?')) {
            setShowAuthSettings(true)
          }
        }, 1000)
      }
    },
  })

  const updateGenreMutation = useMutation({
    mutationFn: ({ id, data }) => genresAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['genres'])
      toast.success('Жанр успешно обновлен')
      setIsModalOpen(false)
      setEditingItem(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка при обновлении жанра')
      if (error.isAuthError || error.message?.includes('401') || error.message?.includes('авторизац')) {
        setTimeout(() => {
          if (window.confirm('Требуется авторизация. Открыть настройки авторизации?')) {
            setShowAuthSettings(true)
          }
        }, 1000)
      }
    },
  })

  const deleteGenreMutation = useMutation({
    mutationFn: (id) => genresAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['genres'])
      toast.success('Жанр успешно удален')
      setDeleteConfirm(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Ошибка при удалении жанра')
      if (error.isAuthError || error.message?.includes('401') || error.message?.includes('авторизац')) {
        setTimeout(() => {
          if (window.confirm('Требуется авторизация. Открыть настройки авторизации?')) {
            setShowAuthSettings(true)
          }
        }, 1000)
      }
    },
  })

  // Обработчики
  const handleCreate = () => {
    setModalType('create')
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = async (item) => {
    setModalType('edit')
    setIsModalOpen(true)
    // Загружаем полные данные книги из API для редактирования
    if (activeTab === 'books' && item?.id) {
      try {
        const fullBook = await booksAPI.getById(item.id)
        setEditingItem(fullBook.data)
      } catch (error) {
        // Если не удалось загрузить, используем данные из списка
        setEditingItem(item)
        toast.error('Не удалось загрузить полные данные книги')
      }
    } else {
      setEditingItem(item)
    }
  }

  const handleDelete = (item) => {
    setDeleteConfirm(item)
  }

  const confirmDelete = () => {
    if (!deleteConfirm) return

    if (activeTab === 'books') {
      deleteBookMutation.mutate(deleteConfirm.id)
    } else if (activeTab === 'authors') {
      deleteAuthorMutation.mutate(deleteConfirm.id)
    } else if (activeTab === 'genres') {
      deleteGenreMutation.mutate(deleteConfirm.id)
    }
  }

  if (booksLoading || authorsLoading || genresLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="admin-page fade-in">
      <div className="admin-header glass">
        <h1 className="admin-title">Административная панель</h1>
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            Книги
          </button>
          <button
            className={`admin-tab ${activeTab === 'authors' ? 'active' : ''}`}
            onClick={() => setActiveTab('authors')}
          >
            Авторы
          </button>
          <button
            className={`admin-tab ${activeTab === 'genres' ? 'active' : ''}`}
            onClick={() => setActiveTab('genres')}
          >
            Жанры
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-actions">
          <div className="admin-actions-left">
            <Button onClick={handleCreate} variant="primary">
              + Создать {activeTab === 'books' ? 'книгу' : activeTab === 'authors' ? 'автора' : 'жанр'}
            </Button>
          </div>
          <div className="admin-actions-right">
            <Input
              type="text"
              placeholder={`Поиск ${activeTab === 'books' ? 'книг' : activeTab === 'authors' ? 'авторов' : 'жанров'}...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="admin-search-input"
            />
            <Button 
              onClick={() => setShowAuthSettings(true)} 
              variant="secondary"
              size="small"
              title="Настройки авторизации API"
            >
              🔐 Авторизация
            </Button>
          </div>
        </div>

        {activeTab === 'books' && (
          <BooksTable
            books={books || []}
            authors={authors || []}
            genres={genres || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}

        {activeTab === 'authors' && (
          <AuthorsTable
            authors={authors || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}

        {activeTab === 'genres' && (
          <GenresTable
            genres={genres || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchQuery={searchQuery}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Модальное окно для создания/редактирования */}
      {isModalOpen && (
        <AdminModal
          type={activeTab}
          mode={modalType}
          item={editingItem}
          authors={authors || []}
          genres={genres || []}
          onClose={() => {
            setIsModalOpen(false)
            setEditingItem(null)
          }}
          onCreate={createBookMutation.mutate}
          onUpdate={updateBookMutation.mutate}
          onCreateAuthor={createAuthorMutation.mutate}
          onUpdateAuthor={updateAuthorMutation.mutate}
          onCreateGenre={createGenreMutation.mutate}
          onUpdateGenre={updateGenreMutation.mutate}
        />
      )}

      {/* Диалог подтверждения удаления */}
      {deleteConfirm && (
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Подтверждение удаления"
          size="small"
        >
          <div className="delete-confirm">
            <p>
              Вы уверены, что хотите удалить{' '}
              <strong>
                {deleteConfirm.title || deleteConfirm.name || 'этот элемент'}
              </strong>
              ?
            </p>
            <p className="delete-warning">Это действие нельзя отменить.</p>
            <div className="delete-actions">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Отмена
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                disabled={
                  deleteBookMutation.isPending ||
                  deleteAuthorMutation.isPending ||
                  deleteGenreMutation.isPending
                }
              >
                Удалить
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Модальное окно настроек авторизации */}
      <AuthSettings 
        isOpen={showAuthSettings} 
        onClose={() => setShowAuthSettings(false)} 
      />
    </div>
  )
}

// Компонент таблицы книг
function BooksTable({ books, authors, genres, onEdit, onDelete, searchQuery = '', currentPage = 1, itemsPerPage = 10, onPageChange }) {
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredBooks = books.filter(book => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const title = (book.title || '').toLowerCase()
    const bookAuthors = (book.authors || []).map(a => 
      (typeof a === 'object' ? (a.name || a.full_name || '') : a).toLowerCase()
    ).join(' ')
    const bookGenres = (book.genres || []).map(g => 
      (typeof g === 'object' ? g.name : g).toLowerCase()
    ).join(' ')
    return title.includes(query) || bookAuthors.includes(query) || bookGenres.includes(query)
  })

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (!sortField) return 0
    
    let aValue, bValue
    switch (sortField) {
      case 'id':
        aValue = a.id
        bValue = b.id
        break
      case 'title':
        aValue = (a.title || '').toLowerCase()
        bValue = (b.title || '').toLowerCase()
        break
      case 'year':
        aValue = a.publicationYear || 0
        bValue = b.publicationYear || 0
        break
      default:
        return 0
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage)
  const paginatedBooks = sortedBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      onPageChange(1)
    }
  }, [totalPages, currentPage, onPageChange])

  return (
    <div className="admin-table-container glass">
      <div className="admin-table-header">
        <p className="admin-table-info">
          Найдено: {filteredBooks.length} {filteredBooks.length === 1 ? 'книга' : filteredBooks.length < 5 ? 'книги' : 'книг'}
        </p>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Обложка</th>
            <th>Название</th>
            <th>Авторы</th>
            <th>Жанры</th>
            <th>Год</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {paginatedBooks.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-cell">
                {searchQuery ? 'Книги не найдены по запросу' : 'Книги не найдены'}
              </td>
            </tr>
          ) : (
            paginatedBooks.map((book) => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>
                  {book.imageUrl ? (
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="table-image"
                    />
                  ) : (
                    <div className="table-image-placeholder">📖</div>
                  )}
                </td>
                <td>{book.title}</td>
                <td>
                  {book.authors && book.authors.length > 0 ? (
                    book.authors.map((a, idx) => (
                      <span key={idx} className="table-tag">
                        {typeof a === 'object' ? (a.name || a.full_name || a) : a}
                      </span>
                    ))
                  ) : (
                    <span className="table-empty">-</span>
                  )}
                </td>
                <td>
                  {book.genres && book.genres.length > 0 ? (
                    book.genres.map((g, idx) => (
                      <span key={idx} className="table-tag">
                        {typeof g === 'object' ? (g.name || g) : g}
                      </span>
                    ))
                  ) : (
                    <span className="table-empty">-</span>
                  )}
                </td>
                <td>{book.publicationYear ? String(book.publicationYear) : '-'}</td>
                <td>
                  <div className="table-actions">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => onEdit(book)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => onDelete(book)}
                    >
                      Удалить
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="admin-pagination">
          <Button
            variant="secondary"
            size="small"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ← Назад
          </Button>
          <span className="pagination-info">
            Страница {currentPage} из {totalPages}
          </span>
          <Button
            variant="secondary"
            size="small"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Вперед →
          </Button>
        </div>
      )}
    </div>
  )
}

// Компонент таблицы авторов
function AuthorsTable({ authors, onEdit, onDelete, searchQuery = '', currentPage = 1, itemsPerPage = 10, onPageChange }) {
  const filteredAuthors = authors.filter(author => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const name = (author.name || '').toLowerCase()
    return name.includes(query)
  })

  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage)
  const paginatedAuthors = filteredAuthors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      onPageChange(1)
    }
  }, [totalPages, currentPage, onPageChange])

  return (
    <div className="admin-table-container glass">
      <div className="admin-table-header">
        <p className="admin-table-info">
          Найдено: {filteredAuthors.length} {filteredAuthors.length === 1 ? 'автор' : filteredAuthors.length < 5 ? 'автора' : 'авторов'}
        </p>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {paginatedAuthors.length === 0 ? (
            <tr>
              <td colSpan="3" className="empty-cell">
                {searchQuery ? 'Авторы не найдены по запросу' : 'Авторы не найдены'}
              </td>
            </tr>
          ) : (
            paginatedAuthors.map((author) => (
              <tr key={author.id}>
                <td>{author.id}</td>
                <td>{author.name}</td>
                <td>
                  <div className="table-actions">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => onEdit(author)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => onDelete(author)}
                    >
                      Удалить
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="admin-pagination">
          <Button
            variant="secondary"
            size="small"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ← Назад
          </Button>
          <span className="pagination-info">
            Страница {currentPage} из {totalPages}
          </span>
          <Button
            variant="secondary"
            size="small"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Вперед →
          </Button>
        </div>
      )}
    </div>
  )
}

// Компонент таблицы жанров
function GenresTable({ genres, onEdit, onDelete, searchQuery = '', currentPage = 1, itemsPerPage = 10, onPageChange }) {
  const filteredGenres = genres.filter(genre => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const name = (genre.name || '').toLowerCase()
    return name.includes(query)
  })

  const totalPages = Math.ceil(filteredGenres.length / itemsPerPage)
  const paginatedGenres = filteredGenres.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      onPageChange(1)
    }
  }, [totalPages, currentPage, onPageChange])

  return (
    <div className="admin-table-container glass">
      <div className="admin-table-header">
        <p className="admin-table-info">
          Найдено: {filteredGenres.length} {filteredGenres.length === 1 ? 'жанр' : filteredGenres.length < 5 ? 'жанра' : 'жанров'}
        </p>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {paginatedGenres.length === 0 ? (
            <tr>
              <td colSpan="3" className="empty-cell">
                {searchQuery ? 'Жанры не найдены по запросу' : 'Жанры не найдены'}
              </td>
            </tr>
          ) : (
            paginatedGenres.map((genre) => (
              <tr key={genre.id}>
                <td>{genre.id}</td>
                <td>{genre.name}</td>
                <td>
                  <div className="table-actions">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => onEdit(genre)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => onDelete(genre)}
                    >
                      Удалить
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="admin-pagination">
          <Button
            variant="secondary"
            size="small"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ← Назад
          </Button>
          <span className="pagination-info">
            Страница {currentPage} из {totalPages}
          </span>
          <Button
            variant="secondary"
            size="small"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Вперед →
          </Button>
        </div>
      )}
    </div>
  )
}

// Модальное окно для форм
function AdminModal({
  type,
  mode,
  item,
  authors,
  genres,
  onClose,
  onCreate,
  onUpdate,
  onCreateAuthor,
  onUpdateAuthor,
  onCreateGenre,
  onUpdateGenre,
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    publicationYear: '',
    rating: '',
    imageUrl: '',
    authorIds: [],
    genreIds: [],
    name: '', // для авторов и жанров
  })

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)

  // Используем useMemo для вычисления данных формы на основе item
  const initialFormData = useMemo(() => {
    if (!item) {
      return {
        title: '',
        description: '',
        publicationYear: '',
        rating: '',
        imageUrl: '',
        authorIds: [],
        genreIds: [],
        name: '',
      }
    }

    if (type === 'books') {
      // Извлекаем ID авторов, убеждаемся что это строки
      const authorIds = (item.authors || []).map((a) => {
        if (typeof a === 'object' && a !== null) {
          return String(a.id || a)
        }
        return String(a)
      }).filter(id => id && id !== 'undefined' && id !== 'null' && id !== '')
      
      // Извлекаем ID жанров, убеждаемся что это строки
      const genreIds = (item.genres || []).map((g) => {
        if (typeof g === 'object' && g !== null) {
          return String(g.id || g)
        }
        return String(g)
      }).filter(id => id && id !== 'undefined' && id !== 'null' && id !== '')
      
      return {
        title: item.title || '',
        description: item.description || '',
        publicationYear: item.publicationYear != null && item.publicationYear !== '' 
          ? String(item.publicationYear) 
          : '',
        rating: item.rating != null && item.rating !== '' 
          ? String(item.rating) 
          : '',
        imageUrl: item.imageUrl || '',
        authorIds: authorIds.length > 0 ? authorIds : [],
        genreIds: genreIds.length > 0 ? genreIds : [],
      }
    } else if (type === 'authors' || type === 'genres') {
      return {
        name: item.name || '',
      }
    }

    return {
      title: '',
      description: '',
      publicationYear: '',
      rating: '',
      imageUrl: '',
      authorIds: [],
      genreIds: [],
      name: '',
    }
  }, [item, type])

  useEffect(() => {
    // Принудительно обновляем форму при изменении item
    if (item && type === 'books') {
      setFormData(initialFormData)
      setImagePreview(item.imageUrl || null)
      setImageFile(null)
    } else if (item && (type === 'authors' || type === 'genres')) {
      setFormData(initialFormData)
    } else {
      setFormData(initialFormData)
      setImagePreview(null)
      setImageFile(null)
    }
  }, [initialFormData, item, type])

  const validate = () => {
    const newErrors = {}

    if (type === 'books') {
      if (!formData.title.trim()) {
        newErrors.title = 'Название обязательно'
      }
      if (formData.publicationYear && isNaN(formData.publicationYear)) {
        newErrors.publicationYear = 'Год должен быть числом'
      }
      if (formData.rating && (isNaN(formData.rating) || formData.rating < 0 || formData.rating > 10)) {
        newErrors.rating = 'Рейтинг должен быть от 0 до 10'
      }
    } else {
      if (!formData.name.trim()) {
        newErrors.name = 'Название обязательно'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadImage = async () => {
    if (!imageFile) return formData.imageUrl

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', imageFile)
      const response = await imagesAPI.upload(formDataUpload)
      setUploading(false)
      // API возвращает { name: string }, адаптер уже преобразует в url
      return response.data.url || response.data.imageUrl || formData.imageUrl
    } catch (error) {
      setUploading(false)
      toast.error('Ошибка загрузки изображения')
      return formData.imageUrl
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      if (type === 'books') {
        const imageUrl = await handleUploadImage()
        const data = {
          ...formData,
          imageUrl,
          authorIds: formData.authorIds.map(Number),
          genreIds: formData.genreIds.map(Number),
          publicationYear: formData.publicationYear
            ? Number(formData.publicationYear)
            : null,
          rating: formData.rating ? Number(formData.rating) : null,
        }

        if (mode === 'create') {
          onCreate(data)
        } else {
          onUpdate({ id: item.id, data })
        }
      } else if (type === 'authors') {
        const data = { name: formData.name }
        if (mode === 'create') {
          onCreateAuthor(data)
        } else {
          onUpdateAuthor({ id: item.id, data })
        }
      } else if (type === 'genres') {
        const data = { name: formData.name }
        if (mode === 'create') {
          onCreateGenre(data)
        } else {
          onUpdateGenre({ id: item.id, data })
        }
      }
    } catch (error) {
      toast.error(error.message || 'Ошибка при сохранении')
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={mode === 'create' ? `Создать ${type === 'books' ? 'книгу' : type === 'authors' ? 'автора' : 'жанр'}` : `Редактировать ${type === 'books' ? 'книгу' : type === 'authors' ? 'автора' : 'жанр'}`}
      size="large"
    >
      <form onSubmit={handleSubmit} className="admin-form">
        {type === 'books' ? (
          <>
            <div className="form-group">
              <label>Название *</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                error={errors.title}
              />
            </div>

            <div className="form-group">
              <label>Описание</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Год издания</label>
                <Input
                  type="number"
                  value={formData.publicationYear}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      publicationYear: e.target.value,
                    })
                  }
                  error={errors.publicationYear}
                />
              </div>

              <div className="form-group">
                <label>Рейтинг (0-10)</label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: e.target.value })
                  }
                  error={errors.rating}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Авторы</label>
              <MultiSelect
                value={formData.authorIds}
                onChange={(e) => {
                  const values = Array.from(
                    e.target.selectedOptions || [],
                    (option) => option.value
                  )
                  setFormData({ ...formData, authorIds: values })
                }}
                options={authors.map((a) => ({
                  value: String(a.id),
                  label: a.name,
                }))}
                placeholder="Выберите авторов..."
              />
            </div>

            <div className="form-group">
              <label>Жанры</label>
              <MultiSelect
                value={formData.genreIds}
                onChange={(e) => {
                  const values = Array.from(
                    e.target.selectedOptions || [],
                    (option) => option.value
                  )
                  setFormData({ ...formData, genreIds: values })
                }}
                options={genres.map((g) => ({
                  value: String(g.id),
                  label: g.name,
                }))}
                placeholder="Выберите жанры..."
              />
            </div>

            <div className="form-group">
              <label>Обложка</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-file-input"
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
              {!imageFile && formData.imageUrl && (
                <Input
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="Или введите URL"
                />
              )}
            </div>
          </>
        ) : (
          <div className="form-group">
            <label>Название *</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={errors.name}
            />
          </div>
        )}

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={uploading}
          >
            {uploading ? 'Загрузка...' : mode === 'create' ? 'Создать' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AdminPage

