const API = 'http://127.0.0.1:3000/api/auth'; 
  
function registro() { 
  const nombre   = document.getElementById('inputNombre').value.trim(); 
  const email    = document.getElementById('inputEmail').value.trim(); 
  const password = document.getElementById('inputPassword').value.trim(); 
  const btn      = document.getElementById('btnRegistro'); 
  
  // 1. Validar que todos los campos llegaron 
  if (!nombre || !email || !password) { 
    mostrarAlerta('Todos los campos son requeridos.', 'warning'); 
    return; 
  } 
  
  // 2. Validar longitud minima de la contrasena 
  if (password.length < 6) { 
    mostrarAlerta('La contrasena debe tener al menos 6 caracteres.', 'warning'); 
    return; 
  } 
  
  btn.disabled = true; 
  btn.textContent = 'Registrando...'; 
  console.log('Enviando datos de registro:', { nombre, email, password });
  // 3. Hacer la peticion POST al backend 
  fetch(`${API}/registro`, { 
    method:  'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body:    JSON.stringify({ nombre, email, password }) 
  }) 
    .then(res => res.json()) 
    .then(data => { 
      if (data.error) { 
        mostrarAlerta(data.error, 'danger'); 
        return; 
      } 
      // 4. Mostrar exito y redirigir al login 
      mostrarAlerta('Cuenta creada correctamente. Redirigiendo...', 'success'); 
      setTimeout(() => { window.location.href = 'login.html'; }, 1500); 
    }) 
    .catch(() => mostrarAlerta('Error al conectar con el servidor.', 'danger')) 
    .finally(() => { 
      btn.disabled = false; 
      btn.textContent = 'Registrarme'; 
    }); 
} 
  
function mostrarAlerta(mensaje, tipo) { 
  document.getElementById('alerta').innerHTML = ` 
    <div class='alert alert-${tipo} alert-dismissible fade show'> 
      ${mensaje} 
      <button type='button' class='btn-close' data-bs-dismiss='alert'></button> 
    </div> 
  `;
}