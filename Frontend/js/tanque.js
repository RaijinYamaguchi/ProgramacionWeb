const API = 'http://127.0.0.1:3000/api';
const token = sessionStorage.getItem('token');
const nombre = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombre || '';
if (!token) window.location.href = 'login.html';

const tabla = document.querySelector('#tablaTanque tbody');
const buscador = document.getElementById('buscador');
const alerta = document.getElementById('alerta');
let tanquesGlobal = [];

function mostrarAlerta(msg, tipo = 'danger') {
  alerta.innerHTML = `<div class='alert alert-${tipo} alert-dismissible fade show' role='alert'>
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>`;
  setTimeout(() => {
    const alertDiv = alerta.querySelector('.alert');
    if (alertDiv) alertDiv.remove();
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function cargarTanques(filtro = '') {
  fetch(`${API}/tanques`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      tanquesGlobal = data || [];
      let tanques = tanquesGlobal;
      if (filtro) {
        tanques = tanques.filter(t =>
          t.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
          t.ubicacion.toLowerCase().includes(filtro.toLowerCase()) ||
          t.capacidad_max.toString().includes(filtro) ||
          (t.nivel_min_alerta && t.nivel_min_alerta.toString().includes(filtro)) ||
          (t.nivel_max_alerta && t.nivel_max_alerta.toString().includes(filtro))
        );
      }
      tabla.innerHTML = '';
      if (tanques.length === 0) {
        tabla.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No se encontraron tanques</td></tr>';
        return;
      }
      tanques.forEach(t => {
        tabla.innerHTML += `
          <tr>
            <td><span class="badge bg-primary">${t.id}</span></td>
            <td><strong>${escapeHtml(t.nombre)}</strong></td>
            <td>${escapeHtml(t.ubicacion)}</td>
            <td>${t.capacidad_max} L</td>
            <td>${t.nivel_min_alerta ?? '-'} L</td>
            <td>${t.nivel_max_alerta ?? '-'} L</td>
            <td>
              <span class="badge ${t.activo ? 'bg-success' : 'bg-danger'}">
                ${t.activo ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="editarTanque(${t.id})">
                <i class="bi bi-pencil"></i> Editar
              </button>
              <button class="btn btn-sm btn-danger" onclick="eliminarTanque(${t.id})">
                <i class="bi bi-trash"></i> Eliminar
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => mostrarAlerta('Error al cargar tanques: ' + err.message));
}

buscador.addEventListener('input', e => cargarTanques(e.target.value));

function editarTanque(id) {
  window.location.href = `tanques-editar.html?id=${id}`;
}

function eliminarTanque(id) {
  const tanque = tanquesGlobal.find(t => t.id === id);
  if (!confirm(`¿Seguro que deseas eliminar el tanque "${tanque?.nombre}"?`)) return;
  
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Eliminando...';
  
  fetch(`${API}/tanques/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.error) {
        mostrarAlerta(resp.error);
        btn.disabled = false;
        btn.textContent = 'Eliminar';
      } else {
        mostrarAlerta('Tanque eliminado correctamente', 'success');
        cargarTanques();
      }
    })
    .catch(err => {
      mostrarAlerta('Error al eliminar: ' + err.message);
      btn.disabled = false;
      btn.textContent = 'Eliminar';
    });
}

// Mostrar niveles actuales en modal (datos frescos desde el endpoint)
function verNivelActual() {
  fetch(`${API}/tanques/nivel-actual`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#tablaNivelActual tbody');
      tbody.innerHTML = '';
      if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay datos disponibles</td></tr>';
        return;
      }
      data.forEach(t => {
        const nivel = t.nivel_agua !== undefined ? t.nivel_agua : 0;
        const porcentaje = t.porcentaje !== undefined ? t.porcentaje : 0;
        let estado = '';
        let estadoClase = '';
        const minAlerta = t.nivel_min_alerta ?? -Infinity;
        const maxAlerta = t.nivel_max_alerta ?? Infinity;

        if (nivel <= minAlerta) {
          estado = 'Alerta baja';
          estadoClase = 'text-danger fw-bold';
        } else if (nivel >= maxAlerta) {
          estado = 'Alerta alta';
          estadoClase = 'text-warning fw-bold';
        } else {
          estado = '✓ Normal';
          estadoClase = 'text-success';
        }
        tbody.innerHTML += `
          <tr>
            <td>${t.id}</td>
            <td><strong>${escapeHtml(t.nombre)}</strong></td>
            <td>${nivel} L</td>
            <td>${porcentaje}%</td>
            <td class="${estadoClase}">${estado}</td>
          </tr>
        `;
      });
      const modalElement = document.getElementById('modalNivelActual');
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    })
    .catch(err => {
      mostrarAlerta('Error al cargar niveles actuales: ' + err.message);
      console.error(err);
    });
}

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// Eventos
document.getElementById('btnNivelActual').addEventListener('click', verNivelActual);
document.getElementById('btnRefrescarNivel').addEventListener('click', () => {
  verNivelActual();
});

cargarTanques();