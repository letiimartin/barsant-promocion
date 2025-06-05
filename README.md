# Barsant Promociones - Sitio Web Optimizado

Este proyecto es una versión optimizada y modularizada del sitio web de Barsant Promociones Inmobiliarias.

## Estructura del Proyecto

```
proyecto-barsant/
├── assets/              # Recursos estáticos (imágenes, estilos sin compilar)
├── src/                 # Código fuente
│   ├── js/              # JavaScript modular
│   │   ├── components/  # Componentes reutilizables
│   │   ├── utils/       # Utilidades
│   │   ├── services/    # Servicios (API, reservas)
│   │   ├── main.js      # Entrada página principal
│   │   ├── reservation.js # Entrada página de reserva
│   │   └── auth.js      # Lógica de autenticación
│   └── css/             # Estilos CSS modularizados
│       ├── base/        # Estilos base (reset, variables)
│       └── components/  # Estilos de componentes
├── index.html           # Plantilla principal
├── reserva/             # Plantillas de reserva
├── viviendas/           # Páginas de viviendas
├── legal/               # Páginas legales
├── dist/                # Salida generada por Webpack
├── webpack.config.js    # Configuración de Webpack
└── package.json         # Dependencias y scripts
```

## Características Principales

- **Arquitectura Modular**: Componentes reutilizables con ES6 modules
- **Optimización CSS**: Estilos modularizados con variables CSS 
- **Bundling con Webpack**: Minificación y optimización para producción
- **Responsive Design**: Diseño adaptable a diferentes dispositivos

## Instalación

1. Instalar las dependencias:

```bash
npm install
```

2. Iniciar servidor de desarrollo:

```bash
npm run dev
```

3. Compilar para producción:

```bash
npm run build
```

El directorio `dist/` generado es el que se publica en Netlify.

## Componentes

Los componentes reutilizables se encuentran en `/src/js/components/`:

- **Header**: Navigation principal del sitio
- **Footer**: Pie de página con enlaces e información de contacto
- **PropertyCard**: Tarjeta para mostrar propiedades
- **ReservationSteps**: Pasos del proceso de reserva
- ...y otros.

## Servicios

Los servicios para interactuar con APIs y manejar lógica de negocio:

- **ApiService**: Comunicación con el servidor y obtención de datos
- **ReservationService**: Gestión del proceso de reserva

## Estructura CSS

- **base/**: Contiene reset.css, variables.css para consistencia visual
- **components/**: Estilos específicos de componentes
- **pages/**: Estilos específicos de páginas

## Importar datos a Firestore

La carpeta `data/` debe contener los archivos `viviendas.json`, `cocheras.json` y `trasteros.json`, que no se incluyen en el repositorio. Crea estos archivos localmente para cargarlos en Firestore.

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Una vez definidas, ejecutar:

```bash
node scripts/importData.js
```

