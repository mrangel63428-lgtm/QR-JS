/**
 * Generador de Códigos QR - Aplicación Principal
 * Versión: 1.0.0
 * Autor: Tu nombre
 * Licencia: MIT
 */

// Estado de la aplicación
const appState = {
    qrcode: null,
    currentText: '',
    isGenerated: false
};

// Configuración por defecto
const defaultConfig = {
    size: 256,
    color: '#000000',
    bgColor: '#FFFFFF',
    errorLevel: 'M'
};

// Elementos del DOM
const elements = {
    textInput: document.getElementById('text-input'),
    qrSize: document.getElementById('qr-size'),
    qrColor: document.getElementById('qr-color'),
    bgColor: document.getElementById('bg-color'),
    errorLevel: document.getElementById('error-level'),
    generateBtn: document.getElementById('generate-btn'),
    clearBtn: document.getElementById('clear-btn'),
    downloadBtn: document.getElementById('download-btn'),
    copyLinkBtn: document.getElementById('copy-link-btn'),
    qrCode: document.getElementById('qr-code'),
    qrContainer: document.getElementById('qr-container'),
    qrPlaceholder: document.getElementById('qr-placeholder'),
    downloadSection: document.getElementById('download-section')
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    console.log('🎯 Generador de QR iniciado');
});

/**
 * Inicializa la aplicación
 */
function initializeApp() {
    // Cargar configuración guardada
    loadSavedConfig();
    
    // Establecer valores por defecto
    setDefaultValues();
    
    // Verificar soporte del navegador
    checkBrowserSupport();
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    // Botones principales
    elements.generateBtn.addEventListener('click', generateQR);
    elements.clearBtn.addEventListener('click', clearAll);
    elements.downloadBtn.addEventListener('click', downloadQR);
    elements.copyLinkBtn.addEventListener('click', copyQRLink);

    // Auto-generación en cambios
    elements.qrSize.addEventListener('change', autoRegenerate);
    elements.qrColor.addEventListener('change', autoRegenerate);
    elements.bgColor.addEventListener('change', autoRegenerate);
    elements.errorLevel.addEventListener('change', autoRegenerate);

    // Atajos de teclado
    elements.textInput.addEventListener('keydown', handleKeyboardShortcuts);

    // Guardar configuración al cambiar
    document.querySelectorAll('select, input[type="color"]').forEach(element => {
        element.addEventListener('change', saveConfig);
    });
}

/**
 * Genera el código QR
 */
function generateQR() {
    const text = elements.textInput.value.trim();
    
    if (!validateInput(text)) {
        return;
    }

    // Actualizar estado
    appState.currentText = text;
    appState.isGenerated = true;

    // Limpiar QR anterior
    elements.qrCode.innerHTML = '';

    // Ocultar placeholder
    elements.qrPlaceholder.style.display = 'none';

    // Configuración del QR
    const config = {
        text: text,
        width: parseInt(elements.qrSize.value),
        height: parseInt(elements.qrSize.value),
        colorDark: elements.qrColor.value,
        colorLight: elements.bgColor.value,
        correctLevel: QRCode.CorrectLevel[elements.errorLevel.value]
    };

    try {
        // Generar nuevo QR
        appState.qrcode = new QRCode(elements.qrCode, config);

        // Mostrar controles de descarga
        elements.downloadSection.style.display = 'block';

        // Notificar éxito
        showNotification('✅ Código QR generado exitosamente', 'success');

        // Efecto visual
        addGenerationEffect();

    } catch (error) {
        showNotification('❌ Error al generar el código QR', 'error');
        console.error('Error generando QR:', error);
    }
}

/**
 * Valida el input del usuario
 */
function validateInput(text) {
    if (!text) {
        showNotification('⚠️ Por favor ingresa algún texto o URL', 'warning');
        elements.textInput.focus();
        return false;
    }

    if (text.length > 2000) {
        showNotification('⚠️ El texto es demasiado largo (máx 2000 caracteres)', 'warning');
        return false;
    }

    return true;
}

/**
 * Descarga el código QR como imagen
 */
