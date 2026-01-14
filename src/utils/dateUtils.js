/**
 * Утилиты для работы с датами с использованием dayjs
 */

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/ru'

// Настройка dayjs
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
dayjs.locale('ru')

/**
 * Форматирование даты в читаемый формат
 * @param {string|Date} date - Дата для форматирования
 * @param {string} format - Формат (по умолчанию 'DD.MM.YYYY')
 * @returns {string} Отформатированная дата
 */
export const formatDate = (date, format = 'DD.MM.YYYY') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * Форматирование даты и времени
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} Отформатированная дата и время
 */
export const formatDateTime = (date) => {
  if (!date) return ''
  return dayjs(date).format('DD.MM.YYYY HH:mm')
}

/**
 * Форматирование времени
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} Отформатированное время
 */
export const formatTime = (date) => {
  if (!date) return ''
  return dayjs(date).format('HH:mm')
}

/**
 * Относительное время (например, "2 часа назад")
 * @param {string|Date} date - Дата
 * @returns {string} Относительное время
 */
export const fromNow = (date) => {
  if (!date) return ''
  return dayjs(date).fromNow()
}

/**
 * Проверка, является ли дата сегодняшней
 * @param {string|Date} date - Дата для проверки
 * @returns {boolean}
 */
export const isToday = (date) => {
  if (!date) return false
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * Проверка, является ли дата вчерашней
 * @param {string|Date} date - Дата для проверки
 * @returns {boolean}
 */
export const isYesterday = (date) => {
  if (!date) return false
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day')
}

/**
 * Проверка, прошло ли определённое количество времени
 * @param {string|Date} date - Дата для проверки
 * @param {number} amount - Количество
 * @param {string} unit - Единица измерения ('day', 'hour', 'minute' и т.д.)
 * @returns {boolean}
 */
export const isOlderThan = (date, amount, unit = 'day') => {
  if (!date) return false
  return dayjs().diff(dayjs(date), unit) > amount
}

/**
 * Получить начало дня
 * @param {string|Date} date - Дата
 * @returns {Date}
 */
export const startOfDay = (date) => {
  return dayjs(date).startOf('day').toDate()
}

/**
 * Получить конец дня
 * @param {string|Date} date - Дата
 * @returns {Date}
 */
export const endOfDay = (date) => {
  return dayjs(date).endOf('day').toDate()
}

/**
 * Добавить время к дате
 * @param {string|Date} date - Дата
 * @param {number} amount - Количество
 * @param {string} unit - Единица измерения
 * @returns {Date}
 */
export const addTime = (date, amount, unit = 'day') => {
  return dayjs(date).add(amount, unit).toDate()
}

/**
 * Вычесть время из даты
 * @param {string|Date} date - Дата
 * @param {number} amount - Количество
 * @param {string} unit - Единица измерения
 * @returns {Date}
 */
export const subtractTime = (date, amount, unit = 'day') => {
  return dayjs(date).subtract(amount, unit).toDate()
}

/**
 * Получить разницу между датами
 * @param {string|Date} date1 - Первая дата
 * @param {string|Date} date2 - Вторая дата
 * @param {string} unit - Единица измерения
 * @returns {number}
 */
export const diffDates = (date1, date2, unit = 'day') => {
  return dayjs(date1).diff(dayjs(date2), unit)
}

/**
 * Проверка валидности даты
 * @param {string|Date} date - Дата для проверки
 * @returns {boolean}
 */
export const isValidDate = (date) => {
  return dayjs(date).isValid()
}

/**
 * Форматирование даты сообщения чата (умное форматирование)
 * @param {string|Date} date - Дата сообщения
 * @returns {string}
 */
export const formatChatMessageDate = (date) => {
  if (!date) return ''
  
  const messageDate = dayjs(date)
  const now = dayjs()
  
  if (messageDate.isSame(now, 'day')) {
    // Сегодня - показываем только время
    return messageDate.format('HH:mm')
  } else if (messageDate.isSame(now.subtract(1, 'day'), 'day')) {
    // Вчера
    return `Вчера в ${messageDate.format('HH:mm')}`
  } else if (messageDate.isAfter(now.subtract(7, 'day'))) {
    // В течение последней недели - показываем день недели
    return messageDate.format('dddd в HH:mm')
  } else {
    // Старше недели - полная дата
    return messageDate.format('DD.MM.YYYY HH:mm')
  }
}

export default dayjs
