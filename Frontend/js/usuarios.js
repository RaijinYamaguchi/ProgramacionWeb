const API = 'http://127.0.0.1:3000/api';
const token = sessionStorage.getItem('token');
const nombre = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombre || '';
if (!token) window.location.href = 'login.html';

const tabla = document.querySelector('#tablaUsuarios tbody');
const buscador = document.getElementById('buscador');
const alerta = document.getElementById('alerta');
let usuariosGlobal = [];

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

function cargarUsuarios(filtro = '') {
  fetch(`${API}/auth/usuarios`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      usuariosGlobal = data || [];
      let usuarios = usuariosGlobal;
      if (filtro) {
        usuarios = usuarios.filter(u =>
          u.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
          u.email.toLowerCase().includes(filtro.toLowerCase())
        );
      }
      tabla.innerHTML = '';
      if (usuarios.length === 0) {
        tabla.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No se encontraron usuarios</td></tr>';
        return;
      }
      usuarios.forEach(u => {
        tabla.innerHTML += `
          <tr>
            <td><span class="badge bg-primary">${u.id}</span></td>
            <td><strong>${escapeHtml(u.nombre)}</strong></td>
            <td>${escapeHtml(u.email)}</td>
            <td><span class="badge ${u.rol === 'admin' ? 'bg-danger' : 'bg-secondary'}">${u.rol}</span></td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="editarUsuario(${u.id})">
                <i class="bi bi-pencil"></i> Editar
              </button>
              <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${u.id})">
                <i class="bi bi-trash"></i> Eliminar
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(() => mostrarAlerta('Error al cargar usuarios'));
}

buscador.addEventListener('input', e => cargarUsuarios(e.target.value));

function editarUsuario(id) {
  window.location.href = `usuarios-editar.html?id=${id}`;
}

function eliminarUsuario(id) {
  const usuario = usuariosGlobal.find(u => u.id === id);
  if (!confirm(`¿Seguro que deseas eliminar al usuario "${usuario?.nombre}"?`)) return;
  fetch(`${API}/auth/usuarios/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(() => {
      mostrarAlerta('Usuario eliminado', 'success');
      cargarUsuarios();
    })
    .catch(() => mostrarAlerta('No se pudo eliminar el usuario'));
}

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

cargarUsuarios();