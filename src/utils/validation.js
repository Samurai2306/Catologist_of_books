/**
 * Схемы валидации с использованием Zod
 */

import { z } from 'zod'

/**
 * Схема для валидации данных книги
 */
export const bookSchema = z.object({
  title: z.string()
    .min(1, 'Название книги обязательно')
    .max(200, 'Название не должно превышать 200 символов'),
  
  description: z.string()
    .max(2000, 'Описание не должно превышать 2000 символов')
    .optional()
    .or(z.literal('')),
  
  publicationYear: z.number()
    .int('Год должен быть целым числом')
    .min(1000, 'Год не может быть меньше 1000')
    .max(new Date().getFullYear() + 1, 'Год не может быть в будущем')
    .optional()
    .nullable(),
  
  imageUrl: z.string()
    .url('Неверный формат URL изображения')
    .optional()
    .or(z.literal(''))
    .nullable(),
  
  rating: z.number()
    .min(0, 'Рейтинг не может быть отрицательным')
    .max(5, 'Рейтинг не может превышать 5')
    .optional()
    .nullable(),
  
  authorIds: z.array(z.number().int('ID автора должен быть целым числом'))
    .min(1, 'Должен быть выбран хотя бы один автор')
    .optional(),
  
  genreIds: z.array(z.number().int('ID жанра должен быть целым числом'))
    .min(1, 'Должен быть выбран хотя бы один жанр')
    .optional(),
})

/**
 * Схема для валидации данных автора
 */
export const authorSchema = z.object({
  name: z.string()
    .min(2, 'Имя автора должно содержать минимум 2 символа')
    .max(100, 'Имя автора не должно превышать 100 символов'),
})

/**
 * Схема для валидации данных жанра
 */
export const genreSchema = z.object({
  name: z.string()
    .min(2, 'Название жанра должно содержать минимум 2 символа')
    .max(50, 'Название жанра не должно превышать 50 символов'),
})

/**
 * Схема для валидации учетных данных
 */
export const authCredentialsSchema = z.object({
  username: z.string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(50, 'Имя пользователя не должно превышать 50 символов'),
  
  password: z.string()
    .min(3, 'Пароль должен содержать минимум 3 символа')
    .max(100, 'Пароль не должен превышать 100 символов'),
})

/**
 * Схема для валидации сообщения чата
 */
export const chatMessageSchema = z.object({
  text: z.string()
    .min(1, 'Сообщение не может быть пустым')
    .max(1000, 'Сообщение не должно превышать 1000 символов'),
  
  username: z.string()
    .min(2, 'Имя пользователя должно содержать минимум 2 символа')
    .max(30, 'Имя пользователя не должно превышать 30 символов'),
  
  bookIds: z.array(z.string()).optional(),
})

/**
 * Схема для валидации поискового запроса
 */
export const searchQuerySchema = z.string()
  .max(100, 'Поисковый запрос не должен превышать 100 символов')

/**
 * Схема для валидации имени пользователя чата
 */
export const chatUsernameSchema = z.string()
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(30, 'Имя не должно превышать 30 символов')
  .regex(/^[а-яА-ЯёЁa-zA-Z0-9_\s]+$/, 'Имя может содержать только буквы, цифры, пробелы и подчёркивания')

/**
 * Валидация данных с обработкой ошибок
 * @param {z.ZodSchema} schema - Схема Zod для валидации
 * @param {any} data - Данные для валидации
 * @returns {{success: boolean, data?: any, errors?: object}}
 */
export const validateData = (schema, data) => {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.reduce((acc, err) => {
        const field = err.path.join('.')
        acc[field] = err.message
        return acc
      }, {})
      return { success: false, errors: formattedErrors }
    }
    return { success: false, errors: { general: 'Ошибка валидации' } }
  }
}

/**
 * Безопасная валидация (возвращает только true/false)
 * @param {z.ZodSchema} schema - Схема Zod
 * @param {any} data - Данные для валидации
 * @returns {boolean}
 */
export const isValid = (schema, data) => {
  return schema.safeParse(data).success
}

export default {
  bookSchema,
  authorSchema,
  genreSchema,
  authCredentialsSchema,
  chatMessageSchema,
  searchQuerySchema,
  chatUsernameSchema,
  validateData,
  isValid,
}
