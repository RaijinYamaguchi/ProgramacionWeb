#!/bin/bash
# Ejemplos de uso con cURL para los endpoints de JWT para ESP32
# Reemplazar los valores entre < > con los tuyos

API_URL="http://localhost:3000/api"
USER_TOKEN="tu_token_de_usuario_aqui"
DISPOSITIVO_ID=1

# ============================================================
# 1. GENERAR NUEVO TOKEN PARA DISPOSITIVO
# ============================================================
echo "1. Generando token para dispositivo..."
curl -X POST "$API_URL/auth/dispositivos/token/generar" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dispositivo_id": '$DISPOSITIVO_ID',
    "descripcion": "ESP32-Sensor-Principal"
  }' | jq .

# Guardar el token devuelto en una variable
DEVICE_TOKEN=$(curl -s -X POST "$API_URL/auth/dispositivos/token/generar" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dispositivo_id": '$DISPOSITIVO_ID',
    "descripcion": "ESP32-Sensor-Backup"
  }' | jq -r '.token')

echo "Token generado: $DEVICE_TOKEN"

# ============================================================
# 2. LISTAR TODOS LOS TOKENS DEL USUARIO
# ============================================================
echo -e "\n2. Listando tokens activos..."
curl -X GET "$API_URL/auth/dispositivos/tokens" \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

# ============================================================
# 3. VERIFICAR VALIDEZ DE UN TOKEN (Uso del ESP32)
# ============================================================
echo -e "\n3. Verificando token del dispositivo..."
curl -X GET "$API_URL/auth/dispositivos/token/verificar" \
  -H "Authorization: Bearer $DEVICE_TOKEN" | jq .

# ============================================================
# 4. ENVIAR MEDICIÓN CON TOKEN DE DISPOSITIVO
# ============================================================
echo -e "\n4. Enviando medición con token de dispositivo..."
curl -X POST "$API_URL/mediciones" \
  -H "Authorization: Bearer $DEVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dispositivo_id": '$DISPOSITIVO_ID',
    "nivel_agua": 150.5,
    "temperatura": 25.3,
    "humedad": 65.2,
    "porcentaje": 75
  }' | jq .

# ============================================================
# 5. DESACTIVAR UN TOKEN
# ============================================================
echo -e "\n5. Desactivando token (requiere el ID del token, no el token en sí)..."
# Primero obtener el ID del token más reciente
TOKEN_ID=$(curl -s -X GET "$API_URL/auth/dispositivos/tokens" \
  -H "Authorization: Bearer $USER_TOKEN" | jq -r '.[0].id')

echo "Desactivando token con ID: $TOKEN_ID"
curl -X DELETE "$API_URL/auth/dispositivos/token/$TOKEN_ID" \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

# ============================================================
# 6. VERIFICAR QUE EL TOKEN ESTÁ INACTIVO
# ============================================================
echo -e "\n6. Intentando usar token desactivado (debe fallar)..."
curl -X GET "$API_URL/auth/dispositivos/token/verificar" \
  -H "Authorization: Bearer $DEVICE_TOKEN" | jq .
