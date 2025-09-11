// ========================
// SISTEMA DE MAPA CORREGIDO CON DEBUG
// ========================

// Declarar initMap globalmente
window.initMap = function() {
    console.log('🗺️ Callback de Google Maps ejecutado');
    initializeMap();
  };
  
  document.addEventListener("DOMContentLoaded", function () {
    console.log('🗺️ Inicializando sistema de mapa...');
    
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
                // Reemplazar el HTML del mapa con versión corregida
                placeholder.innerHTML = getMapHTML();
                console.log('✅ HTML del mapa cargado correctamente');
                
                // Verificar si Google Maps ya está disponible
                if (typeof google !== 'undefined' && google.maps) {
                    initializeMap();
                } else {
                    console.log('⏳ Esperando a que Google Maps se cargue...');
                    // Mostrar mapa de respaldo mientras tanto
                    showFallbackMapImmediate();
                }
            } else {
                console.error("No se encontró el div con id 'map-placeholder'");
            }
        })
        .catch(error => {
            console.error("Error al cargar map.html:", error);
            showFallbackMapImmediate();
        });
  });
  
  // Función que genera el HTML correcto del mapa
  function getMapHTML() {
      return `
          <section class="map-section" id="location">
              <div class="container">
                  <h2 class="section-title">Ubicación</h2>
                  <p class="description">Situado en Calle Ventanilla, en el corazón de Granada, cerca de la Alhambra y con acceso a servicios esenciales como colegios, transporte público y comercios.</p>
                  
                  <!-- Contenedor principal del mapa -->
                  <div id="map-container" style="
                      height: 500px; 
                      width: 100%; 
                      border-radius: 8px; 
                      overflow: hidden; 
                      box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
                      margin-top: 30px;
                      background: #f5f5f5;
                      position: relative;
                  ">
                      <!-- El mapa de Google se cargará aquí -->
                      <div id="map-loading" style="
                          position: absolute;
                          top: 50%;
                          left: 50%;
                          transform: translate(-50%, -50%);
                          text-align: center;
                          color: #666;
                      ">
                          <div style="
                              width: 40px; 
                              height: 40px; 
                              border: 4px solid #f3f3f3; 
                              border-top: 4px solid #e0c88c; 
                              border-radius: 50%; 
                              animation: spin 1s linear infinite;
                              margin: 0 auto 15px;
                          "></div>
                          <p>Cargando mapa...</p>
                      </div>
                  </div>
                  
                  <!-- Enlaces de Google Maps siempre visibles -->
                  <div style="
                      margin-top: 20px; 
                      text-align: center; 
                      display: flex; 
                      gap: 15px; 
                      justify-content: center; 
                      flex-wrap: wrap;
                  ">
                      <a href="https://www.google.com/maps/place/Calle+Ventanilla,+Granada,+España/@37.182258,-3.603283,17z" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         style="
                             background: #e0c88c; 
                             color: #3a3a3a; 
                             padding: 12px 24px; 
                             border-radius: 6px; 
                             text-decoration: none; 
                             font-weight: 600;
                             display: inline-flex;
                             align-items: center;
                             gap: 8px;
                             transition: all 0.3s ease;
                             border: 2px solid #e0c88c;
                         "
                         onmouseover="this.style.background='#3a3a3a'; this.style.color='white';"
                         onmouseout="this.style.background='#e0c88c'; this.style.color='#3a3a3a';">
                          <i class="fas fa-external-link-alt"></i>
                          Ver en Google Maps
                      </a>
                      <a href="https://www.google.com/maps/dir/?api=1&destination=37.182258,-3.603283" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         style="
                             background: #3a3a3a; 
                             color: white; 
                             padding: 12px 24px; 
                             border-radius: 6px; 
                             text-decoration: none; 
                             font-weight: 600;
                             display: inline-flex;
                             align-items: center;
                             gap: 8px;
                             transition: all 0.3s ease;
                             border: 2px solid #3a3a3a;
                         "
                         onmouseover="this.style.background='#e0c88c'; this.style.color='#3a3a3a'; this.style.borderColor='#e0c88c';"
                         onmouseout="this.style.background='#3a3a3a'; this.style.color='white'; this.style.borderColor='#3a3a3a';">
                          <i class="fas fa-route"></i>
                          Cómo llegar
                      </a>
                  </div>
                  
                 
              </div>
          </section>
          
          <style>
              @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
              }
          </style>
      `;
  }
  
  function initializeMap() {
    console.log('🎯 Inicializando mapa de Google...');
    
    try {
        // Verificar que Google Maps esté disponible
        if (typeof google === 'undefined' || !google.maps) {
            console.error('Google Maps no está disponible');
            showFallbackMapImmediate();
            return;
        }
        
        // Buscar el contenedor del mapa
        const mapContainer = document.getElementById('map-container');
        
        if (!mapContainer) {
            console.error('No se encontró #map-container');
            showFallbackMapImmediate();
            return;
        }
        
        console.log('✅ Contenedor del mapa encontrado');
        
        // Limpiar el loading
        mapContainer.innerHTML = '';
        
        // COORDENADAS EXACTAS DE CALLE VENTANILLA, GRANADA
        const ventanillaLocation = { 
            lat: 37.182258, 
            lng: -3.603283 
        };
        
        // Configuración del mapa
        const mapOptions = {
            zoom: 18,
            center: ventanillaLocation,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            rotateControl: true,
            fullscreenControl: true
        };
        
        // Crear el mapa
        const map = new google.maps.Map(mapContainer, mapOptions);
        
        // Crear marcador
        const marker = new google.maps.Marker({
            position: ventanillaLocation,
            map: map,
            title: 'Residencial Ángel Ganivet - Calle Ventanilla, Granada',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="50" height="60" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25 0C11.2 0 0 11.2 0 25c0 13.8 25 35 25 35s25-21.2 25-35C50 11.2 38.8 0 25 0z" fill="#e0c88c" stroke="#3a3a3a" stroke-width="2"/>
                        <circle cx="25" cy="25" r="12" fill="#3a3a3a"/>
                        <circle cx="25" cy="25" r="6" fill="white"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(50, 60),
                anchor: new google.maps.Point(25, 60)
            },
            animation: google.maps.Animation.DROP
        });
        
        // Info window con enlaces funcionales
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 15px; max-width: 300px; font-family: Arial, sans-serif;">
                    <h3 style="margin: 0 0 10px 0; color: #3a3a3a; font-size: 18px;">
                        Residencial Ángel Ganivet
                    </h3>
                    <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                        <strong>📍</strong> Calle Ventanilla, s/n<br>
                        Granada, España
                    </p>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">
                        <strong>🏘️</strong> 33 viviendas exclusivas
                    </p>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button onclick="window.open('https://www.google.com/maps/place/Calle+Ventanilla,+Granada,+España/@37.182258,-3.603283,17z', '_blank')" 
                                style="
                                    background: #e0c88c; 
                                    color: #3a3a3a; 
                                    border: none;
                                    padding: 8px 12px; 
                                    border-radius: 4px; 
                                    font-size: 12px; 
                                    cursor: pointer;
                                    font-weight: 500;
                                ">
                            🗺️ Google Maps
                        </button>
                        <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=37.182258,-3.603283', '_blank')" 
                                style="
                                    background: #3a3a3a; 
                                    color: white; 
                                    border: none;
                                    padding: 8px 12px; 
                                    border-radius: 4px; 
                                    font-size: 12px; 
                                    cursor: pointer;
                                    font-weight: 500;
                                ">
                            🧭 Direcciones
                        </button>
                    </div>
                </div>
            `
        });
        
        // Eventos del marcador
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        // Doble click para ir a Google Maps
        marker.addListener('dblclick', () => {
            window.open('https://www.google.com/maps/place/Calle+Ventanilla,+Granada,+España/@37.182258,-3.603283,17z', '_blank');
        });
        
        // Abrir info window automáticamente
        setTimeout(() => {
            infoWindow.open(map, marker);
        }, 1000);
        
        console.log('✅ Mapa de Google inicializado correctamente');
        
    } catch (error) {
        console.error('Error inicializando Google Maps:', error);
        showFallbackMapImmediate();
    }
  }
  
  function showFallbackMapImmediate() {
    console.log('📍 Mostrando mapa de respaldo inmediato...');
    
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div style="
                height: 100%; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
            ">
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-map-marker-alt" style="font-size: 4rem; color: #e0c88c; margin-bottom: 20px;"></i>
                    <h4 style="color: #3a3a3a; margin-bottom: 15px;">Calle Ventanilla, Granada</h4>
                    <p style="color: #666; margin-bottom: 20px;">Mapa no disponible</p>
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <a href="https://www.google.com/maps/place/Calle+Ventanilla,+Granada,+España/@37.182258,-3.603283,17z" 
                           target="_blank" 
                           style="
                               background: #e0c88c; 
                               color: #3a3a3a; 
                               padding: 10px 16px; 
                               border-radius: 6px; 
                               text-decoration: none; 
                               font-weight: 500;
                               font-size: 14px;
                           ">
                            Ver en Google Maps
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
  }
  
  // Función de respaldo completo
  function showFallbackMap() {
    const placeholder = document.getElementById('map-placeholder');
    if (placeholder) {
        placeholder.innerHTML = getMapHTML().replace('#map-container', '#map-container-fallback');
        showFallbackMapImmediate();
    }
  }