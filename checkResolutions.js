// =============================================
// VERIFICADOR DE RESOLUCIÓN DE IMÁGENES
// Ejecutar en consola del navegador
// =============================================

async function checkImageResolutions() {
    console.log('🔍 Verificando resoluciones de todas las imágenes...');
    console.log('');
    
    if (!window.galleryImages || !window.galleryImages.length) {
        console.error('❌ No hay imágenes cargadas. Asegúrate de que la galería esté inicializada.');
        return;
    }
    
    const results = [];
    
    for (let i = 0; i < galleryImages.length; i++) {
        const imagen = galleryImages[i];
        
        try {
            const dimensions = await getImageDimensions(imagen.url);
            const fileSize = await getImageFileSize(imagen.url);
            
            const result = {
                index: i + 1,
                nombre: imagen.nombreDisplay || imagen.nombre,
                width: dimensions.width,
                height: dimensions.height,
                megapixels: ((dimensions.width * dimensions.height) / 1000000).toFixed(2),
                fileSize: fileSize,
                quality: getQualityAssessment(dimensions.width, dimensions.height, fileSize)
            };
            
            results.push(result);
            
            // Log individual
            const qualityEmoji = result.quality === 'Alta' ? '✅' : result.quality === 'Media' ? '⚠️' : '❌';
            console.log(`${qualityEmoji} Imagen ${result.index}: ${result.nombre}`);
            console.log(`   📐 Resolución: ${result.width}x${result.height}px (${result.megapixels}MP)`);
            console.log(`   💾 Tamaño: ${result.fileSize}`);
            console.log(`   🎯 Calidad: ${result.quality}`);
            console.log('');
            
        } catch (error) {
            console.error(`❌ Error verificando imagen ${i + 1}:`, error);
        }
    }
    
    // Resumen final
    console.log('='.repeat(50));
    console.log('📊 RESUMEN DE CALIDADES');
    console.log('='.repeat(50));
    
    const lowQuality = results.filter(r => r.quality === 'Baja');
    const mediumQuality = results.filter(r => r.quality === 'Media');
    const highQuality = results.filter(r => r.quality === 'Alta');
    
    console.log(`✅ Alta calidad: ${highQuality.length} imágenes`);
    console.log(`⚠️ Media calidad: ${mediumQuality.length} imágenes`);
    console.log(`❌ Baja calidad: ${lowQuality.length} imágenes`);
    console.log('');
    
    if (lowQuality.length > 0) {
        console.log('🔴 Imágenes que necesitan mejora:');
        lowQuality.forEach(img => {
            console.log(`   ${img.index}. ${img.nombre} (${img.width}x${img.height}px)`);
        });
        console.log('');
        console.log('💡 Recomendaciones:');
        console.log('   1. Buscar versiones de mayor resolución');
        console.log('   2. Usar herramientas de upscaling con IA');
        console.log('   3. Reemplazar en Firebase Storage');
    }
    
    return results;
}

function getImageDimensions(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight
            });
        };
        img.onerror = reject;
        img.src = url;
    });
}

async function getImageFileSize(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');
        
        if (contentLength) {
            const bytes = parseInt(contentLength);
            if (bytes < 1024) return `${bytes} B`;
            if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
            return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
        }
        
        return 'Desconocido';
    } catch (error) {
        return 'Error';
    }
}

function getQualityAssessment(width, height, fileSize) {
    const pixels = width * height;
    
    // Criterios de calidad basados en resolución
    if (pixels >= 1000000) return 'Alta';      // 1MP+
    if (pixels >= 500000) return 'Media';      // 0.5-1MP
    return 'Baja';                             // <0.5MP
}

// Función para exportar resultados
function exportResults(results) {
    const csv = 'Imagen,Nombre,Ancho,Alto,Megapixels,Tamaño,Calidad\n' +
        results.map(r => `${r.index},"${r.nombre}",${r.width},${r.height},${r.megapixels},"${r.fileSize}",${r.quality}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resolucion_imagenes.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Auto-ejecutar
console.log('🚀 Para verificar resoluciones, ejecuta: checkImageResolutions()');
console.log('📊 Para exportar resultados a CSV: exportResults(resultados)');

// Hacer funciones globales
window.checkImageResolutions = checkImageResolutions;
window.exportResults = exportResults;