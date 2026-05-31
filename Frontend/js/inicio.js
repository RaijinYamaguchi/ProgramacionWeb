const API    = 'http://127.0.0.1:3000/api'; 
const token  = sessionStorage.getItem('token'); 
const nombre = sessionStorage.getItem('nombre'); 
  
// 1. Verificar sesión al cargar la pagina 
//    Si no hay token, redirigir al login inmediatamente 
if (!token) { 
  window.location.href = 'login.html'; 
} 
  
// 2. Mostrar el nombre en el navbar 
document.getElementById('nombreUsuario').textContent = nombre || ''; 
  console.log('jwt token:', token); 
// 3. Cargar los datos de la página de inicio 
function cargarInicio() { 
  fetch(`${API}/inicio`, { 
    headers: { 
      'Authorization': `Bearer ${token}`  // enviar el token en el header 
    } 
  }) 
    .then(res => { 
      // 4. Si el token expiro, redirigir al login 
      if (res.status === 401) { 
        sessionStorage.clear(); 
        window.location.href = 'login.html'; 
        return; 
      } 
      return res.json(); 
    }) 
    .then(data => { 
      if (!data) return; 
      console.log('Datos recibidos del backend:', data);
      // 5. Ocultar spinner y mostrar contenido 
      document.getElementById('spinner').classList.add('d-none'); 
      document.getElementById('contenido').classList.remove('d-none'); 
  
      // 6. Llenar el titulo y la fecha 
      document.getElementById('tituloBienvenida').textContent = 
        `Bienvenido, ${nombre}`; 
      document.getElementById('fechaHora').textContent = 
        new Date(data.fecha_servidor).toLocaleDateString('es-MX', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        }); 
      console.log('Fecha formateada:', document.getElementById('fechaHora').textContent);
      // 7. Crear tarjetas por cada modulo 
      const contenedor = document.getElementById('tarjetasMódulos'); 
      contenedor.innerHTML = ''; 
      data.modulos.forEach(modulo => { 
        contenedor.innerHTML += ` 
          <div class='col-md-4'> 
            <div class='card shadow-sm h-100'> 
              <div class='card-body'> 
                <h5 class='card-title fw-bold text-capitalize'>${modulo}</h5> 
                <a href='${modulo}.html' class='btn btn-primary btn-sm'> 
                  Ir al modulo 
                </a> 
              </div> 
            </div> 
          </div> 
        `; 
      }); 
      console.log('Módulos mostrados:', data.modulos);
      // 8. Mostrar datos del resumen si existen 
      if (data.estadisticas) { 
        Object.keys(data.estadisticas).forEach(key => { 
          contenedor.innerHTML += ` 
            <div class='col-md-4'> 
              <div class='card border-primary shadow-sm h-100'> 
                <div class='card-body text-center'> 
                  <h1 class='display-4 fw-bold text-primary'>${data.estadisticas[key]}</h1> 
                  <p class='text-muted text-capitalize'>${key.replace(/_/g, ' ')}</p> 
                </div> 
              </div> 
            </div> 
          `; 
        }); 
      } 
    }) 
    .catch(() => { 
      document.getElementById('spinner').classList.add('d-none'); 
      mostrarAlerta('Error al cargar. Verifica que el servidor este corriendo.', 'danger'); 
    }); 
} 
  
// 9. Cerrar sesión 
function cerrarSesión() { 
  if (!confirm('Seguro que deseas cerrar sesión?')) return; 
  sessionStorage.clear();  // elimina token y nombre 
  window.location.href = 'login.html'; 
} 
  
function mostrarAlerta(mensaje, tipo) { 
  document.getElementById('alerta').innerHTML = ` 
    <div class='alert alert-${tipo} alert-dismissible fade show'> 
      ${mensaje} 
      <button type='button' class='btn-close' data-bs-dismiss='alert'></button> 
    </div> 
  `; 
} 
  
cargarInicio(); 