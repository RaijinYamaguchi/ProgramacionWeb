const API = 'http://127.0.0.1:3000/api/auth'; 
  
function login() { 
  const email    = document.getElementById('inputEmail').value.trim(); 
  const password = document.getElementById('inputPassword').value.trim(); 
  const btn      = document.getElementById('btnLogin'); 
  
  // 1. Validar que los campos no esten vacios 
  if (!email || !password) { 
    mostrarAlerta('Email y password son requeridos.', 'warning'); 
    return; 
  } 
  
  // 2. Deshabilitar el botón para evitar doble envio 
  btn.disabled = true; 
  btn.textContent = 'Ingresando...'; 
  
  // 3. Hacer la peticion POST al backend 
  fetch(`${API}/login`, { 
    method:  'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body:    JSON.stringify({ email, password }) 
  }) 
    .then(res => res.json()) 
    .then(data => { 
      // 4. Si las credenciales son incorrectas, mostrar error 
      if (data.mensaje === 'Credenciales incorrectas') { 
        mostrarAlerta(data.mensaje, 'danger'); 
        return; 
      } 
  
      // 5. Guardar token y nombre en sessionStorage 
      sessionStorage.setItem('token',  data.token); 
      sessionStorage.setItem('nombre', data.nombre); 
  
      // 6. Redirigir a la pagina de inicio 
      window.location.href = 'inicio.html'; 
    }) 
    .catch(() => mostrarAlerta('Error al conectar con el servidor.', 'danger')) 
    .finally(() => { 
      btn.disabled = false; 
      btn.textContent = 'Ingresar'; 
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
