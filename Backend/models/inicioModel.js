const db = require('../config/database');

const Inicio = {
  // Obtiene el total de mediciones registradas para mostrar en la ruta de bienvenida
  getTotalMediciones: (callback) => {
    db.query('SELECT COUNT(*) AS total FROM mediciones', callback);
  }
};

module.exports = Inicio;
