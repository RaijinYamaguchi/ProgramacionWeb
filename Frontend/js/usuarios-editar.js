const API = 'http://localhost:3000/api';
const token = sessionStorage.getItem('token');
const nombre = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombre || '';

if (!token) window.location.href = 'login.html';

const form = document.getElementById('formEditar');
const alerta = document.getElementById('alerta');

function mostrarAlerta(msg, tipo = 'danger') {
  alerta.innerHTML = `<div class='alert alert-${tipo}'>${msg}</div>`;
}

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

if (!id) window.location.href = 'usuarios.html';

fetch(`${API}/auth/usuarios/${id}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(res => res.json())
  .then(u => {
    document.getElementById('usuarioId').value = u.id;
    document.getElementById('nombre').value = u.nombre;
    document.getElementById('email').value = u.email;
    document.getElementById('rol').value = u.rol;
  })
  .catch(() => mostrarAlerta('No se pudo cargar el usuario'));

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = {
    nombre: document.getElementById('nombre').value,
    email: document.getElementById('email').value,
    rol: document.getElementById('rol').value
  };
  fetch(`${API}/auth/usuarios/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.error) return mostrarAlerta(resp.error);
      window.location.href = 'Usuarios.html';
    })
    .catch(() => mostrarAlerta('No se pudo editar el usuario'));
});

function cerrarSesión() { 
  if (!confirm('Seguro que deseas cerrar sesión?')) return; 
  sessionStorage.clear();  // elimina token y nombre 
  window.location.href = 'login.html'; 
} 