function downloadQR() {
    const canvas = elements.qrCode.querySelector('canvas');
    
    if (!canvas) {
        showNotification('❌ No hay código QR para descargar', 'error');
        return;
    }

    try {
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        
        link.download = `qr-code-${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('💾 Código QR descargado', 'success');

    } catch (error) {
        showNotification('❌ Error al descargar', 'error');
        console.error('Error descargando:', error);
    }
}

/**
 * Copia el enlace/texto del QR
 */
function copyQRLink() {
    const text = appState.currentText;
    
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        showNotification('📋 Texto copiado al portapapeles', 'success');
    }).catch(() => {
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        showNotification('📋 Texto copiado al portapapeles', 'success');
    });
}

/**
 * Limpia todos los campos
 */
function clearAll() {
    // Limpiar elementos
    elements.textInput.value = '';
    elements.qrCode.innerHTML = '';
    
    // Restablecer configuración
    setDefaultValues();
    
    // Ocultar elementos
    elements.qrPlaceholder.style.display = 'block';
    elements.downloadSection.style.display = 'none';
    
    // Resetear estado
    appState.qrcode = null;
    appState.currentText = '';
    appState.isGenerated = false;
    
    // Limpiar almacenamiento
    localStorage.removeItem('qrGeneratorConfig');
    
    showNotification('🗑️ Todo limpiado', 'info');
    elements.textInput.focus();
}

/**
 * Regenera automáticamente si hay un QR existente
 */
function autoRegenerate() {
    if (appState.isGenerated && appState.currentText) {
        generateQR();
    }
}

/**
 * Maneja los atajos de teclado
 */
function handleKeyboardShortcuts(e) {
    // Ctrl + Enter = Generar
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        generateQR();
    }
    
    // Ctrl + L = Limpiar
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        clearAll();
    }
}

/**
 * Muestra notificaciones temporales
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${getNotificationIcon(type)}</span>
        <span class="notification-text">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Obtiene el icono apropiado para la notificación
 */
function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || '💡';
}

/**
 * Añade efecto visual al generar
 */
function addGenerationEffect() {
    elements.qrContainer.style.transform = 'scale(0.9)';
    elements.qrContainer.style.opacity = '0.5';
    
    setTimeout(() => {
        elements.qrContainer.style.transform = 'scale(1)';
        elements.qrContainer.style.opacity = '1';
    }, 100);
}

/**
 * Establece valores por defecto
 */
function setDefaultValues() {
    elements.qrSize.value = defaultConfig.size;
    elements.qrColor.value = defaultConfig.color;
    elements.bgColor.value = defaultConfig.bgColor;
    elements.errorLevel.value = defaultConfig.errorLevel;
}

/**
 * Guarda la configuración en localStorage
 */
function saveConfig() {
    const config = {
        size: elements.qrSize.value,
        color: elements.qrColor.value,
        bgColor: elements.bgColor.value,
        errorLevel: elements.errorLevel.value,
        timestamp: Date.now()
    };
    
    localStorage.setItem('qrGeneratorConfig', JSON.stringify(config));
}

/**
 * Carga la configuración guardada
 */
function loadSavedConfig() {
    const saved = localStorage.getItem('qrGeneratorConfig');
    
    if (saved) {
        try {
            const config = JSON.parse(saved);
            
            // Aplicar configuración si no es muy antigua (30 días)
            if (Date.now() - config.timestamp < 30 * 24 * 60 * 60 * 1000) {
                elements.qrSize.value = config.size || defaultConfig.size;
                elements.qrColor.value = config.color || defaultConfig.color;
                elements.bgColor.value = config.bgColor || defaultConfig.bgColor;
                elements.errorLevel.value = config.errorLevel || defaultConfig.errorLevel;
            }
        } catch (error) {
            console.warn('Error cargando configuración guardada');
        }
    }
}

/**
 * Verifica el soporte del navegador
 */
function checkBrowserSupport() {
    const features = {
        canvas: !!window.HTMLCanvasElement,
        clipboard: !!navigator.clipboard,
        localStorage: !!window.localStorage,
        qrcode: typeof QRCode !== 'undefined'
    };
    
    const unsupported = Object.entries(features)
        .filter(([_, supported]) => !supported)
        .map(([feature]) => feature);
    
    if (unsupported.length > 0) {
        console.warn('Características no soportadas:', unsupported);
        
        if (!features.qrcode) {
            showNotification('❌ Error: QRCode.js no está disponible', 'error');
        }
    }
}
