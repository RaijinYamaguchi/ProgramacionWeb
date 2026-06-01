const API = 'http://127.0.0.1:3000/api';
const token = sessionStorage.getItem('token');
const nombre = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombre || '';
if (!token) window.location.href = 'login.html';

const tabla = document.querySelector('#tablaDispositivos tbody');
const buscador = document.getElementById('buscador');
const alerta = document.getElementById('alerta');
let dispositivosGlobal = [];

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
  return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

function cargarDispositivos(filtro = '') {
  fetch(`${API}/dispositivos`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      dispositivosGlobal = data || [];
      let dispositivos = dispositivosGlobal;
      if (filtro) {
        const f = filtro.toLowerCase();
        dispositivos = dispositivos.filter(d =>
          d.nombre.toLowerCase().includes(f) ||
          (d.ubicacion && d.ubicacion.toLowerCase().includes(f))
        );
      }
      tabla.innerHTML = '';
      if (dispositivos.length === 0) {
        tabla.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No se encontraron dispositivos</td></tr>';
        return;
      }
      dispositivos.forEach(d => {
        tabla.innerHTML += `
          <tr>
            <td><span class="badge bg-primary">${d.id}</span></td>
            <td><strong>${escapeHtml(d.nombre)}</strong></td>
            <td>${escapeHtml(d.ubicacion || '—')}</td>
            <td>${escapeHtml(d.funcionalidad || '—')}</td>
            <td>${escapeHtml(d.usuario_nombre || d.usuario_id || '?')}</td>
            <td>${escapeHtml(d.tanque_nombre || d.tanque_id || '?')}</td>
            <td>
              <span class="badge ${d.activo ? 'bg-success' : 'bg-danger'}">
                ${d.activo ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td>${formatDate(d.creado_en)}</td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="editarDispositivo(${d.id})">
                <i class="bi bi-pencil"></i> Editar
              </button>
              <button class="btn btn-sm btn-danger" onclick="eliminarDispositivo(${d.id})">
                <i class="bi bi-trash"></i> Eliminar
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => mostrarAlerta('Error al cargar dispositivos: ' + err.message));
}

buscador.addEventListener('input', e => cargarDispositivos(e.target.value));

function editarDispositivo(id) {
  window.location.href = `dispositivos-editar.html?id=${id}`;
}

function eliminarDispositivo(id) {
  const dispositivo = dispositivosGlobal.find(d => d.id === id);
  if (!confirm(`¿Eliminar el dispositivo "${dispositivo?.nombre}"? Esta acción no se puede deshacer.`)) return;
  fetch(`${API}/dispositivos/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.error) throw new Error(resp.error);
      mostrarAlerta('Dispositivo eliminado', 'success');
      cargarDispositivos();
    })
    .catch(err => mostrarAlerta('Error al eliminar: ' + err.message));
}

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

cargarDispositivos();