/* ── CONFIG.JS — Configuración global de la API ── */

const API = {
  BASE_URL: 'http://localhost:3000',

  endpoints: {
    // Auth
    login:         '/api/auth/login',
    registro:      '/api/auth/registro',
    // Módulos
    dispositivos:  '/api/dispositivos',
    tanques:       '/api/tanques',
    mediciones:    '/api/mediciones',
    reportes:      '/api/reportes',
    // Tokens de dispositivos
    tokensGenerar: '/api/auth/dispositivos/token/generar',
    tokensList:    '/api/auth/dispositivos/tokens',
  },
  url(key) {
    return this.BASE_URL + this.endpoints[key];
  },
};