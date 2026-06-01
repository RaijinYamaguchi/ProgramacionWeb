const API = 'http://127.0.0.1:3000/api';
const token = sessionStorage.getItem('token');
const nombre = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombre || '';

if (!token) window.location.href = 'login.html';

const tabla = document.querySelector('#tablaDispositivos tbody');
const buscador = document.getElementById('buscador');
const alerta = document.getElementById('alerta');

function mostrarAlerta(msg, tipo = 'danger') {
  alerta.innerHTML = `<div class='alert alert-${tipo}'>${msg}</div>`;
}

function cargarDispositivos(filtro = '') {
  fetch(`${API}/dispositivos`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
        
      tabla.innerHTML = '';
      let dispositivos = data;
      if (filtro) {
        dispositivos = dispositivos.filter(d =>
          d.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
          d.ubicacion.toLowerCase().includes(filtro.toLowerCase())
        );
      }
      console.log('Dispositivos cargados:', dispositivos);
      dispositivos.forEach(d => {
        tabla.innerHTML += `
          <tr>
            <td>${d.id}</td>
            <td>${d.nombre}</td>
            <td>${d.ubicacion}</td>
            <td>${d.funcionalidad}</td>
            <td>${d.activo ? 'Sí' : 'No'}</td>
            <td>${d.creado_en}</td>
            <td>
              <button onclick="editarDispositivo(${d.id})">Editar</button>
              <button onclick="eliminarDispositivo(${d.id})">Eliminar</button>
            </td>
          </tr>
        `;
      });
    })
    .catch(() => mostrarAlerta('Error al cargar dispositivos'));
}

buscador.addEventListener('input', e => cargarDispositivos(e.target.value));

function editarDispositivo(id) {
  window.location.href = `dispositivos-editar.html?id=${id}`;
}

function eliminarDispositivo(id) {
  if (!confirm('¿Seguro que deseas eliminar este dispositivo?')) return;
  fetch(`${API}/dispositivos/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(() => cargarDispositivos())
    .catch(() => mostrarAlerta('No se pudo eliminar el dispositivo'));
}

function cerrarSesión() { 
  if (!confirm('Seguro que deseas cerrar sesión?')) return; 
  sessionStorage.clear();  // elimina token y nombre 
  window.location.href = 'login.html'; 
} 

cargarDispositivos();
