const API = 'http://127.0.0.1:3000/api';
const token = sessionStorage.getItem('token');
const nombre = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombre || '';
if (!token) window.location.href = 'login.html';

const tabla = document.querySelector('#tablaTokens tbody');
const buscador = document.getElementById('buscador');
const alerta = document.getElementById('alerta');
let tokensGlobal = [];

function mostrarAlerta(msg, tipo = 'danger') {
  alerta.innerHTML = `<div class='alert alert-${tipo} alert-dismissible fade show'>${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
  setTimeout(() => { const a = alerta.querySelector('.alert'); if (a) a.remove(); }, 4000);
}

function cargarTokens(filtro = '') {
  fetch(`${API}/tokens`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => {
      tokensGlobal = data || [];
      let filtrados = tokensGlobal;
      if (filtro) {
        const f = filtro.toLowerCase();
        filtrados = filtrados.filter(t =>
          (t.dispositivo_nombre && t.dispositivo_nombre.toLowerCase().includes(f)) ||
          t.token.toLowerCase().includes(f)
        );
      }
      tabla.innerHTML = '';
      if (filtrados.length === 0) {
        tabla.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No hay tokens registrados</td></tr>';
        return;
      }
      filtrados.forEach(t => {
        const expira = t.expires_at ? new Date(t.expires_at).toLocaleDateString() : 'Nunca';
        const ultimoUso = t.ultimo_uso ? new Date(t.ultimo_uso).toLocaleString() : '—';
        const creado = new Date(t.creado_en).toLocaleString();
        tabla.innerHTML += `
          <tr>
            <td><span class="badge bg-secondary">${t.id}</span></td>
            <td><code class="text-info">${t.token.substring(0, 12)}...</code></td>
            <td>${escapeHtml(t.dispositivo_nombre || '?')}</td>
            <td>${escapeHtml(t.descripcion || '—')}</td>
            <td><span class="badge ${t.activo ? 'bg-success' : 'bg-danger'}">${t.activo ? 'Activo' : 'Inactivo'}</span></td>
            <td>${expira}</td>
            <td>${ultimoUso}</td>
            <td>${creado}</td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="toggleActivo(${t.id}, ${!t.activo})">${t.activo ? 'Desactivar' : 'Activar'}</button>
              <button class="btn btn-sm btn-danger" onclick="eliminarToken(${t.id})">Eliminar</button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => mostrarAlerta('Error al cargar tokens: ' + err.message));
}

function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, function(m) { if (m==='&') return '&amp;'; if (m==='<') return '&lt;'; if (m==='>') return '&gt;'; return m; }); }

buscador.addEventListener('input', e => cargarTokens(e.target.value));

// Cargar lista de dispositivos para el select
function cargarDispositivosSelect() {
  fetch(`${API}/dispositivos`)
    .then(res => res.json())
    .then(dispositivos => {
      const select = document.getElementById('dispositivo_id');
      select.innerHTML = '<option value="">Seleccione...</option>';
      dispositivos.forEach(d => {
        select.innerHTML += `<option value="${d.id}">${escapeHtml(d.nombre)} (${escapeHtml(d.ubicacion || 'sin ubicación')})</option>`;
      });
    })
    .catch(err => console.error('Error cargando dispositivos:', err));
}

// Crear token
document.getElementById('formCrearToken').addEventListener('submit', (e) => {
  e.preventDefault();
  const dispositivo_id = document.getElementById('dispositivo_id').value;
  const descripcion = document.getElementById('descripcion').value;
  const expires_in_days = document.getElementById('expires_in_days').value;

  if (!dispositivo_id) {
    mostrarAlerta('Seleccione un dispositivo', 'warning');
    return;
  }

  fetch(`${API}/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ dispositivo_id, descripcion, expires_in_days: expires_in_days ? parseInt(expires_in_days) : null })
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.error) throw new Error(resp.error);
      mostrarAlerta('Token generado', 'success');
      // Mostrar modal con token
      document.getElementById('tokenGenerado').value = resp.token;
      const modal = new bootstrap.Modal(document.getElementById('modalVerToken'));
      modal.show();
      // Limpiar formulario y cerrar modal de creación
      bootstrap.Modal.getInstance(document.getElementById('modalCrearToken')).hide();
      document.getElementById('formCrearToken').reset();
      cargarTokens();
    })
    .catch(err => mostrarAlerta('Error: ' + err.message));
});

function copiarToken() {
  const input = document.getElementById('tokenGenerado');
  input.select();
  document.execCommand('copy');
  mostrarAlerta('Token copiado al portapapeles', 'success');
}

function toggleActivo(id, nuevoEstado) {
  fetch(`${API}/tokens/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ activo: nuevoEstado ? 1 : 0 })
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.error) throw new Error(resp.error);
      mostrarAlerta(`Token ${nuevoEstado ? 'activado' : 'desactivado'}`, 'success');
      cargarTokens();
    })
    .catch(err => mostrarAlerta('Error: ' + err.message));
}

function eliminarToken(id) {
  if (!confirm('¿Eliminar este token permanentemente?')) return;
  fetch(`${API}/tokens/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.error) throw new Error(resp.error);
      mostrarAlerta('Token eliminado', 'success');
      cargarTokens();
    })
    .catch(err => mostrarAlerta('Error: ' + err.message));
}

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// Inicializar
cargarDispositivosSelect();
cargarTokens();