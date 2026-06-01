/* ── TOKENS.JS — Gestión de tokens JWT para dispositivos ESP ── */
const token = sessionStorage.getItem('token');
const nombre = sessionStorage.getItem('nombre');


// ── Guardia de sesión ───────────────────────────────────────
if (!token) window.location.href = 'login.html';

// ── Mostrar nombre de usuario ───────────────────────────────
document.getElementById('nombreUsuario').textContent =
  sessionStorage.getItem('sca_username') || '';

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// ── Headers con JWT ─────────────────────────────────────────
function authHeaders() {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// ── Alerta principal ────────────────────────────────────────
function mostrarAlerta(msg, tipo = 'danger') {
  document.getElementById('alerta').innerHTML =
    `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
       ${msg}
       <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
     </div>`;
}

// ── Alerta dentro del modal ─────────────────────────────────
function mostrarAlertaModal(msg, tipo = 'danger') {
  document.getElementById('alertaModal').innerHTML =
    `<div class="alert alert-${tipo} py-2 small">${msg}</div>`;
}

// ── Fecha legible ───────────────────────────────────────────
function formatFecha(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ════════════════════════════════════════════════════════════
//  CARGAR TOKENS
// ════════════════════════════════════════════════════════════
let todosLosTokens = [];

async function cargarTokens() {
  try {
    const res = await fetch(API.url('tokensList'), { headers: authHeaders() });

    if (res.status === 401) { cerrarSesion(); return; }
    if (!res.ok) throw new Error('Error al obtener los tokens');

    todosLosTokens = await res.json();
    renderTabla(todosLosTokens);

  } catch (err) {
    mostrarAlerta(err.message);
    document.getElementById('spinner').classList.add('d-none');
  }
}

// ── Construye las filas de la tabla ────────────────────────
function renderTabla(tokens) {
  document.getElementById('spinner').classList.add('d-none');
  document.getElementById('contenido').classList.remove('d-none');

  const tbody = document.getElementById('cuerpoTabla');
  tbody.innerHTML = '';

  if (!tokens.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">
      Sin tokens registrados. Genera uno para tu ESP.
    </td></tr>`;
    document.getElementById('contadorTokens').textContent = '';
    return;
  }

  tokens.forEach(t => {
    const activo   = t.activo === 1;
    const expirado = new Date(t.expires_at) < new Date();
    const badge    = activo && !expirado
      ? '<span class="badge bg-success">Activo</span>'
      : expirado
        ? '<span class="badge bg-secondary">Expirado</span>'
        : '<span class="badge bg-danger">Revocado</span>';

    const btnRevocar = activo && !expirado
      ? `<button class="btn btn-danger btn-sm" onclick="abrirModalRevocar(${t.id})">
           <i class="bi bi-x-circle"></i> Revocar
         </button>`
      : `<button class="btn btn-secondary btn-sm" disabled>Inactivo</button>`;

    tbody.innerHTML += `
      <tr>
        <td>${t.id}</td>
        <td><strong>${t.dispositivo_nombre || '—'}</strong></td>
        <td>${t.tanque_nombre || '—'}</td>
        <td>${t.descripcion  || '<span class="text-muted">Sin descripción</span>'}</td>
        <td>${formatFecha(t.ultimo_uso)}</td>
        <td class="${expirado ? 'text-danger' : ''}">${formatFecha(t.expires_at)}</td>
        <td>${badge}</td>
        <td>${btnRevocar}</td>
      </tr>`;
  });

  document.getElementById('contadorTokens').textContent =
    `${tokens.length} token${tokens.length !== 1 ? 's' : ''} encontrado${tokens.length !== 1 ? 's' : ''}`;
}

// ── Buscador ────────────────────────────────────────────────
document.getElementById('buscador').addEventListener('input', function () {
  const q = this.value.toLowerCase();
  const filtrados = todosLosTokens.filter(t =>
    (t.dispositivo_nombre || '').toLowerCase().includes(q) ||
    (t.descripcion        || '').toLowerCase().includes(q) ||
    (t.tanque_nombre      || '').toLowerCase().includes(q)
  );
  renderTabla(filtrados);
});

// ════════════════════════════════════════════════════════════
//  GENERAR TOKEN
// ════════════════════════════════════════════════════════════
async function generarToken() {
  const device_id   = parseInt(document.getElementById('inputDeviceId').value);
  const descripcion = document.getElementById('inputDescripcion').value.trim();

  document.getElementById('alertaModal').innerHTML    = '';
  document.getElementById('resultadoToken').classList.add('d-none');

  if (!device_id || device_id < 1) {
    mostrarAlertaModal('Ingresa un ID de dispositivo válido.');
    return;
  }

  const btn = document.getElementById('btnGenerar');
  btn.disabled    = true;
  btn.textContent = 'Generando...';

  try {
    const res = await fetch(API.url('tokensGenerar'), {
      method:  'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        dispositivo_id: device_id,
        ...(descripcion && { descripcion }),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarAlertaModal(data.message || 'Error al generar el token');
      return;
    }

    // Mostrar el token generado
    document.getElementById('tokenGenerado').value = data.token;
    document.getElementById('tokenExpira').textContent =
      `Expira: ${formatFecha(data.expires_at)} (${data.duracion})`;
    document.getElementById('resultadoToken').classList.remove('d-none');

    // Recargar tabla
    cargarTokens();

  } catch {
    mostrarAlertaModal('No se pudo conectar con el servidor.');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Generar';
  }
}

// ── Copiar token al portapapeles ────────────────────────────
function copiarToken() {
  const input = document.getElementById('tokenGenerado');
  input.select();
  navigator.clipboard.writeText(input.value).then(() => {
    mostrarAlertaModal('Token copiado al portapapeles', 'success');
  });
}

// ── Limpiar modal al cerrarlo ───────────────────────────────
document.getElementById('modalGenerarToken').addEventListener('hidden.bs.modal', () => {
  document.getElementById('inputDeviceId').value   = '';
  document.getElementById('inputDescripcion').value = '';
  document.getElementById('alertaModal').innerHTML  = '';
  document.getElementById('resultadoToken').classList.add('d-none');
});

// ════════════════════════════════════════════════════════════
//  REVOCAR TOKEN
// ════════════════════════════════════════════════════════════
function abrirModalRevocar(tokenId) {
  document.getElementById('tokenIdRevocar').value = tokenId;
  new bootstrap.Modal(document.getElementById('modalRevocar')).show();
}

async function confirmarRevocar() {
  const tokenId = document.getElementById('tokenIdRevocar').value;
  const modal   = bootstrap.Modal.getInstance(document.getElementById('modalRevocar'));

  try {
    const res = await fetch(`${API.BASE_URL}/api/auth/dispositivos/token/${tokenId}`, {
      method:  'DELETE',
      headers: authHeaders(),
    });

    const data = await res.json();
    modal.hide();

    if (!res.ok) {
      mostrarAlerta(data.message || 'Error al revocar el token');
      return;
    }

    mostrarAlerta(data.mensaje || 'Token revocado correctamente', 'success');
    cargarTokens();

  } catch {
    modal.hide();
    mostrarAlerta('No se pudo conectar con el servidor.');
  }
}
function cerrarSesión() { 
  if (!confirm('Seguro que deseas cerrar sesión?')) return; 
  sessionStorage.clear();  // elimina token y nombre 
  window.location.href = 'login.html'; 
} 

// ════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', cargarTokens);
cargarTokens();