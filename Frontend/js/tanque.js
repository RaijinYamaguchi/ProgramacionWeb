const API = 'http://localhost:3000/api';
const token = sessionStorage.getItem('token');
const nombre = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombre || '';

if (!token) window.location.href = 'login.html';

const tabla = document.querySelector('#tablaTanque tbody');
const buscador = document.getElementById('buscador');
const alerta = document.getElementById('alerta');
let tanquesGlobal = [];

function mostrarAlerta(msg, tipo = 'danger') {
  alerta.innerHTML = `<div class='alert alert-${tipo} alert-dismissible fade show' role='alert'>\n    ${msg}\n    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>\n  </div>`;
}

function cargarTanques(filtro = '') {
  fetch(`${API}/tanques`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      tanquesGlobal = data || [];
      tabla.innerHTML = '';
      let tanques = tanquesGlobal;
      if (filtro) {
        tanques = tanques.filter(t =>
          t.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
          t.ubicacion.toLowerCase().includes(filtro.toLowerCase()) ||
          t.capacidad_max.toString().includes(filtro) ||
          t.nivel_min_alerta?.toString().includes(filtro) ||
          t.nivel_max_alerta?.toString().includes(filtro)
        );
      }
      if (tanques.length === 0) {
        tabla.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No se encontraron tanques</td></tr>';
        return;
      }
      tanques.forEach(t => {
        tabla.innerHTML += `
          <tr>
            <td><span class="badge bg-primary">${t.id}</span></td>
            <td><strong>${t.nombre}</strong></td>
            <td>${t.ubicacion}</td>
            <td>${t.capacidad_max} L</td>
            <td>${t.nivel_min_alerta || '-'} L</td>
            <td>${t.nivel_max_alerta || '-'} L</td>
            <td>
              <span class="badge ${t.activo ? 'bg-success' : 'bg-danger'}">
                ${t.activo ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="editarTanque(${t.id})">Editar</button>
              <button class="btn btn-sm btn-danger" onclick="eliminarTanque(${t.id})">Eliminar</button>
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
  if (!confirm(`Estas seguro de que deseas eliminar el tanque "${tanque?.nombre}"? Esta accion no se puede deshacer.`)) return;
  
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
      mostrarAlerta('No se pudo eliminar el tanque: ' + err.message);
      btn.disabled = false;
      btn.textContent = 'Eliminar';
    });
}

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

cargarTanques();
