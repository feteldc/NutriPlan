# NutriPlan - Planificador de Comidas con IA

## Descripción
NutriPlan es una aplicación web que genera planes de alimentación personalizados utilizando inteligencia artificial. La aplicación analiza las necesidades específicas del usuario (edad, peso, objetivo y alergias) para crear un menú semanal balanceado y adaptado a sus requerimientos.

## Tecnologías Utilizadas

### Frontend
- React + Vite
- TypeScript
- TailwindCSS
- React Router DOM
- HeadlessUI

### Backend
- Node.js
- Express
- TypeScript
- Google Gemini AI

### Base de Datos
- Firebase Firestore

## Estructura de la Base de Datos

```json
{
  "usuarios": {
    "uid123": {
      "datos": {
        "nombre": "string",
        "edad": "number",
        "peso": "number",
        "objetivo": "string",
        "alergias": "string",
        "fechaCreacion": "timestamp"
      },
      "menu": {
        "lunes": {
          "desayuno": "string",
          "almuerzo": "string",
          "cena": "string",
          "snacks": ["string"]
        },
        // ... resto de los días
      }
    }
  }
}
```

## Uso de IA en el Proyecto

La IA (Google Gemini) se utiliza para:
1. Generar menús personalizados basados en:
   - Objetivo del usuario (perder peso, mantener, ganar masa)
   - Edad y peso
   - Alergias y restricciones alimentarias
2. Asegurar que los menús sean:
   - Balanceados nutricionalmente
   - Adaptados al objetivo del usuario
   - Libres de alimentos alérgenos

## Instalación y Ejecución

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
```

2. Configurar el Frontend:
```bash
cd frontend
npm install
npm run dev
```

3. Configurar el Backend:
```bash
cd backend
npm install
# Crear archivo .env con las variables de entorno necesarias
npm run dev
```

4. Configurar Firebase:
   - Crear proyecto en Firebase Console
   - Obtener credenciales de servicio
   - Configurar variables de entorno en backend/.env

## Variables de Entorno

### Backend (.env)
```
PORT=3000
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY=tu-private-key
FIREBASE_CLIENT_EMAIL=tu-client-email
GEMINI_API_KEY=tu-gemini-api-key
```

## API Endpoints

### POST /api/guardarUsuario
Guarda los datos del usuario en Firestore.

### POST /api/generarMenu/:userId
Genera un menú personalizado usando IA y lo guarda en Firestore.

## Contribución
Este proyecto fue desarrollado como parte de una actividad evaluada de Inteligencia Artificial. 