const API = 'http://localhost:3000/api';
const token = sessionStorage.getItem('token');
const nombre = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombre || '';
if (!token) window.location.href = 'login.html';

// Elementos DOM
const tabla = document.querySelector('#tablaReportes tbody');
const buscador = document.getElementById('buscador');
const alerta = document.getElementById('alerta');
let reportesGlobal = [];

// ---------- Helper: mostrar alerta ----------
function mostrarAlerta(msg, tipo = 'danger') {
  alerta.innerHTML = `<div class='alert alert-${tipo} alert-dismissible fade show' role='alert'>
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>`;
  setTimeout(() => {
    const alertDiv = alerta.querySelector('.alert');
    if (alertDiv) alertDiv.remove();
  }, 4000);
}

// ---------- Cargar lista de reportes ----------
function cargarReportes(filtro = '') {
  fetch(`${API}/reportes`)
    .then(res => res.json())
    .then(data => {
      reportesGlobal = data || [];
      let reportes = reportesGlobal;
      if (filtro) {
        const f = filtro.toLowerCase();
        reportes = reportes.filter(r =>
          r.titulo.toLowerCase().includes(f) ||
          (r.tanque_nombre && r.tanque_nombre.toLowerCase().includes(f))
        );
      }
      tabla.innerHTML = '';
      if (reportes.length === 0) {
        tabla.innerHTML = '<tr><td colspan="11" class="text-center text-muted">No se encontraron reportes</td></tr>';
        return;
      }
      reportes.forEach(r => {
        tabla.innerHTML += `
          <tr>
            <td><span class="badge bg-secondary">${r.id}</span></td>
            <td><strong>${escapeHtml(r.titulo)}</strong></td>
            <td>${escapeHtml(r.tanque_nombre || 'N/A')}</td>
            <td>${formatDate(r.fecha_inicio)}</td>
            <td>${formatDate(r.fecha_fin)}</td>
            <td>${r.nivel_promedio} L</td>
            <td>${r.nivel_maximo} L</td>
            <td>${r.nivel_minimo} L</td>
            <td>${r.total_mediciones || 0}</td>
            <td>${escapeHtml(r.generado_por_nombre || '?')}</td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="editarReporte(${r.id})">Editar</button>
              <button class="btn btn-sm btn-danger" onclick="eliminarReporte(${r.id})">Eliminar</button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => mostrarAlerta('Error al cargar reportes: ' + err.message));
}

// ---------- Búsqueda en tiempo real ----------
buscador.addEventListener('input', e => cargarReportes(e.target.value));

// ---------- Helper: escapar HTML ----------
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

// ---------- Cargar tanques para el select del modal ----------
function cargarTanquesSelect() {
  fetch(`${API}/tanques`)
    .then(res => res.json())
    .then(tanques => {
      const select = document.getElementById('tanque_id');
      select.innerHTML = '<option value="">Seleccione un tanque...</option>';
      tanques.forEach(t => {
        select.innerHTML += `<option value="${t.id}">${escapeHtml(t.nombre)} (${t.ubicacion})</option>`;
      });
    })
    .catch(err => console.error('Error cargando tanques:', err));
}

// ---------- Calcular estadísticas (endpoint protegido) ----------
const btnCalcular = document.getElementById('btnCalcularEstadisticas');
const resultadoDiv = document.getElementById('resultadoEstadisticas');
let estadisticasActuales = null;

btnCalcular.addEventListener('click', () => {
  const tanque_id = document.getElementById('tanque_id').value;
  const fecha_inicio = document.getElementById('fecha_inicio').value;
  const fecha_fin = document.getElementById('fecha_fin').value;

  if (!tanque_id || !fecha_inicio || !fecha_fin) {
    mostrarAlerta('Complete tanque, fecha inicio y fecha fin', 'warning');
    return;
  }

  const url = `${API}/reportes/estadisticos?tanque_id=${tanque_id}&fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`;
  fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) throw new Error(data.error);
      const stats = data.estadisticos;
      if (!stats.total_mediciones) {
        mostrarAlerta('No hay mediciones en el rango de fechas seleccionado', 'warning');
        resultadoDiv.style.display = 'none';
        document.getElementById('btnGuardarReporte').disabled = true;
        return;
      }
      estadisticasActuales = {
        total_mediciones: stats.total_mediciones,
        nivel_promedio: stats.nivel_promedio,
        nivel_maximo: stats.nivel_maximo,
        nivel_minimo: stats.nivel_minimo
      };
      document.getElementById('total_mediciones').textContent = stats.total_mediciones;
      document.getElementById('nivel_promedio').textContent = stats.nivel_promedio;
      document.getElementById('nivel_maximo').textContent = stats.nivel_maximo;
      document.getElementById('nivel_minimo').textContent = stats.nivel_minimo;
      resultadoDiv.style.display = 'block';
      document.getElementById('btnGuardarReporte').disabled = false;
    })
    .catch(err => {
      mostrarAlerta('Error al calcular estadísticas: ' + err.message);
      resultadoDiv.style.display = 'none';
      document.getElementById('btnGuardarReporte').disabled = true;
    });
});

// ---------- Guardar reporte (POST) ----------
const formGenerar = document.getElementById('formGenerarReporte');
formGenerar.addEventListener('submit', (e) => {
  e.preventDefault();
  const titulo = document.getElementById('titulo').value.trim();
  const tanque_id = document.getElementById('tanque_id').value;
  const fecha_inicio = document.getElementById('fecha_inicio').value;
  const fecha_fin = document.getElementById('fecha_fin').value;

  if (!titulo || !tanque_id || !fecha_inicio || !fecha_fin) {
    mostrarAlerta('Todos los campos son obligatorios', 'warning');
    return;
  }
  if (!estadisticasActuales) {
    mostrarAlerta('Primero calcule las estadísticas', 'warning');
    return;
  }

  const payload = {
    titulo,
    tanque_id,
    fecha_inicio,
    fecha_fin,
    nivel_promedio: estadisticasActuales.nivel_promedio,
    nivel_maximo: estadisticasActuales.nivel_maximo,
    nivel_minimo: estadisticasActuales.nivel_minimo,
    total_mediciones: estadisticasActuales.total_mediciones
  };

  fetch(`${API}/reportes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.error) throw new Error(resp.error);
      mostrarAlerta('Reporte creado exitosamente', 'success');
      // Cerrar modal y resetear formulario
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalGenerarReporte'));
      modal.hide();
      formGenerar.reset();
      resultadoDiv.style.display = 'none';
      estadisticasActuales = null;
      document.getElementById('btnGuardarReporte').disabled = true;
      cargarReportes(); // refrescar tabla
    })
    .catch(err => mostrarAlerta('Error al guardar: ' + err.message));
});

