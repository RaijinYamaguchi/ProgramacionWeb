const API = 'http://localhost:3000/api';
const token = sessionStorage.getItem('token');
const nombre = sessionStorage.getItem('nombre');

document.getElementById('nombreUsuario').textContent = nombre || '';

if (!token) window.location.href = 'login.html';

const form = document.getElementById('formRegistro');
const alerta = document.getElementById('alerta');

function mostrarAlerta(msg, tipo = 'danger') {
  alerta.innerHTML = `<div class='alert alert-${tipo} alert-dismissible fade show' role='alert'>
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>`;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando...';
  
  const data = {
    nombre: form.nombre.value.trim(),
    ubicacion: form.ubicacion.value.trim(),
    capacidad_max: parseFloat(form.capacidad_max.value),
    nivel_min_alerta: parseFloat(form.nivel_min_alerta.value) || null,
    nivel_max_alerta: parseFloat(form.nivel_max_alerta.value) || null
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

  fetch(`${API}/tanques`, {
    method: 'POST',
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
        mostrarAlerta('Tanque registrado correctamente', 'success');
        setTimeout(() => window.location.href = 'Tanques.html', 1500);
      }
    })
    .catch(err => {
      mostrarAlerta('No se pudo registrar el tanque: ' + err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    });
});

function cerrarSesión() { 
  if (!confirm('Seguro que deseas cerrar sesión?')) return; 
  sessionStorage.clear();  // elimina token y nombre 
  window.location.href = 'login.html'; 
} 
