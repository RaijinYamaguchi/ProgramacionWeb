const API = 'http://127.0.0.1:3000/api';
const token = sessionStorage.getItem('token');
const nombreUsuario = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombreUsuario || '';
if (!token) window.location.href = 'login.html';

const tanqueSelect = document.getElementById('tanqueSelect');
const tablaBody = document.querySelector('#tablaDispositivosTanque tbody');
const alertaDiv = document.getElementById('alerta');

function mostrarAlerta(msg, tipo = 'danger') {
  alertaDiv.innerHTML = `<div class='alert alert-${tipo} alert-dismissible fade show'>${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
  setTimeout(() => {
    const alert = alertaDiv.querySelector('.alert');
    if (alert) alert.remove();
  }, 5000);
}

// Función escapeHtml segura: acepta cualquier tipo y retorna string
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  // Convertir a string si no lo es (por si es número, objeto, etc.)
  const texto = String(str);
  return texto.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch (e) {
    return '';
  }
}

// Cargar lista de tanques para el selector
async function cargarTanques() {
  try {
    const res = await fetch(`${API}/tanques`);
    if (!res.ok) throw new Error('Error al cargar tanques');
    const tanques = await res.json();
    tanqueSelect.innerHTML = '<option value="">-- Seleccione un tanque --</option>';
    tanques.forEach(t => {
      tanqueSelect.innerHTML += `<option value="${t.id}">${escapeHtml(t.nombre)} (${escapeHtml(t.ubicacion)}) - ${t.capacidad_max} L</option>`;
    });
  } catch (err) {
    mostrarAlerta('Error al cargar tanques: ' + err.message);
    tanqueSelect.innerHTML = '<option value="">Error al cargar tanques</option>';
  }
}

// Cargar dispositivos por tanque usando el endpoint correcto
async function cargarDispositivosPorTanque(tanqueId) {
  if (!tanqueId) {
    tablaBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Seleccione un tanque</td></tr>';
    return;
  }
  try {
    tablaBody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div></td></tr>';
    
    // Endpoint: GET /api/dispositivos/tanque/:tanque_id
    const res = await fetch(`${API}/dispositivos/tanque/${tanqueId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Error al cargar dispositivos');
    }
    const dispositivos = await res.json();
    
    if (!dispositivos.length) {
      tablaBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No hay dispositivos para este tanque</td></tr>';
      return;
    }
    
    tablaBody.innerHTML = '';
    dispositivos.forEach(d => {
      // Usar escapeHtml con todas las propiedades
      const nombre = escapeHtml(d.nombre);
      const ubicacion = escapeHtml(d.ubicacion);
      const funcionalidad = escapeHtml(d.funcionalidad);
      const usuario = escapeHtml(d.usuario_nombre || d.usuario_id);
      const activoBadge = d.activo 
        ? '<span class="badge bg-success">Activo</span>' 
        : '<span class="badge bg-danger">Inactivo</span>';
      const fecha = formatDate(d.creado_en);
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><span class="badge bg-primary">${d.id}</span></td>
        <td><strong>${nombre}</strong></td>
        <td>${ubicacion}</td>
        <td>${funcionalidad}</td>
        <td>${usuario}</td>
        <td>${activoBadge}</td>
        <td>${fecha}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editarDispositivo(${d.id})">✏️ Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarDispositivo(${d.id})">🗑 Eliminar</button>
        </td>
      `;
      tablaBody.appendChild(row);
    });
  } catch (err) {
    mostrarAlerta('Error: ' + err.message, 'danger');
    tablaBody.innerHTML = `<td><td colspan="8" class="text-center text-danger">Error al cargar dispositivos</td></tr>`;
  }
}

// Función global para editar
window.editarDispositivo = (id) => {
  window.location.href = `dispositivos-editar.html?id=${id}`;
};

// Función global para eliminar
window.eliminarDispositivo = async (id) => {
  if (!confirm('¿Eliminar este dispositivo? No se puede deshacer.')) return;
  try {
    const res = await fetch(`${API}/dispositivos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al eliminar');
    }
    mostrarAlerta('Dispositivo eliminado correctamente', 'success');
    // Recargar la lista del tanque actual
    const tanqueId = tanqueSelect.value;
    if (tanqueId) cargarDispositivosPorTanque(tanqueId);
  } catch (err) {
    mostrarAlerta('Error al eliminar: ' + err.message, 'danger');
  }
};

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// Evento: al cambiar el tanque seleccionado
tanqueSelect.addEventListener('change', (e) => {
  cargarDispositivosPorTanque(e.target.value);
});

// Inicializar
cargarTanques();