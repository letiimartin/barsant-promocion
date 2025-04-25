# Barsant Promociones - Sitio Web Optimizado

Este proyecto es una versión optimizada y modularizada del sitio web de Barsant Promociones Inmobiliarias.

## Estructura del Proyecto

```
proyecto-barsant/
├── src/                 # Código fuente
│   ├── js/              # JavaScript modular
│   │   ├── components/  # Componentes reutilizables
│   │   ├── utils/       # Utilidades
│   │   ├── services/    # Servicios (API, reservas)
│   │   ├── main.js      # Punto de entrada para la página principal
│   │   └── reservation.js # Punto de entrada para la página de reserva
│   └── css/             # Estilos CSS modularizados
│       ├── base/        # Estilos base (reset, variables)
│       ├── components/  # Estilos de componentes
│       └── pages/       # Estilos específicos de página
├── public/              # Archivos públicos estáticos
│   ├── index.html       # Página principal
│   ├── reserva/         # Página de reserva
│   ├── viviendas/       # Páginas de viviendas
│   ├── legal/           # Páginas legales
│   └── assets/          # Recursos (imágenes, fuentes)
├── dist/                # Carpeta generada por Webpack (producción)
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
