import { Link, useLocation } from 'react-router-dom'
import ChatSidebar from '../Chat/ChatSidebar'
import WebChatWrapper from '../WebComponents/WebChatWrapper'
import './Layout.css'

function Layout({ children }) {
  const location = useLocation()

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
          </nav>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer glass">
        <p>&copy; 2024 Каталог книг. Все права защищены.</p>
      </footer>
      {/* React компонент чата */}
      <ChatSidebar />
      
      {/* Native Web Component чата (альтернативная реализация) */}
      {/* Раскомментируйте для использования веб-компонента вместо React компонента */}
      {/* <WebChatWrapper /> */}
    </div>
  )
}

export default Layout

