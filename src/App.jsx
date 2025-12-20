import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout/Layout'
import LoadingSpinner from './components/UI/LoadingSpinner'

const HomePage = lazy(() => import('./pages/HomePage'))
const BookDetailPage = lazy(() => import('./pages/BookDetailPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))

function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book" element={<BookDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App

