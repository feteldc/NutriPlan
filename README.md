# NutriPlan - Planificador de Comidas con IA

## Descripción
NutriPlan es una aplicación web que genera planes de alimentación personalizados utilizando inteligencia artificial. La aplicación analiza las necesidades específicas del usuario (edad, peso, objetivo y alergias) para crear un menú semanal balanceado y adaptado a sus requerimientos.

## Tecnologías Utilizadas

### Frontend
- React 18.2.0
- Vite 5.1.6
- TypeScript 5.2.2
- TailwindCSS 3.4.1
- React Router DOM 6.22.3
- Firebase 11.9.1

### Backend
- Node.js
- Express 4.18.3
- Firebase Admin SDK 12.0.0
- CORS 2.8.5
- dotenv 16.4.5

### Base de Datos
- Firebase Firestore

## Estructura del Proyecto

```
nutriplan/
├── frontend/           # Aplicación React + Vite
│   ├── src/           # Código fuente del frontend
│   ├── public/        # Archivos estáticos
│   └── package.json   # Dependencias del frontend
│
└── backend/           # Servidor Express
    ├── src/          # Código fuente del backend
    └── package.json  # Dependencias del backend
```

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

## Variables de Entorno

### Backend (.env)
```
PORT=3000
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY=tu-private-key
FIREBASE_CLIENT_EMAIL=tu-client-email
```

## Scripts Disponibles

### Frontend
- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Compila el proyecto para producción
- `npm run preview`: Vista previa de la versión de producción
- `npm run lint`: Ejecuta el linter

### Backend
- `npm run dev`: Inicia el servidor en modo desarrollo
- `npm start`: Inicia el servidor en modo producción

## API Endpoints

### POST /api/guardarUsuario
Guarda los datos del usuario en Firestore.

### POST /api/generarMenu/:userId
Genera un menú personalizado usando IA y lo guarda en Firestore.

## Contribución
Este proyecto fue desarrollado como parte de una actividad evaluada de Inteligencia Artificial. 