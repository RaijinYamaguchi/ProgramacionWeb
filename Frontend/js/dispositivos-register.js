const API = 'http://127.0.0.1:3000/api';
const token = sessionStorage.getItem('token');
const nombreUsuario = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombreUsuario || '';
if (!token) window.location.href = 'login.html';

const alertaDiv = document.getElementById('alerta');
const form = document.getElementById('formRegistroDispositivo');

// Mostrar alerta
function mostrarAlerta(msg, tipo = 'danger') {
  alertaDiv.innerHTML = `<div class='alert alert-${tipo} alert-dismissible fade show' role='alert'>
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>`;
  setTimeout(() => {
    const alert = alertaDiv.querySelector('.alert');
    if (alert) alert.remove();
  }, 5000);
}

// Cargar usuarios para el select
function cargarUsuarios() {
  fetch(`${API}/auth/usuarios`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(usuarios => {
      const select = document.getElementById('usuario_id');
      select.innerHTML = '<option value="">Seleccione un usuario...</option>';
      usuarios.forEach(u => {
        select.innerHTML += `<option value="${u.id}">${escapeHtml(u.nombre)} (${u.email})</option>`;
      });
    })
    .catch(err => mostrarAlerta('Error al cargar usuarios: ' + err.message));
}

// Cargar tanques para el select
function cargarTanques() {
  fetch(`${API}/tanques`)
    .then(res => res.json())
    .then(tanques => {
      const select = document.getElementById('tanque_id');
      select.innerHTML = '<option value="">Seleccione un tanque...</option>';
      tanques.forEach(t => {
        select.innerHTML += `<option value="${t.id}">${escapeHtml(t.nombre)} (${escapeHtml(t.ubicacion)}) - ${t.capacidad_max} L</option>`;
      });
    })
    .catch(err => mostrarAlerta('Error al cargar tanques: ' + err.message));
}

// Escapar HTML para evitar inyección
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  const ubicacion = document.getElementById('ubicacion').value.trim();
  const funcionalidad = document.getElementById('funcionalidad').value.trim();
  const usuario_id = document.getElementById('usuario_id').value;
  const tanque_id = document.getElementById('tanque_id').value;
  const activo = document.getElementById('activo').checked ? 1 : 0;

  if (!nombre || !ubicacion || !usuario_id || !tanque_id) {
    mostrarAlerta('Faltan campos obligatorios', 'warning');
    return;
  }

  const payload = { nombre, ubicacion, funcionalidad, usuario_id, tanque_id, activo };
  console.log('Enviando:', payload); // ← verifica en consola

  try {
    const res = await fetch(`${API}/dispositivos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('Respuesta:', data); // ← ver respuesta completa
    if (!res.ok) throw new Error(data.error || 'Error del servidor');
    mostrarAlerta('Dispositivo registrado', 'success');
    setTimeout(() => window.location.href = 'Devices.html', 1500);
  } catch (err) {
    mostrarAlerta('Error: ' + err.message);
  }
});
function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}


// Inicializar
cargarUsuarios();
cargarTanques();