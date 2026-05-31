const API = 'http://localhost:3000/api';
const token = sessionStorage.getItem('token');
const nombre = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombre || '';

if (!token) window.location.href = 'login.html';

const form = document.getElementById('formEditar');
const alerta = document.getElementById('alerta');

function mostrarAlerta(msg, tipo = 'danger') {
  alerta.innerHTML = `<div class='alert alert-${tipo} alert-dismissible fade show' role='alert'>
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>`;
}

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

if (!id) window.location.href = 'Tanques.html';

fetch(`${API}/tanques/${id}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(res => res.json())
  .then(u => {
    document.getElementById('tanqueId').value = u.id;
    document.getElementById('nombre').value = u.nombre;
    document.getElementById('ubicacion').value = u.ubicacion;
    document.getElementById('capacidad_max').value = u.capacidad_max;
    document.getElementById('nivel_min_alerta').value = u.nivel_min_alerta || '';
    document.getElementById('nivel_max_alerta').value = u.nivel_max_alerta || '';
    document.getElementById('activo').checked = u.activo;
  })
  .catch(err => mostrarAlerta('No se pudo cargar el tanque: ' + err.message));

form.addEventListener('submit', e => {
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando...';

  const data = {
    nombre: document.getElementById('nombre').value.trim(),
    ubicacion: document.getElementById('ubicacion').value.trim(),
    capacidad_max: parseFloat(document.getElementById('capacidad_max').value),
    nivel_min_alerta: parseFloat(document.getElementById('nivel_min_alerta').value) || null,
    nivel_max_alerta: parseFloat(document.getElementById('nivel_max_alerta').value) || null,
    activo: document.getElementById('activo').checked
  };

  if (!data.nombre) {
    mostrarAlerta('El nombre del tanque es requerido');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    return;
  }

  if (data.capacidad_max <= 0) {
    mostrarAlerta('La capacidad debe ser mayor a 0');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    return;
  }

  fetch(`${API}/tanques/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.error) {
        mostrarAlerta(resp.error);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      } else {
        mostrarAlerta('Tanque actualizado correctamente', 'success');
        setTimeout(() => window.location.href = 'Tanques.html', 1500);
      }
    })
    .catch(err => {
      mostrarAlerta('No se pudo editar el tanque: ' + err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    })
});

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}
