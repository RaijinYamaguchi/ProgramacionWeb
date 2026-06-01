const API = 'http://localhost:3000/api';
const token = sessionStorage.getItem('token');
const nombre = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombre || '';

if (!token) window.location.href = 'login.html';

const form = document.getElementById('formRegistro');
const alerta = document.getElementById('alerta');

function mostrarAlerta(msg, tipo = 'danger') {
  alerta.innerHTML = `<div class='alert alert-${tipo}'>${msg}</div>`;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  fetch(`${API}/auth/registro`, {
    method: 'POST',
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
    .catch(() => mostrarAlerta('No se pudo registrar el usuario'));
});
function cerrarSesión() { 
  if (!confirm('Seguro que deseas cerrar sesión?')) return; 
  sessionStorage.clear();  // elimina token y nombre 
  window.location.href = 'login.html'; 
} 