// ---------- Editar título ----------
let reporteIdEditar = null;
function editarReporte(id) {
  const reporte = reportesGlobal.find(r => r.id === id);
  if (!reporte) return;
  reporteIdEditar = id;
  document.getElementById('editReporteId').value = id;
  document.getElementById('editTitulo').value = reporte.titulo;
  const modal = new bootstrap.Modal(document.getElementById('modalEditarTitulo'));
  modal.show();
}

document.getElementById('btnGuardarEdicion').addEventListener('click', () => {
  const nuevoTitulo = document.getElementById('editTitulo').value.trim();
  if (!nuevoTitulo) {
    mostrarAlerta('El título no puede estar vacío', 'warning');
    return;
  }
  fetch(`${API}/reportes/${reporteIdEditar}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ titulo: nuevoTitulo })
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.error) throw new Error(resp.error);
      mostrarAlerta('Título actualizado', 'success');
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarTitulo'));
      modal.hide();
      cargarReportes();
    })
    .catch(err => mostrarAlerta('Error al editar: ' + err.message));
});

// ---------- Eliminar reporte ----------
function eliminarReporte(id) {
  const reporte = reportesGlobal.find(r => r.id === id);
  if (!confirm(`¿Eliminar el reporte "${reporte?.titulo}"? Esta acción no se puede deshacer.`)) return;

  fetch(`${API}/reportes/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.error) throw new Error(resp.error);
      mostrarAlerta('Reporte eliminado', 'success');
      cargarReportes();
    })
    .catch(err => mostrarAlerta('Error al eliminar: ' + err.message));
}

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// ---------- Inicialización ----------
cargarTanquesSelect();
cargarReportes();

// Limpiar estadísticas al cerrar modal de creación
document.getElementById('modalGenerarReporte').addEventListener('hidden.bs.modal', function () {
  formGenerar.reset();
  resultadoDiv.style.display = 'none';
  estadisticasActuales = null;
  document.getElementById('btnGuardarReporte').disabled = true;
});