# Sistema de Control de Agua — HC-SR04 + ESP

Backend REST API para monitoreo de niveles de agua mediante sensores ultrasónicos HC-SR04 conectados a microcontroladores ESP8266.

## Integrantes

Luis Angel Amador 23224026
Erwin Hernandez 22224028

---

## Descripción de los 5 módulos

| Módulo | Descripción |
|---|---|
| **Tanques** | Depósitos físicos monitoreados. Almacena capacidad, ubicación y umbrales de alerta. |
| **Dispositivos** | ESP32/ESP8266 con HC-SR04 registrados en el sistema, asociados a un tanque y usuario. |
| **Mediciones** | Lecturas de nivel de agua enviadas por los sensores. Registra nivel en cm y porcentaje. |
| **Reportes** | Resúmenes estadísticos de nivel de agua por tanque en un rango de fechas. |
| **Usuarios** | Cuentas de acceso con roles admin/usuario. Gestionadas a través de `/api/auth`. |

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/RaijinYamaguchi/ProgramacionWeb
cd ProgramacionWeb
# 2. Instalar dependencias
npm install express mysql2 dotenv cors nodemon 

# 3. Importar la base de datos
mysql -u root -p < database.sql

# 4. Iniciar el servidor
node server.js
```

---

## Endpoints completos

### Autenticación
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| POST | `/api/auth/registro` | Registrar usuario nuevo | No |
| POST | `/api/auth/login` | Iniciar sesión y obtener token | No |

### Inicio
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/api/inicio` | Bienvenida + dato dinámico de BD | Sí |

### Tanques
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/api/tanques` | Listar todos los tanques | No |
| GET | `/api/tanques/:id` | Obtener un tanque | No |
| GET | `/api/tanques/nivel-actual` | Nivel actual por tanque (última medición) | No |
| POST | `/api/tanques` | Crear tanque | Sí |
| PUT | `/api/tanques/:id` | Actualizar tanque | Sí |
| DELETE | `/api/tanques/:id` | Eliminar tanque | Sí |

### Dispositivos
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/api/dispositivos` | Listar todos los dispositivos | No |
| GET | `/api/dispositivos/:id` | Obtener un dispositivo | No |
| GET | `/api/dispositivos/tanque/:tanque_id` | Dispositivos de un tanque | No |
| POST | `/api/dispositivos` | Registrar dispositivo | Sí |
| PUT | `/api/dispositivos/:id` | Actualizar dispositivo | Sí |
| DELETE | `/api/dispositivos/:id` | Eliminar dispositivo | Sí |

### Mediciones
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/api/mediciones` | Listar todas las mediciones | No |
| GET | `/api/mediciones/:id` | Obtener una medición | No |
| GET | `/api/mediciones/dispositivo/:id/ultimas` | Últimas lecturas de un dispositivo (`?limite=N`) | No |
| POST | `/api/mediciones` | Registrar lectura del HC-SR04 | Sí |
| PUT | `/api/mediciones/:id` | Corregir medición | Sí |
| DELETE | `/api/mediciones/:id` | Eliminar medición | Sí |

### Reportes
| Método | Endpoint | Descripción | Auth |
|---------|---------|---------------|-------|
| GET | `/api/reportes` | Listar todos los reportes | No |
| GET | `/api/reportes/:id` | Obtener un reporte | No |
| GET | `/api/reportes/estadisticos?tanque_id=&fecha_inicio=&fecha_fin=` | Calcular estadísticos de un tanque | Sí |
| POST | `/api/reportes` | Crear reporte | Sí |
| PUT | `/api/reportes/:id` | Actualizar título del reporte | Sí |
| DELETE | `/api/reportes/:id` | Eliminar reporte | Sí |

---

## Uso del token

Para rutas protegidas, agregar en los headers de la petición:
```
Authorization: Bearer <token_obtenido_en_login>
```
