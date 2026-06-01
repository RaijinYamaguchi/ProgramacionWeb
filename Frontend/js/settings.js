const API = 'http://localhost:3000/api';
const token = sessionStorage.getItem('token');
const nombre = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombre || '';
if (!token) window.location.href = 'login.html';

function mostrarAlerta(msg, tipo = 'danger') {
    const alerta = document.getElementById('alerta');
    alerta.innerHTML = `<div class='alert alert-${tipo} alert-dismissible fade show' role='alert'>
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;    
    setTimeout(() => {
        const alertDiv = alerta.querySelector('.alert');
        if (alertDiv) alertDiv.remove();
    }, 4000);
}

function cargarConfiguracion() {
    fetch(`${API}/config`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        if (!data || !data.config) {
            mostrarAlerta('No se pudo cargar la configuración', 'warning');
            return;
        }
        const config = data.config;
        document.getElementById('umbralMinimo').value = config.umbral_minimo ?? '';
        document.getElementById('umbralMaximo').value = config.umbral_maximo ?? '';
        document.getElementById('frecuenciaMedicion').value = config.frecuencia_medicion ?? '';
    })
    .catch(err => {
        console.error('Error al cargar configuración:', err);
        mostrarAlerta('Error al cargar configuración');
    });
}

function guardarConfiguracion() {
    const umbralMinimo = document.getElementById('umbralMinimo').value;
    const umbralMaximo = document.getElementById('umbralMaximo').value;
    const frecuenciaMedicion = document.getElementById('frecuenciaMedicion').value;
    
    fetch(`${API}/config`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            umbral_minimo: umbralMinimo ? parseFloat(umbralMinimo) : null,
            umbral_maximo: umbralMaximo ? parseFloat(umbralMaximo) : null,
            frecuencia_medicion: frecuenciaMedicion ? parseInt(frecuenciaMedicion) : null
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            mostrarAlerta('Configuración guardada', 'success');
        }
        else {  
            mostrarAlerta('Error al guardar configuración: ' + (data.message || ''));
        }
    })
    .catch(err => {
        console.error('Error al guardar configuración:', err);
        mostrarAlerta('Error al guardar configuración');
    });
}

document.getElementById('guardarBtn').addEventListener('click', guardarConfiguracion);
window.addEventListener('load', cargarConfiguracion);

function cerrarSesion() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// ---------- Código relacionado con tanques (puede moverse a tanques.js) ----------
const buscador = document.getElementById('buscador');
const tablaTanques = document.getElementById('tablaTanques');

function cargarTanques(filtro = '') {
    fetch(`${API}/tanques?search=${encodeURIComponent(filtro)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        if (!data || !data.tanques) {
            mostrarAlerta('No se pudieron cargar los tanques', 'warning');
            return;
        }
        tablaTanques.innerHTML = '';
        data.tanques.forEach(tanque => {
            tablaTanques.innerHTML += `
                <tr>
                    <td>${escapeHtml(tanque.nombre)}</td>
                    <td>${escapeHtml(tanque.descripcion)}</td>
                    <td>${tanque.capacidad}</
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editarTanque(${tanque.id})">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarTanque(${tanque.id})">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });
    })
    .catch(err => {
        console.error('Error al cargar tanques:', err);
        mostrarAlerta('Error al cargar tanques');
    });
}