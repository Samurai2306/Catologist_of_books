import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveAuthCredentials,
  getAuthCredentials,
  clearAuthCredentials,
  hasAuthCredentials,
} from './auth'

describe('Auth Utils', () => {
  beforeEach(() => {
    // Очистка localStorage перед каждым тестом
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('saveAuthCredentials', () => {
    it('should save credentials to localStorage', () => {
      const username = 'testuser'
      const password = 'testpass'
      
      const result = saveAuthCredentials(username, password)
      
      expect(result).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'api_auth',
        JSON.stringify({ username, password })
      )
    })

    it('should handle localStorage errors gracefully', () => {
      localStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage full')
      })
      
      const result = saveAuthCredentials('user', 'pass')
      
      expect(result).toBe(false)
    })
  })

  describe('getAuthCredentials', () => {
    it('should retrieve stored credentials', () => {
      const credentials = { username: 'testuser', password: 'testpass' }
      localStorage.getItem.mockReturnValueOnce(JSON.stringify(credentials))
      
      const result = getAuthCredentials()
      
      expect(result).toEqual(credentials)
      expect(localStorage.getItem).toHaveBeenCalledWith('api_auth')
    })

    it('should return null if no credentials stored', () => {
      localStorage.getItem.mockReturnValueOnce(null)
      
      const result = getAuthCredentials()
      
      expect(result).toBeNull()
    })

    it('should handle JSON parse errors', () => {
      localStorage.getItem.mockReturnValueOnce('invalid json')
      
      const result = getAuthCredentials()
      
      expect(result).toBeNull()
    })
  })

  describe('clearAuthCredentials', () => {
    it('should remove credentials from localStorage', () => {
      const result = clearAuthCredentials()
      
      expect(result).toBe(true)
      expect(localStorage.removeItem).toHaveBeenCalledWith('api_auth')
    })

    it('should handle localStorage errors', () => {
      localStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('Cannot remove')
      })
      
      const result = clearAuthCredentials()
      
      expect(result).toBe(false)
    })
  })

  describe('hasAuthCredentials', () => {
    it('should return true when credentials exist', () => {
      localStorage.getItem.mockReturnValueOnce(JSON.stringify({ username: 'user', password: 'pass' }))
      
      const result = hasAuthCredentials()
      
      expect(result).toBe(true)
    })

    it('should return false when credentials do not exist', () => {
      localStorage.getItem.mockReturnValueOnce(null)
      
      const result = hasAuthCredentials()
      
      expect(result).toBe(false)
    })
  })
})
