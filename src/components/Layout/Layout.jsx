import { Link, useLocation } from 'react-router-dom'
import { useChatStore } from '../../stores/useChatStore'
import './Layout.css'

function Layout({ children }) {
  const location = useLocation()
  const unreadCount = useChatStore((state) => state.unreadCount)

  return (
    <div className="layout">
      <header className="header glass">
        <div className="header-container">
          <Link to="/" className="logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">Каталог книг</span>
          </Link>
          <nav className="nav">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Главная
            </Link>
            <Link 
              to="/admin" 
              className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              Админ-панель
            </Link>
            <Link 
              to="/chat" 
              className={`nav-link chat-link ${location.pathname === '/chat' ? 'active' : ''}`}
            >
              Чат
              {unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
            </Link>
          </nav>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer glass">
        <p>&copy; 2024 Каталог книг. Все права защищены.</p>
      </footer>
    </div>
  )
}

export default Layout

