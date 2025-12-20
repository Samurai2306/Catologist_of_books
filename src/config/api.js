export const API_CONFIG = {
  REST_API: 'http://158.160.203.172:8080',
  WS_SOCKET_IO: 'ws://158.160.203.172:8081',
  WS_WEBSOCKET: 'ws://158.160.203.172:8082',
  DOCS: 'http://158.160.203.172:8083',
}

export const API_ENDPOINTS = {
  BOOKS: '/book/',
  BOOK_BY_ID: (id) => `/book/?id=${id}`,
  AUTHORS: '/author/',
  AUTHOR_BY_ID: (id) => `/author/?id=${id}`,
  GENRES: '/genre/',
  GENRE_BY_ID: (id) => `/genre/?id=${id}`,
  IMAGES: '/image/url',
}

