import { useState, useEffect } from 'react'
import { saveAuthCredentials, getAuthCredentials, clearAuthCredentials } from '../../utils/auth'
import Button from '../UI/Button'
import Input from '../UI/Input'
import Modal from '../UI/Modal'
import toast from 'react-hot-toast'
import './AuthSettings.css'

function AuthSettings({ isOpen, onClose }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const stored = getAuthCredentials()
      if (stored) {
        setUsername(stored.username || '')
        setPassword(stored.password || '')
      }
    }
  }, [isOpen])

  const handleSave = () => {
    if (!username || !password) {
      toast.error('Введите имя пользователя и пароль')
      return
    }

    if (saveAuthCredentials(username, password)) {
      toast.success('Учетные данные сохранены')
      onClose()
      // Перезагружаем страницу для применения новых учетных данных
      window.location.reload()
    } else {
      toast.error('Ошибка сохранения учетных данных')
    }
  }

  const handleClear = () => {
    if (clearAuthCredentials()) {
      setUsername('')
      setPassword('')
      toast.success('Учетные данные удалены')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Настройки авторизации API" size="medium">
      <div className="auth-settings">
        <p className="auth-info">
          API требует Basic Auth для операций создания, обновления и удаления.
          Учетные данные будут использоваться для всех запросов, требующих авторизацию.
        </p>

        <div className="auth-form">
          <div className="form-group">
            <label>Имя пользователя *</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите имя пользователя"
            />
          </div>

          <div className="form-group">
            <label>Пароль *</label>
            <div className="password-input-wrapper">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="auth-actions">
            <Button variant="secondary" onClick={handleClear}>
              Очистить
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Сохранить
            </Button>
          </div>

          <div className="auth-hint">
            <p>💡 Подсказка:</p>
            <p>Учетные данные можно также задать через переменные окружения:</p>
            <code>VITE_API_USERNAME=your_username</code>
            <code>VITE_API_PASSWORD=your_password</code>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default AuthSettings

