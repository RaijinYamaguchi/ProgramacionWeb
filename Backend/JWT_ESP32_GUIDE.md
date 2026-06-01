/*
 * ============================================================
 * DOCUMENTACIÓN: JWT SECUNDARIO PARA DISPOSITIVOS ESP32
 * ============================================================
 * 
 * Este sistema permite generar tokens JWT de larga duración
 * (1 año) para que los dispositivos ESP32 se conecten al
 * backend de forma segura sin necesidad de credenciales.
 * 
 * ============================================================
 * ENDPOINTS DISPONIBLES
 * ============================================================
 * 
 * 1. GENERAR TOKEN (Usuario)
 *    POST /api/auth/dispositivos/token/generar
 *    Headers:
 *      - Authorization: Bearer <token_usuario>
 *      - Content-Type: application/json
 *    Body:
 *      {
 *        "dispositivo_id": 1,
 *        "descripcion": "ESP32-Tanque-Principal" (opcional)
 *      }
 *    Response:
 *      {
 *        "mensaje": "Token generado correctamente",
 *        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *        "dispositivo_id": 1,
 *        "dispositivo_nombre": "Sensor-1",
 *        "expires_at": "2027-05-31T12:00:00.000Z",
 *        "duracion": "1 año"
 *      }
 * 
 * 2. LISTAR TOKENS (Usuario)
 *    GET /api/auth/dispositivos/tokens
 *    Headers:
 *      - Authorization: Bearer <token_usuario>
 *    Response:
 *      [
 *        {
 *          "id": 1,
 *          "dispositivo_id": 1,
 *          "descripcion": "ESP32-Tanque-Principal",
 *          "activo": 1,
 *          "expires_at": "2027-05-31T12:00:00.000Z",
 *          "creado_en": "2026-05-31T12:00:00.000Z",
 *          "ultimo_uso": "2026-05-31T14:30:00.000Z",
 *          "dispositivo_nombre": "Sensor-1",
 *          "tanque_nombre": "Tanque Principal"
 *        }
 *      ]
 * 
 * 3. DESACTIVAR TOKEN (Usuario)
 *    DELETE /api/auth/dispositivos/token/:token_id
 *    Headers:
 *      - Authorization: Bearer <token_usuario>
 *    Response:
 *      {
 *        "mensaje": "Token desactivado correctamente"
 *      }
 * 
 * 4. VERIFICAR TOKEN (ESP32 - Sin autenticación)
 *    GET /api/auth/dispositivos/token/verificar
 *    Headers:
 *      - Authorization: Bearer <token_dispositivo>
 *    Response:
 *      {
 *        "valido": true,
 *        "dispositivo_id": 1,
 *        "dispositivo_nombre": "ESP32-Tanque-Principal",
 *        "expires_at": "2027-05-31T12:00:00.000Z"
 *      }
 * 
 * ============================================================
 * EJEMPLO DE USO CON ESP32 (Arduino)
 * ============================================================
 * 
 * #include <WiFi.h>
 * #include <HTTPClient.h>
 * #include <ArduinoJson.h>
 * 
 * const char* ssid = "TU_WIFI";
 * const char* password = "TU_CONTRASEÑA";
 * const char* serverUrl = "http://192.168.1.100:3000/api";
 * const char* deviceToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Token generado
 * 
 * void setup() {
 *   Serial.begin(115200);
 *   WiFi.begin(ssid, password);
 *   
 *   while (WiFi.status() != WL_CONNECTED) {
 *     delay(500);
 *     Serial.print(".");
 *   }
 *   Serial.println("Conectado al WiFi");
 * }
 * 
 * void enviarMedicion(float nivel, float temperatura, float humedad) {
 *   HTTPClient http;
 *   
 *   // Crear JSON
 *   StaticJsonDocument<200> doc;
 *   doc["dispositivo_id"] = 1;
 *   doc["nivel_agua"] = nivel;

 *   
 *   String jsonString;
 *   serializeJson(doc, jsonString);
 *   
 *   // Enviar POST
 *   http.begin(serverUrl + String("/mediciones"));
 *   http.addHeader("Content-Type", "application/json");
 *   http.addHeader("Authorization", "Bearer " + String(deviceToken));
 *   
 *   int httpCode = http.POST(jsonString);
 *   
 *   if (httpCode == 201 || httpCode == 200) {
 *     Serial.println("Medición enviada correctamente");
 *   } else {
 *     Serial.print("Error: ");
 *     Serial.println(httpCode);
 *   }
 *   
 *   http.end();
 * }
 * 
 * void loop() {
 *   // Leer sensores
 *   float nivel = analogRead(A0);      // HC-SR04
 *   float temperatura = 25.5;           // DHT22
 *   float humedad = 65.2;               // DHT22
 *   
 *   // Enviar cada 5 minutos
 *   enviarMedicion(nivel, temperatura, humedad);
 *   delay(300000); // 5 minutos
 * }
 * 
 * ============================================================
 * CARACTERÍSTICAS DE SEGURIDAD
 * ============================================================
 * 
 * ✓ Tokens con duración de 1 año
 * ✓ Almacenamiento en BD para auditoría
 * ✓ Seguimiento de último uso
 * ✓ Posibilidad de desactivar tokens sin esperar expiración
 * ✓ Validación de permisos (cada usuario solo ve sus tokens)
 * ✓ JWT firmado con JWT_SECRET
 * ✓ Expiración automática verificada en BD
 * 
 * ============================================================
 * FLUJO COMPLETO
 * ============================================================
 * 
 * 1. Usuario inicia sesión en el portal web
 *    POST /api/auth/login
 *    → Recibe token de usuario
 * 
 * 2. Usuario genera token para su ESP32
 *    POST /api/auth/dispositivos/token/generar
 *    Headers: Authorization: Bearer <token_usuario>
 *    → Recibe token_dispositivo
 * 
 * 3. ESP32 usa el token para enviar datos
 *    POST /api/mediciones
 *    Headers: Authorization: Bearer <token_dispositivo>
 *    → Datos almacenados en la BD
 * 
 * 4. (Opcional) Usuario revisa tokens activos
 *    GET /api/auth/dispositivos/tokens
 *    Headers: Authorization: Bearer <token_usuario>
 * 
 * 5. (Opcional) Usuario desactiva un token
 *    DELETE /api/auth/dispositivos/token/:token_id
 *    Headers: Authorization: Bearer <token_usuario>
 * 
 * ============================================================
 */
