import React, { useState, useEffect } from 'react';
import { usePWA } from '../utils/pwa';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'button' | 'banner' | 'modal';
}

const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '', 
  variant = 'button' 
}) => {
  const { 
    canInstall, 
    isInstalled, 
    isStandalone, 
    platform,
    isOnline,
    showInstallPrompt 
  } = usePWA();

  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Mostrar banner después de un tiempo si puede instalar
    if (canInstall && !isInstalled && variant === 'banner') {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 10000); // Mostrar después de 10 segundos

      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled, variant]);

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const success = await showInstallPrompt();
      if (success) {
        setShowBanner(false);
      }
    } catch (error) {
      console.error('Error instalando PWA:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  // No mostrar nada si ya está instalado
  if (isInstalled || isStandalone) {
    return null;
  }

  // No mostrar si no puede instalar
  if (!canInstall) {
    return null;
  }

  // Variante Button
  if (variant === 'button') {
    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`
          flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 
          text-white rounded-lg font-medium transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {isInstalling ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Instalando...</span>
          </>
        ) : (
          <>
            <span className="text-lg">📱</span>
            <span>Instalar App</span>
          </>
        )}
      </button>
    );
  }

  // Variante Banner
  if (variant === 'banner' && showBanner) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 z-50 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📱</span>
            <div>
              <h3 className="font-semibold text-lg">¡Instala GEB en tu dispositivo!</h3>
              <p className="text-sm opacity-90">
                Acceso rápido, funciona offline, experiencia nativa en {platform}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isInstalling ? 'Instalando...' : 'Instalar'}
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="px-4 py-2 border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
            >
              Después
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Variante Modal
  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
          <div className="text-center">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Instalar GEB App
            </h2>
            <p className="text-gray-600 mb-6">
              Obtén acceso rápido a GEB desde tu escritorio o pantalla de inicio. 
              Funciona offline y se siente como una aplicación nativa.
            </p>
            
            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-center gap-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Acceso directo desde escritorio</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Funciona sin conexión a internet</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Notificaciones en tiempo real</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm">Experiencia más rápida</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowBanner(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isInstalling ? 'Instalando...' : 'Instalar App'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Componente de estado offline
export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();
  
  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-40">
      <span className="text-lg">📵</span>
      <span className="text-sm font-medium">Modo Offline</span>
    </div>
  );
};

// Componente de información PWA para settings
export const PWAInfo: React.FC = () => {
  const { 
    isInstalled, 
    isStandalone, 
    platform,
    isOnline,
    clearCache,
    getCacheInfo 
  } = usePWA();
  
  const [cacheInfo, setCacheInfo] = useState<{size: number, entries: number} | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    getCacheInfo().then(setCacheInfo);
  }, [getCacheInfo]);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearCache();
      // Actualizar info del cache
      const newCacheInfo = await getCacheInfo();
      setCacheInfo(newCacheInfo);
      
      // Mostrar notificación
      alert('Cache limpiado exitosamente');
    } catch (error) {
      alert('Error limpiando cache');
    } finally {
      setIsClearing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-xl">📱</span>
        Información de PWA
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Estado de instalación:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            isInstalled 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isInstalled ? '✅ Instalada' : '📱 No instalada'}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Modo de visualización:</span>
          <span className="text-sm font-medium">
            {isStandalone ? 'Standalone' : 'Browser'}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Plataforma:</span>
          <span className="text-sm font-medium">{platform}</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Estado de conexión:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            isOnline 
              ? 'bg-green-100 text-green-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            {isOnline ? '🟢 Online' : '📵 Offline'}
          </span>
        </div>
        
        {cacheInfo && (
          <>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Cache entries:</span>
              <span className="text-sm font-medium">{cacheInfo.entries} archivos</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Tamaño estimado:</span>
              <span className="text-sm font-medium">{formatBytes(cacheInfo.size)}</span>
            </div>
          </>
        )}
        
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleClearCache}
            disabled={isClearing}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClearing ? 'Limpiando...' : '🧹 Limpiar Cache'}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Esto eliminará todos los archivos en cache y puede reducir el rendimiento offline
          </p>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallButton;