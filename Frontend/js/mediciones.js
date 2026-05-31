let tanqueSeleccionado = null;
let medicionesActuales = [];
const token = sessionStorage.getItem('token') || localStorage.getItem('token');
const nombreUsuario = sessionStorage.getItem('nombre') || localStorage.getItem('nombre');

const API = {
  BASE_URL: 'http://localhost:3000',
  endpoints: {
    tanques: '/api/tanques',
    mediciones: '/api/mediciones'
  }
};

document.getElementById('nombreUsuario').textContent = nombreUsuario || '';

if (!token) window.location.href = 'login.html';

/**
 * Mostrar alerta visual
 */
function mostrarAlerta(msg, tipo = 'danger', elemento = null) {
  const contenedor = elemento || document.querySelector('.container-mediciones') || document.body;
  const alerta = document.createElement('div');
  alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
  alerta.style.zIndex = '9999';
  alerta.style.maxWidth = '500px';
  alerta.innerHTML = `
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alerta);
  setTimeout(() => alerta.remove(), 4000);
}

/**
 * Cargar tanques en el sidebar
 */
async function cargarTanques() {
  try {
    const response = await fetch(`${API.BASE_URL}${API.endpoints.tanques}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Error al cargar tanques');

    const tanques = await response.json();
    const listaTanques = document.getElementById('listaTanques');
    listaTanques.innerHTML = '';

    if (!tanques || tanques.length === 0) {
      listaTanques.innerHTML = '<li class="text-muted text-center py-3">No hay tanques disponibles</li>';
      return;
    }

    tanques.forEach((tanque, index) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = `tanque-item ${index === 0 ? 'active' : ''}`;
      a.href = '#';
      a.style.cursor = 'pointer';
      a.innerHTML = `
        <div class="fw-bold">${tanque.nombre}</div>
        <div class="tanque-info small text-muted">
          📍 ${tanque.ubicacion}
          <br>
          💧 ${tanque.capacidad_max}L
        </div>
      `;
      a.onclick = (e) => {
        e.preventDefault();
        seleccionarTanque(tanque.id, a);
      };
      li.appendChild(a);
      listaTanques.appendChild(li);

      // Seleccionar primer tanque automáticamente
      if (index === 0) {
        tanqueSeleccionado = tanque.id;
        cargarMediciones(tanque.id);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('listaTanques').innerHTML = 
      '<li class="text-danger text-center py-3 small">Error al cargar tanques</li>';
    mostrarAlerta('Error al cargar tanques: ' + error.message);
  }
}

/**
 * Seleccionar un tanque del sidebar
 */
function seleccionarTanque(tanqueId, elemento) {
  document.querySelectorAll('.tanque-item').forEach(item => {
    item.classList.remove('active');
  });
  elemento.classList.add('active');
  tanqueSeleccionado = tanqueId;
  cargarMediciones(tanqueId);
}

/**
 * Cargar mediciones del tanque seleccionado
 */
async function cargarMediciones(tanqueId) {
  try {
    const bodyMediciones = document.getElementById('bodyMediciones');
    bodyMediciones.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </td>
      </tr>
    `;

    const response = await fetch(`${API.BASE_URL}${API.endpoints.mediciones}?tanque_id=${tanqueId}&limite=50`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Error al cargar mediciones');

    const mediciones = await response.json();
    medicionesActuales = mediciones || [];
    bodyMediciones.innerHTML = '';

    if (!mediciones || mediciones.length === 0) {
      bodyMediciones.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted py-4">No hay mediciones para este tanque</td>
        </tr>
      `;
      return;
    }

    mediciones.forEach(med => {
      const fila = document.createElement('tr');
      const fecha = new Date(med.fecha || med.created_at).toLocaleString('es-ES');
      const temp = med.temperatura ? parseFloat(med.temperatura).toFixed(1) : '-';
      const humedad = med.humedad ? parseFloat(med.humedad).toFixed(1) : '-';
      const lectura = med.lectura ? parseFloat(med.lectura).toFixed(2) : '-';
      
      fila.innerHTML = `
        <td><span class="badge bg-primary">${med.id}</span></td>
        <td>${med.tanque?.nombre || 'N/A'}</td>
        <td>${med.dispositivo?.nombre || 'N/A'}</td>
        <td>${temp}°C</td>
        <td>${humedad}%</td>
        <td>${lectura} L</td>
        <td class="small">${fecha}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="eliminarMedicion(${med.id}, this)" title="Eliminar medición">
            Eliminar
          </button>
        </td>
      `;
      bodyMediciones.appendChild(fila);
    });
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('bodyMediciones').innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-danger py-4">Error al cargar mediciones: ${error.message}</td>
      </tr>
    `;
    mostrarAlerta('Error al cargar mediciones: ' + error.message);
  }
}

/**
 * Recargar mediciones del tanque actual
 */
function recargarMediciones() {
  if (tanqueSeleccionado) {
    cargarMediciones(tanqueSeleccionado);
  }
}

/**
 * Eliminar una medición
 */
async function eliminarMedicion(id, boton) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta medición? Esta acción no se puede deshacer.')) return;

  try {
    const btnOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = 'Eliminando...';

    const response = await fetch(`${API.BASE_URL}${API.endpoints.mediciones}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok || response.status === 204) {
      mostrarAlerta('Medición eliminada correctamente', 'success');
      recargarMediciones();
    } else {
      const data = await response.json();
      mostrarAlerta('Error al eliminar: ' + (data.error || 'Error desconocido'), 'danger');
      boton.disabled = false;
      boton.textContent = btnOriginal;
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarAlerta('Error al eliminar medición: ' + error.message, 'danger');
    boton.disabled = false;
    boton.textContent = 'Eliminar';
  }
}

/**
 * Inicializar la página de mediciones
 */
function cerrarSesion() {
  sessionStorage.clear();
  localStorage.clear();
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  cargarTanques();
});
