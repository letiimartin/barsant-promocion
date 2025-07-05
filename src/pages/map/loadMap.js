/* document.addEventListener("DOMContentLoaded", () => {
    fetch('src/pages/map/map.html')
    .then(response => {
      if (!response.ok) {
          throw new Error("No se pudo cargar el mapa " + response.status);
      }
      return response.text();
      })
      .then(data => {
        const container = document.getElementById('map-placeholder');
        if (container) container.innerHTML = data;
      })
      .catch(err => console.error("Error al cargar map.html:", err));
  }); */

  document.addEventListener("DOMContentLoaded", function () {
    console.log('🗺️ Inicializando mapa...');
    
    fetch('src/pages/map/map.html')
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el mapa: " + response.status);
            }
            return response.text();
        })
        .then(data => {
            const placeholder = document.getElementById('map-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
                console.log('✅ HTML del mapa cargado');
                
                // Verificar si Google Maps ya está disponible
                if (typeof google !== 'undefined' && google.maps) {
                    initializeMap();
                } else {
                    console.log('⏳ Esperando a que Google Maps se cargue...');
                    // Google Maps se inicializará cuando el script termine de cargar
                }
            } else {
                console.error("No se encontró el div con id 'map-placeholder'");
            }
        })
        .catch(error => {
            console.error("Error al cargar map.html:", error);
            showFallbackMap();
        });
});

// Esta función será llamada por el callback de Google Maps
function initMap() {
    console.log('🗺️ Callback de Google Maps ejecutado');
    initializeMap();
}

function initializeMap() {
    console.log('🎯 Inicializando mapa de Google...');
    
    try {
        // Verificar que Google Maps esté disponible
        if (typeof google === 'undefined' || !google.maps) {
            console.error('Google Maps no está disponible');
            showFallbackMap();
            return;
        }
        
        // Coordenadas del proyecto Ventanilla en Granada
        const projectLocation = { lat: 37.1773, lng: -3.5986 }; // Coordenadas aproximadas de Granada
        
        // Verificar que el contenedor del mapa existe
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('No se encontró el contenedor del mapa');
            return;
        }
        
        // Configuración del mapa
        const mapOptions = {
            zoom: 15,
            center: projectLocation,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
                {
                    "featureType": "all",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "weight": "2.00"
                        }
                    ]
                },
                {
                    "featureType": "all",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "color": "#9c9c9c"
                        }
                    ]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.text",
                    "stylers": [
                        {
                            "visibility": "on"
                        }
                    ]
                },
                {
                    "featureType": "landscape",
                    "elementType": "all",
                    "stylers": [
                        {
                            "color": "#f2f2f2"
                        }
                    ]
                },
                {
                    "featureType": "landscape",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#ffffff"
                        }
                    ]
                },
                {
                    "featureType": "landscape.man_made",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#ffffff"
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "all",
                    "stylers": [
                        {
                            "saturation": -100
                        },
                        {
                            "lightness": 45
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#eeeeee"
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "labels.text.fill",
                    "stylers": [
                        {
                            "color": "#7b7b7b"
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "labels.text.stroke",
                    "stylers": [
                        {
                            "color": "#ffffff"
                        }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "simplified"
                        }
                    ]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "labels.icon",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "transit",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "all",
                    "stylers": [
                        {
                            "color": "#46bcec"
                        },
                        {
                            "visibility": "on"
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#c8d7d4"
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "labels.text.fill",
                    "stylers": [
                        {
                            "color": "#070707"
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "labels.text.stroke",
                    "stylers": [
                        {
                            "color": "#ffffff"
                        }
                    ]
                }
            ]
        };
        
        // Crear el mapa
        const map = new google.maps.Map(mapContainer, mapOptions);
        
        // Crear marcador personalizado
        const marker = new google.maps.Marker({
            position: projectLocation,
            map: map,
            title: 'Ventanilla - Barsant Promociones',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="#e0c88c" stroke="#3a3a3a" stroke-width="2"/>
                        <circle cx="20" cy="20" r="8" fill="#3a3a3a"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20)
            }
        });
        
        // Info window con información del proyecto
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; max-width: 250px;">
                    <h3 style="margin: 0 0 10px 0; color: #3a3a3a; font-size: 16px;">Ventanilla</h3>
                    <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                        33 viviendas exclusivas en Granada
                    </p>
                    <p style="margin: 0; color: #666; font-size: 12px;">
                        <strong>Barsant Promociones Inmobiliarias</strong>
                    </p>
                </div>
            `
        });
        
        // Mostrar info window al hacer click en el marcador
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        // Mostrar info window por defecto
        infoWindow.open(map, marker);
        
        console.log('✅ Mapa de Google inicializado correctamente');
        
    } catch (error) {
        console.error('Error inicializando Google Maps:', error);
        showFallbackMap();
    }
}

function showFallbackMap() {
    console.log('📍 Mostrando mapa de respaldo...');
    
    const placeholder = document.getElementById('map-placeholder');
    if (placeholder) {
        placeholder.innerHTML = `
            <section id="map" class="section bg-light">
                <div class="container">
                    <div class="text-center mb-5">
                        <h2 class="section-title">Ubicación</h2>
                        <p class="section-subtitle">Encuentra Ventanilla en Granada</p>
                    </div>
                    <div class="row">
                        <div class="col-lg-8">
                            <div id="map" style="height: 400px; background-color: #f0f0f0; border: 1px solid #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                <div style="text-align: center; color: #666;">
                                    <i class="fas fa-map-marker-alt" style="font-size: 2rem; margin-bottom: 10px; color: #e0c88c;"></i>
                                    <p>Mapa no disponible</p>
                                    <p style="font-size: 14px;">Granada, España</p>
                                    <a href="https://maps.google.com/?q=Granada,España" target="_blank" style="color: #e0c88c; text-decoration: none;">
                                        Ver en Google Maps →
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-4">
                            <div class="location-info" style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                <h4 style="margin-bottom: 20px; color: #3a3a3a;">Información de Ubicación</h4>
                                <div style="margin-bottom: 15px;">
                                    <i class="fas fa-map-marker-alt" style="color: #e0c88c; margin-right: 10px;"></i>
                                    <span>Granada, España</span>
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <i class="fas fa-home" style="color: #e0c88c; margin-right: 10px;"></i>
                                    <span>33 viviendas exclusivas</span>
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <i class="fas fa-phone" style="color: #e0c88c; margin-right: 10px;"></i>
                                    <span>Contacta para más información</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }
}

// Hacer la función global para que Google Maps pueda llamarla
window.initMap = initMap;