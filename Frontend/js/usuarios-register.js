const API = 'http://127.0.0.1:3000/api';
const token = sessionStorage.getItem('token');
const nombreUsuario = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombreUsuario || '';
if (!token) window.location.href = 'login.html';

const form = document.getElementById('formRegistroUsuario');
const alertaDiv = document.getElementById('alerta');

function mostrarAlerta(msg, tipo = 'danger') {
  alertaDiv.innerHTML = `<div class='alert alert-${tipo} alert-dismissible fade show'>${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
  setTimeout(() => {
    const alert = alertaDiv.querySelector('.alert');
    if (alert) alert.remove();
  }, 5000);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmar = document.getElementById('confirmar_password').value;
  const rol = document.getElementById('rol').value;

  if (!nombre || !email || !password || !confirmar) {
    mostrarAlerta('Todos los campos son obligatorios', 'warning');
    return;
  }
  if (password.length < 6) {
    mostrarAlerta('La contraseña debe tener al menos 6 caracteres', 'warning');
    return;
  }
  if (password !== confirmar) {
    mostrarAlerta('Las contraseñas no coinciden', 'warning');
    return;
  }
  if (!email.includes('@')) {
    mostrarAlerta('Ingrese un correo electrónico válido', 'warning');
    return;
  }

  const payload = { nombre, email, password, rol };

  try {
    const response = await fetch(`${API}/auth/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    mostrarAlerta('Usuario registrado exitosamente', 'success');
    setTimeout(() => {
      window.location.href = 'Usuarios.html';
    }, 1500);
  } catch (err) {
    mostrarAlerta('Error al registrar: ' + err.message);
  }
});

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}