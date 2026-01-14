/**
 * Native Web Component для чата с Socket.IO
 * Использует Shadow DOM для изоляции стилей
 * 
 * Использование:
 * <book-chat 
 *   ws-url="http://localhost:8000" 
 *   username="User"
 *   theme="dark">
 * </book-chat>
 */

import { io } from 'socket.io-client'

class BookChat extends HTMLElement {
  constructor() {
    super()
    
    // Создаём Shadow DOM для изоляции стилей
    this.attachShadow({ mode: 'open' })
    
    // Внутреннее состояние
    this.socket = null
    this.messages = []
    this.isConnected = false
    this.isOpen = false
    this.onlineUsers = []
    this.username = this.getAttribute('username') || ''
  }

  // Наблюдаемые атрибуты
  static get observedAttributes() {
    return ['ws-url', 'username', 'theme']
  }

  // Callback при изменении атрибутов
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'username') {
        this.username = newValue
      }
      this.render()
    }
  }

  // Lifecycle: подключение к DOM
  connectedCallback() {
    this.render()
    this.attachEventListeners()
    
    const wsUrl = this.getAttribute('ws-url')
    if (wsUrl && this.username) {
      this.connectWebSocket(wsUrl)
    }
  }

  // Lifecycle: отключение от DOM
  disconnectedCallback() {
    this.disconnectWebSocket()
  }

  // Подключение к WebSocket
  connectWebSocket(url) {
    if (this.socket) {
      this.socket.disconnect()
    }

    this.socket = io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    this.socket.on('connect', () => {
      this.isConnected = true
      this.socket.emit('user:join', { username: this.username })
      this.updateStatus()
      this.showNotification('Подключено к чату', 'success')
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
      this.updateStatus()
      this.showNotification('Отключено от чата', 'error')
    })

    this.socket.on('message:new', (message) => {
      this.addMessage(message)
    })

    this.socket.on('messages:history', (history) => {
      this.messages = history
      this.renderMessages()
    })

    this.socket.on('users:online', (users) => {
      this.onlineUsers = users
      this.updateOnlineCount()
    })

    this.socket.on('error', (error) => {
      this.showNotification(error.message || 'Ошибка в чате', 'error')
    })
  }

  // Отключение от WebSocket
  disconnectWebSocket() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Добавление сообщения
  addMessage(message) {
    this.messages.push(message)
    this.renderMessages()
    this.scrollToBottom()
  }

  // Отправка сообщения
  sendMessage(text) {
    if (!text.trim() || !this.socket || !this.isConnected) return

    this.socket.emit('message:send', {
      text,
      username: this.username,
    })
  }

  // Переключение видимости чата
  toggleChat() {
    this.isOpen = !this.isOpen
    const chatContainer = this.shadowRoot.querySelector('.chat-container')
    const overlay = this.shadowRoot.querySelector('.chat-overlay')
    
    if (this.isOpen) {
      chatContainer.classList.add('open')
      overlay.classList.add('visible')
      this.scrollToBottom()
    } else {
      chatContainer.classList.remove('open')
      overlay.classList.remove('visible')
    }
  }

  // Обновление статуса подключения
  updateStatus() {
    const statusIndicator = this.shadowRoot.querySelector('.status-indicator')
    const statusText = this.shadowRoot.querySelector('.status-text')
    
    if (statusIndicator && statusText) {
      if (this.isConnected) {
        statusIndicator.classList.add('online')
        statusIndicator.classList.remove('offline')
        statusText.textContent = 'Подключено'
      } else {
        statusIndicator.classList.add('offline')
        statusIndicator.classList.remove('online')
        statusText.textContent = 'Отключено'
      }
    }
  }

  // Обновление счётчика онлайн пользователей
  updateOnlineCount() {
    const onlineCount = this.shadowRoot.querySelector('.online-count')
    if (onlineCount) {
      onlineCount.textContent = `Онлайн: ${this.onlineUsers.length}`
    }
  }

  // Отображение уведомления
  showNotification(message, type = 'info') {
    // Можно использовать native notifications или custom элемент
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  // Прокрутка к последнему сообщению
  scrollToBottom() {
    const messagesContainer = this.shadowRoot.querySelector('.chat-messages')
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  // Рендер сообщений
  renderMessages() {
    const messagesContainer = this.shadowRoot.querySelector('.chat-messages')
    if (!messagesContainer) return

    if (this.messages.length === 0) {
      messagesContainer.innerHTML = `
        <div class="chat-empty">
          <p>Нет сообщений. Начните общение!</p>
        </div>
      `
      return
    }

    messagesContainer.innerHTML = this.messages.map(message => {
      const isOwn = message.username === this.username
      const time = message.timestamp 
        ? new Date(message.timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : ''

      return `
        <div class="chat-message ${isOwn ? 'own' : ''}">
          <div class="message-header">
            <span class="message-username">${this.escapeHtml(message.username)}</span>
            ${time ? `<span class="message-time">${time}</span>` : ''}
          </div>
          <div class="message-text">${this.escapeHtml(message.text || message.message || '')}</div>
        </div>
      `
    }).join('')

    this.scrollToBottom()
  }

  // Экранирование HTML
  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // Подключение обработчиков событий
  attachEventListeners() {
    const toggleBtn = this.shadowRoot.querySelector('.chat-toggle-button')
    const closeBtn = this.shadowRoot.querySelector('.chat-close-button')
    const form = this.shadowRoot.querySelector('.chat-input-form')
    const overlay = this.shadowRoot.querySelector('.chat-overlay')

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleChat())
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggleChat())
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.toggleChat())
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault()
        const input = this.shadowRoot.querySelector('.chat-input')
        if (input) {
          this.sendMessage(input.value)
          input.value = ''
        }
      })
    }
  }

  // Рендер компонента
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .chat-toggle-button {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-toggle-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
        }

        .chat-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 400px;
          max-width: calc(100vw - 4rem);
          height: 600px;
          max-height: calc(100vh - 4rem);
          background: rgba(20, 20, 30, 0.98);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          transform: translateY(calc(100% + 2rem));
          transition: transform 0.3s ease;
          z-index: 1001;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chat-container.open {
          transform: translateY(0);
        }

        .chat-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }

        .chat-overlay.visible {
          opacity: 1;
          pointer-events: all;
        }

        .chat-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-title-section h2 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .chat-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
        }

        .status-indicator.online {
          background: #10b981;
        }

        .chat-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .online-count {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .chat-close-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.5rem;
          line-height: 1;
          transition: background 0.2s;
        }

        .chat-close-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .chat-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
        }

        .chat-message {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          max-width: 80%;
          animation: slideIn 0.2s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-message.own {
          align-self: flex-end;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          gap: 0.5rem;
          font-size: 0.75rem;
          opacity: 0.7;
          color: #fff;
        }

        .message-username {
          font-weight: 600;
        }

        .message-text {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.75rem;
          border-radius: 12px;
          color: #fff;
          word-wrap: break-word;
        }

        .chat-message.own .message-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .chat-input-form {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chat-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .chat-input:focus {
          border-color: #667eea;
        }

        .chat-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .chat-send-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .chat-send-button:hover:not(:disabled) {
          opacity: 0.9;
        }

        .chat-send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .chat-container {
            width: 100vw;
            height: 100vh;
            max-width: 100vw;
            max-height: 100vh;
            bottom: 0;
            right: 0;
            border-radius: 0;
          }
        }
      </style>

      <button class="chat-toggle-button" aria-label="Открыть чат">
        💬
      </button>

      <div class="chat-overlay"></div>

      <div class="chat-container">
        <div class="chat-header">
          <div class="chat-title-section">
            <h2>Чат</h2>
            <div class="chat-status">
              <span class="status-indicator ${this.isConnected ? 'online' : 'offline'}"></span>
              <span class="status-text">${this.isConnected ? 'Подключено' : 'Отключено'}</span>
            </div>
          </div>
          <div class="chat-actions">
            <span class="online-count">Онлайн: ${this.onlineUsers.length}</span>
            <button class="chat-close-button" aria-label="Закрыть чат">×</button>
          </div>
        </div>

        <div class="chat-messages">
          <div class="chat-empty">
            <p>Нет сообщений. Начните общение!</p>
          </div>
        </div>

        <form class="chat-input-form">
          <input 
            type="text" 
            class="chat-input" 
            placeholder="${this.isConnected ? 'Введите сообщение...' : 'Подключение...'}"
            ${!this.isConnected ? 'disabled' : ''}
          />
          <button 
            type="submit" 
            class="chat-send-button"
            ${!this.isConnected ? 'disabled' : ''}
          >
            Отправить
          </button>
        </form>
      </div>
    `
  }
}

// Регистрация веб-компонента
if (!customElements.get('book-chat')) {
  customElements.define('book-chat', BookChat)
}

export default BookChat
