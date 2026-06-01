const API = 'http://127.0.0.1:3000/api';
const token = sessionStorage.getItem('token');
const nombreUsuario = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombreUsuario || '';
if (!token) window.location.href = 'login.html';

// Obtener ID del usuario desde la URL
const urlParams = new URLSearchParams(window.location.search);
const usuarioId = urlParams.get('id');

if (!usuarioId) {
  mostrarAlerta('No se especificó qué usuario editar', 'danger');
  setTimeout(() => window.location.href = 'Usuarios.html', 2000);
}

const alertaDiv = document.getElementById('alerta');
const form = document.getElementById('formEditarUsuario');
const cambiarPasswordCheck = document.getElementById('cambiarPassword');
const passwordFields = document.getElementById('passwordFields');

cambiarPasswordCheck.addEventListener('change', () => {
  passwordFields.style.display = cambiarPasswordCheck.checked ? 'block' : 'none';
  if (!cambiarPasswordCheck.checked) {
    document.getElementById('password').value = '';
    document.getElementById('confirmar_password').value = '';
  }
});

function mostrarAlerta(msg, tipo = 'danger') {
  alertaDiv.innerHTML = `<div class='alert alert-${tipo} alert-dismissible fade show'>${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
  setTimeout(() => {
    const alert = alertaDiv.querySelector('.alert');
    if (alert) alert.remove();
  }, 5000);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

// Cargar datos del usuario
async function cargarUsuario() {
  try {
    const response = await fetch(`${API}/auth/usuarios/${usuarioId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const usuario = await response.json();
    if (usuario.error) throw new Error(usuario.error);

    document.getElementById('usuario_id').value = usuario.id;
    document.getElementById('nombre').value = usuario.nombre || '';
    document.getElementById('email').value = usuario.email || '';
    document.getElementById('rol').value = usuario.rol || 'usuario';
  } catch (err) {
    mostrarAlerta('Error al cargar el usuario: ' + err.message);
    console.error(err);
  }
}

// Enviar actualización
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('usuario_id').value;
  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const rol = document.getElementById('rol').value;
  const cambiarPassword = cambiarPasswordCheck.checked;
  const nuevaPassword = document.getElementById('password').value;
  const confirmarPassword = document.getElementById('confirmar_password').value;

  if (!nombre || !email) {
    mostrarAlerta('Nombre y correo son obligatorios', 'warning');
    return;
  }
  if (!email.includes('@')) {
    mostrarAlerta('Correo electrónico inválido', 'warning');
    return;
  }

  const payload = { nombre, email, rol };
  if (cambiarPassword) {
    if (!nuevaPassword || nuevaPassword.length < 6) {
      mostrarAlerta('La nueva contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      mostrarAlerta('Las contraseñas no coinciden', 'warning');
      return;
    }
    payload.password = nuevaPassword;
  }

  try {
    const response = await fetch(`${API}/auth/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const resp = await response.json();
    if (resp.error) throw new Error(resp.error);
    mostrarAlerta('Usuario actualizado correctamente', 'success');
    setTimeout(() => {
      window.location.href = 'Usuarios.html';
    }, 1500);
  } catch (err) {
    mostrarAlerta('Error al actualizar: ' + err.message);
  }
});

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

cargarUsuario();