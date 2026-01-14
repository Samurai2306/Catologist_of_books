/**
 * React обёртка для использования веб-компонента book-chat
 */

import { useEffect, useRef } from 'react'
import { API_CONFIG } from '../../config/api'

function WebChatWrapper() {
  const chatRef = useRef(null)
  
  useEffect(() => {
    // Получаем username из localStorage или генерируем случайный
    const getUsername = () => {
      let username = localStorage.getItem('chat_username')
      if (!username) {
        username = `User${Math.floor(Math.random() * 10000)}`
        localStorage.setItem('chat_username', username)
      }
      return username
    }

    // Устанавливаем атрибуты веб-компонента
    if (chatRef.current) {
      chatRef.current.setAttribute('ws-url', API_CONFIG.WS_SOCKET_IO)
      chatRef.current.setAttribute('username', getUsername())
      chatRef.current.setAttribute('theme', 'dark')
    }
  }, [])

  // Проверяем, доступен ли WebSocket
  if (!API_CONFIG.WS_ENABLED) {
    return null
  }

  return <book-chat ref={chatRef}></book-chat>
}

export default WebChatWrapper
