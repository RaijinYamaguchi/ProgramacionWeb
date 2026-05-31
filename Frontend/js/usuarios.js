const API = 'http://127.0.0.1:3000/api';
const token = sessionStorage.getItem('token');
const nombre = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombre || '';

if (!token) window.location.href = 'login.html';

const tabla = document.querySelector('#tablaUsuarios tbody');
const buscador = document.getElementById('buscador');
const alerta = document.getElementById('alerta');

function mostrarAlerta(msg, tipo = 'danger') {
  alerta.innerHTML = `<div class='alert alert-${tipo}'>${msg}</div>`;
}

function cargarUsuarios(filtro = '') {
  fetch(`${API}/auth/usuarios`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
        
      tabla.innerHTML = '';
      let usuarios = data;
      if (filtro) {
        usuarios = usuarios.filter(u =>
          u.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
          u.email.toLowerCase().includes(filtro.toLowerCase())
        );
      }
      console.log('Usuarios cargados:', usuarios);
      usuarios.forEach(u => {
        tabla.innerHTML += `
          <tr>
            <td>${u.id}</td>
            <td>${u.nombre}</td>
            <td>${u.email}</td>
            <td>${u.rol}</td>
            <td>
              <button onclick="editarUsuario(${u.id})">Editar</button>
              <button onclick="eliminarUsuario(${u.id})">Eliminar</button>
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
  if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
  fetch(`${API}/auth/usuarios/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(() => cargarUsuarios())
    .catch(() => mostrarAlerta('No se pudo eliminar el usuario'));
}

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

cargarUsuarios();
