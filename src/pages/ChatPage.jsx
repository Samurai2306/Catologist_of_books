import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useChatStore } from '../stores/useChatStore'
import { API_CONFIG } from '../config/api'
import { useQuery } from '@tanstack/react-query'
import { booksAPI } from '../services/api'
import Button from '../components/UI/Button'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import toast from 'react-hot-toast'
import './ChatPage.css'

function ChatPage() {
  const {
    messages,
    isConnected,
    onlineUsers,
    unreadCount,
    addMessage,
    setMessages,
    setConnected,
    setOnlineUsers,
    resetUnreadCount,
  } = useChatStore()

  const [inputMessage, setInputMessage] = useState('')
  const [username, setUsername] = useState('')
  const [showUsernameInput, setShowUsernameInput] = useState(true)
  const [usernameError, setUsernameError] = useState('')
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)

  const { data: books } = useQuery({
    queryKey: ['books'],
    queryFn: () => booksAPI.getAll().then(res => res.data),
  })

  useEffect(() => {
    if (!showUsernameInput && username) {
      // Подключение к Socket.IO
      socketRef.current = io(API_CONFIG.WS_SOCKET_IO, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      })

      const socket = socketRef.current

      socket.on('connect', () => {
        setConnected(true)
        socket.emit('user:join', { username })
        toast.success('Подключено к чату')
      })

      socket.on('disconnect', () => {
        setConnected(false)
        toast.error('Отключено от чата')
      })

      socket.on('message:new', (message) => {
        addMessage(message)
        scrollToBottom()
      })

      socket.on('messages:history', (history) => {
        setMessages(history)
        scrollToBottom()
      })

      socket.on('users:online', (users) => {
        setOnlineUsers(users)
      })

      socket.on('error', (error) => {
        toast.error(error.message || 'Ошибка в чате')
      })

      return () => {
        socket.disconnect()
        setConnected(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUsernameInput, username])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isConnected) {
      resetUnreadCount()
    }
  }, [isConnected, resetUnreadCount])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleUsernameSubmit = (e) => {
    e.preventDefault()
    const trimmedUsername = username.trim()
    
    if (!trimmedUsername) {
      setUsernameError('Введите ваше имя')
      return
    }
    
    if (trimmedUsername.length < 2) {
      setUsernameError('Имя должно содержать минимум 2 символа')
      return
    }
    
    if (trimmedUsername.length > 30) {
      setUsernameError('Имя не должно превышать 30 символов')
      return
    }
    
    setUsernameError('')
    setShowUsernameInput(false)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || !socketRef.current || !isConnected) return

    // Проверка на ссылки на книги
    const bookLinkRegex = /\/book\?id=(\d+)/g
    const matches = [...inputMessage.matchAll(bookLinkRegex)]
    
    let messageText = inputMessage
    const bookIds = matches.map(m => m[1])

    socketRef.current.emit('message:send', {
      text: messageText,
      username,
      bookIds: bookIds.length > 0 ? bookIds : undefined,
    })

    setInputMessage('')
  }

  if (showUsernameInput) {
    return (
      <div className="chat-page fade-in">
        <div className="chat-container glass">
          <h1 className="chat-title">Добро пожаловать в чат</h1>
          <form onSubmit={handleUsernameSubmit} className="username-form">
            <input
              type="text"
              placeholder="Введите ваше имя"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (usernameError) setUsernameError('')
              }}
              className={`username-input ${usernameError ? 'error' : ''}`}
              maxLength={30}
            />
            {usernameError && (
              <span className="username-error">{usernameError}</span>
            )}
            <Button type="submit" variant="primary">
              Войти в чат
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-page fade-in">
      <div className="chat-container glass">
        <div className="chat-header">
          <div className="chat-header-info">
            <h1 className="chat-title">Чат</h1>
            <div className="chat-status">
              <span
                className={`status-indicator ${isConnected ? 'online' : 'offline'}`}
              />
              <span className="status-text">
                {isConnected ? 'Подключено' : 'Отключено'}
              </span>
            </div>
          </div>
          <div className="online-users">
            <span className="online-count">
              Онлайн: {onlineUsers.length}
            </span>
          </div>
        </div>

        <div className="chat-messages" id="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <p>Нет сообщений. Начните общение!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={message.id || index}
                message={message}
                currentUsername={username}
                books={books || []}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            placeholder={
              isConnected
                ? 'Введите сообщение... (можно добавить ссылку на книгу)'
                : 'Подключение...'
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="chat-input"
            disabled={!isConnected}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!isConnected || !inputMessage.trim()}
          >
            Отправить
          </Button>
        </form>
      </div>
    </div>
  )
}

// Компонент сообщения
function ChatMessage({ message, currentUsername, books }) {
  const isOwn = message.username === currentUsername
  const timestamp = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  // Поиск книг в сообщении
  const bookLinks = message.bookIds
    ? message.bookIds
        .map((id) => books.find((b) => b.id === Number(id)))
        .filter(Boolean)
    : []

  // Извлечение текста без ссылок
  let messageText = message.text || message.message || ''
  const bookLinkRegex = /\/book\?id=(\d+)/g
  messageText = messageText.replace(bookLinkRegex, '').trim()

  return (
    <div className={`chat-message ${isOwn ? 'own' : ''}`}>
      <div className="message-header">
        <span className="message-username">{message.username}</span>
        {timestamp && <span className="message-time">{timestamp}</span>}
      </div>
      {messageText && (
        <div className="message-text">{messageText}</div>
      )}
      {bookLinks.length > 0 && (
        <div className="message-books">
          {bookLinks.map((book) => (
            <BookPreview key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}

// Компонент превью книги
function BookPreview({ book }) {
  return (
    <a
      href={`/book?id=${book.id}`}
      className="book-preview"
      onClick={(e) => {
        e.preventDefault()
        window.location.href = `/book?id=${book.id}`
      }}
    >
      {book.imageUrl && (
        <img src={book.imageUrl} alt={book.title} className="book-preview-image" />
      )}
      <div className="book-preview-info">
        <div className="book-preview-title">{book.title}</div>
        {book.authors && book.authors.length > 0 && (
          <div className="book-preview-author">
            {book.authors.map((a) => (typeof a === 'object' ? a.name : a)).join(', ')}
          </div>
        )}
      </div>
    </a>
  )
}

export default ChatPage

