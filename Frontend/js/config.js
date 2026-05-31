const API = {
  BASE_URL: 'http://localhost:3000',

  endpoints: {
    login:        '/api/auth/login',
    registro:     '/api/auth/registro',
    dispositivos: '/api/dispositivos',
    tanques:      '/api/tanques',
    mediciones:   '/api/mediciones',
    reportes:     '/api/reportes',
  },
  url(key) {
    return this.BASE_URL + this.endpoints[key];
  },
};