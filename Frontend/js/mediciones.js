const token = sessionStorage.getItem('token');
const nombre = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombre || '';

if (!token) window.location.href = 'login.html';

const tabla = document.querySelector('#bodyMediciones');
const buscador = document.getElementById('buscador');
const alerta = document.getElementById('alerta');
let todasLasMediciones = [];

function mostrarAlerta(msg, tipo = 'danger') {
  const alertaDiv = document.getElementById('alerta') || document.body;
  const html = `<div class='alert alert-${tipo} alert-dismissible fade show' role='alert'>
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>`;
  
  if (document.getElementById('alerta')) {
    document.getElementById('alerta').innerHTML = html;
  } else {
    const container = document.querySelector('.container-mediciones');
    container.insertAdjacentHTML('beforebegin', `<div id="alerta">${html}</div>`);
  }
}

function cerrarSesión() { 
  if (!confirm('Seguro que deseas cerrar sesión?')) return; 
  sessionStorage.clear();  // elimina token y nombre 
  window.location.href = 'login.html'; 
}

function cargarTodasLasMediciones(filtro = '') {
  fetch(`${API.url('mediciones')}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => {
      if (res.status === 401) { cerrarSesion(); return; }
      return res.json();
    })
    .then(data => {
      if (!data) return;
      todasLasMediciones = data;
      tabla.innerHTML = '';
      
      let mediciones = todasLasMediciones;
      if (filtro) {
        mediciones = mediciones.filter(m =>
          (m.id || '').toString().includes(filtro) ||
          (m.dispositivo_nombre || '').toLowerCase().includes(filtro.toLowerCase()) ||
          (m.tanque_nombre || '').toLowerCase().includes(filtro.toLowerCase()) ||
          (m.nivel_agua || '').toString().includes(filtro) ||
          (m.porcentaje || '').toString().includes(filtro)
        );
      }
      
      if (mediciones.length === 0) {
        tabla.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No hay mediciones registradas</td></tr>';
        return;
      }
      
      mediciones.forEach(m => {
        const fecha = m.fecha ? new Date(m.fecha).toLocaleString('es-MX', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }) : '-';
        
        tabla.innerHTML += `
          <tr>
            <td><span class="badge bg-info">${m.id}</span></td>
            <td>${m.dispositivo_nombre || '-'}</td>
            <td>${(m.nivel_agua || 0).toFixed(2)} cm</td>
            <td>${(m.porcentaje || 0).toFixed(1)}%</td>
            <td><small>${fecha}</small></td>
            <td>
              <button class="btn btn-sm btn-danger" onclick="eliminarMedicion(${m.id})">
                <i class="bi bi-trash"></i> Eliminar
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => {
      mostrarAlerta('Error al cargar mediciones: ' + err.message);
      tabla.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar mediciones</td></tr>';
    });
}

// Cargar mediciones al iniciar
document.addEventListener('DOMContentLoaded', () => {
  cargarTodasLasMediciones();
});

// Buscador
const buscadorInput = document.getElementById('buscador');
if (buscadorInput) {
  buscadorInput.addEventListener('input', e => cargarTodasLasMediciones(e.target.value));
}

function recargarMediciones() {
  cargarTodasLasMediciones();
}

function eliminarMedicion(id) {
  const medicion = todasLasMediciones.find(m => m.id === id);
  if (!confirm(`¿Estás seguro de que deseas eliminar esta medición? Esta acción no se puede deshacer.`)) return;
  
  const btn = event.target.closest('button');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Eliminando...';
  
  fetch(`${API.url('mediciones')}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.error || resp.mensaje?.includes('error')) {
        mostrarAlerta(resp.error || resp.mensaje);
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
      } else {
        mostrarAlerta('Medición eliminada correctamente', 'success');
        cargarTodasLasMediciones();
      }
    })
    .catch(err => {
      mostrarAlerta('Error: ' + err.message);
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
    });
}

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}

cargarMediciones();
