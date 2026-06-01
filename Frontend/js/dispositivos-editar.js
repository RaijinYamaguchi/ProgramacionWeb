const API = 'http://127.0.0.1:3000/api';
const token = sessionStorage.getItem('token');
const nombreUsuario = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombreUsuario || '';
if (!token) window.location.href = 'login.html';

const urlParams = new URLSearchParams(window.location.search);
const dispositivoId = urlParams.get('id');

if (!dispositivoId) {
  mostrarAlerta('No se especificó qué dispositivo editar', 'danger');
  setTimeout(() => window.location.href = 'Devices.html', 2000);
}

const alertaDiv = document.getElementById('alerta');
const form = document.getElementById('formEditarDispositivo');
const btnGuardar = document.getElementById('btnGuardar');

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

// Cargar usuarios (devuelve promesa)
function cargarUsuarios(selectedId = null) {
  return fetch(`${API}/auth/usuarios`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(usuarios => {
      const select = document.getElementById('usuario_id');
      select.innerHTML = '<option value="">Seleccione un usuario...</option>';
      usuarios.forEach(u => {
        const selected = (selectedId && u.id == selectedId) ? 'selected' : '';
        select.innerHTML += `<option value="${u.id}" ${selected}>${escapeHtml(u.nombre)} (${u.email})</option>`;
      });
      return usuarios;
    })
    .catch(err => {
      mostrarAlerta('Error al cargar usuarios: ' + err.message);
      return [];
    });
}

// Cargar tanques (devuelve promesa)
function cargarTanques(selectedId = null) {
  return fetch(`${API}/tanques`)
    .then(res => res.json())
    .then(tanques => {
      const select = document.getElementById('tanque_id');
      select.innerHTML = '<option value="">Seleccione un tanque...</option>';
      tanques.forEach(t => {
        const selected = (selectedId && t.id == selectedId) ? 'selected' : '';
        select.innerHTML += `<option value="${t.id}" ${selected}>${escapeHtml(t.nombre)} (${escapeHtml(t.ubicacion)}) - ${t.capacidad_max} L</option>`;
      });
      return tanques;
    })
    .catch(err => {
      mostrarAlerta('Error al cargar tanques: ' + err.message);
      return [];
    });
}

// Cargar datos del dispositivo y luego preseleccionar
async function cargarDispositivo() {
  try {
    const response = await fetch(`${API}/dispositivos/${dispositivoId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dispositivo = await response.json();
    if (dispositivo.error) throw new Error(dispositivo.error);

    // Llenar campos básicos
    document.getElementById('dispositivo_id').value = dispositivo.id;
    document.getElementById('nombre').value = dispositivo.nombre || '';
    document.getElementById('ubicacion').value = dispositivo.ubicacion || '';
    document.getElementById('funcionalidad').value = dispositivo.funcionalidad || '';
    document.getElementById('activo').checked = (dispositivo.activo === 1 || dispositivo.activo === true);

    // Cargar selects y preseleccionar
    await Promise.all([
      cargarUsuarios(dispositivo.usuario_id),
      cargarTanques(dispositivo.tanque_id)
    ]);
  } catch (err) {
    mostrarAlerta('Error al cargar el dispositivo: ' + err.message);
    console.error(err);
  }
}

// Enviar actualización
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('dispositivo_id').value;
  const nombre = document.getElementById('nombre').value.trim();
  const ubicacion = document.getElementById('ubicacion').value.trim();
  const funcionalidad = document.getElementById('funcionalidad').value.trim();
  const usuario_id = parseInt(document.getElementById('usuario_id').value);
  const tanque_id = parseInt(document.getElementById('tanque_id').value);
  const activo = document.getElementById('activo').checked ? 1 : 0;

  if (!nombre || !ubicacion || isNaN(usuario_id) || isNaN(tanque_id)) {
    mostrarAlerta('Los campos nombre, ubicación, usuario y tanque son obligatorios', 'warning');
    return;
  }

  const payload = { nombre, ubicacion, funcionalidad, usuario_id, tanque_id, activo };

  try {
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

    const response = await fetch(`${API}/dispositivos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const resp = await response.json();
    if (resp.error) throw new Error(resp.error);
    mostrarAlerta('Dispositivo actualizado correctamente', 'success');
    setTimeout(() => {
      window.location.href = 'Devices.html';
    }, 1500);
  } catch (err) {
    mostrarAlerta('Error al actualizar: ' + err.message);
    btnGuardar.disabled = false;
    btnGuardar.innerHTML = 'Actualizar dispositivo';
  }
});

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

cargarDispositivo();