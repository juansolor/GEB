// PWA utilities para registrar service worker y manejar funcionalidad offline
import { useState, useEffect } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PWAInstallStatus {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  platform: string;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installStatusCallbacks: ((status: PWAInstallStatus) => void)[] = [];
  private isOnline: boolean = navigator.onLine;
  private onlineStatusCallbacks: ((isOnline: boolean) => void)[] = [];

  constructor() {
    // Evitar registrar el Service Worker en desarrollo para prevenir
    // recargas constantes de hot updates y duplicación de eventos.
  const nodeEnv = (import.meta as any).env?.MODE || (import.meta as any).env?.NODE_ENV;
  if (nodeEnv === 'production') {
      this.initializeServiceWorker();
    } else {
      console.log('🧪 Modo desarrollo: Service Worker deshabilitado para evitar recargas');
      // Forzar desregistro de cualquier SW previo que siga controlando y limpiar caches
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          regs.forEach(reg => {
            const scope = reg.scope;
            reg.unregister().then(r => {
              console.log('🧪 SW desregistrado en desarrollo:', scope, 'resultado:', r);
            });
          });
        });
        if (typeof caches !== 'undefined') {
          caches.keys().then(keys => keys.forEach(k => {
            caches.delete(k).then(() => console.log('🧪 Cache eliminado (dev):', k));
          }));
        }
      }
    }
    this.initializeInstallPrompt();
    this.initializeOnlineStatus();
  }

  // Registrar Service Worker
  private async initializeServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers no están disponibles en este navegador');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('✅ Service Worker registrado:', registration.scope);

      // Escuchar actualizaciones
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nueva versión disponible
              this.showUpdateAvailableNotification();
            }
          });
        }
      });

      // Escuchar mensajes del service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Mensaje del Service Worker:', event.data);
        
        if (event.data.type === 'CACHE_UPDATED') {
          this.showCacheUpdatedNotification();
        }
      });

    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error);
    }
  }

  // Manejar prompt de instalación
  private initializeInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('💾 Install prompt disponible');
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notifyInstallStatus();
    });

    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA instalada exitosamente');
      this.deferredPrompt = null;
      this.notifyInstallStatus();
    });
  }

  // Manejar estado online/offline
  private initializeOnlineStatus(): void {
    window.addEventListener('online', () => {
      console.log('🟢 Conexión restaurada');
      this.isOnline = true;
      this.notifyOnlineStatus();
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      console.log('🔴 Conexión perdida - Modo offline');
      this.isOnline = false;
      this.notifyOnlineStatus();
      this.showOfflineNotification();
    });
  }

  // Mostrar prompt de instalación
  public async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('Install prompt no está disponible');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      console.log('Respuesta del usuario:', choiceResult.outcome);
      
      this.deferredPrompt = null;
      this.notifyInstallStatus();
      
      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('Error mostrando install prompt:', error);
      return false;
    }
  }

  // Obtener estado de instalación
  public getInstallStatus(): PWAInstallStatus {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;
    
    const platform = this.detectPlatform();
    
    return {
      canInstall: !!this.deferredPrompt,
      isInstalled: isStandalone,
      isStandalone,
      platform
    };
  }

  // Detectar plataforma
  private detectPlatform(): string {
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (/android/.test(userAgent)) return 'Android';
    if (/iphone|ipad|ipod/.test(userAgent)) return 'iOS';
    if (/windows/.test(userAgent)) return 'Windows';
    if (/mac/.test(userAgent)) return 'Mac';
    
    return 'Unknown';
  }

  // Suscribirse a cambios de estado de instalación
  public onInstallStatusChange(callback: (status: PWAInstallStatus) => void): void {
    this.installStatusCallbacks.push(callback);
  }

  // Suscribirse a cambios de estado online
  public onOnlineStatusChange(callback: (isOnline: boolean) => void): void {
    this.onlineStatusCallbacks.push(callback);
  }

  // Notificar cambios de estado de instalación
  private notifyInstallStatus(): void {
    const status = this.getInstallStatus();
    this.installStatusCallbacks.forEach(callback => callback(status));
  }

  // Notificar cambios de estado online
  private notifyOnlineStatus(): void {
    this.onlineStatusCallbacks.forEach(callback => callback(this.isOnline));
  }

  // Obtener estado online
  public isAppOnline(): boolean {
    return this.isOnline;
  }

  // Sincronizar datos offline
  private async syncOfflineData(): Promise<void> {
    try {
      console.log('🔄 Sincronizando datos offline...');
      
      // Registrar background sync si está disponible
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        // Background sync registration (TypeScript workaround)
        (registration as any).sync?.register('background-sync-forms');
      }
      
      // Aquí se puede agregar lógica específica para sincronizar datos
      
    } catch (error) {
      console.error('Error sincronizando datos offline:', error);
    }
  }

  // Mostrar notificación de actualización disponible
  private showUpdateAvailableNotification(): void {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4f46e5;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        max-width: 300px;
      ">
        <div style="font-weight: bold; margin-bottom: 8px;">
          🆕 Actualización Disponible
        </div>
        <div style="font-size: 14px; margin-bottom: 12px;">
          Nueva versión de GEB disponible
        </div>
        <button onclick="window.location.reload()" style="
          background: white;
          color: #4f46e5;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          margin-right: 8px;
        ">
          Actualizar
        </button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        ">
          Después
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove después de 10 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  // Mostrar notificación de cache actualizado
  private showCacheUpdatedNotification(): void {
    console.log('💾 Cache actualizado - Nueva versión disponible');
  }

  // Mostrar notificación offline
  private showOfflineNotification(): void {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #f59e0b;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <span>📵</span>
        <span>Modo Offline - Funcionalidad limitada</span>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: transparent;
          color: white;
          border: none;
          cursor: pointer;
          margin-left: 8px;
          font-size: 18px;
        ">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // Limpiar cache manualmente
  public async clearCache(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🧹 Cache limpiado exitosamente');
    } catch (error) {
      console.error('Error limpiando cache:', error);
    }
  }

  // Obtener información del cache
  public async getCacheInfo(): Promise<{size: number, entries: number}> {
    try {
      let totalSize = 0;
      let totalEntries = 0;
      
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        totalEntries += keys.length;
        
        // Aproximar tamaño (esto es una estimación)
        totalSize += keys.length * 1024; // ~1KB por entrada (estimado)
      }
      
      return { size: totalSize, entries: totalEntries };
    } catch (error) {
      console.error('Error obteniendo información del cache:', error);
      return { size: 0, entries: 0 };
    }
  }
}

// Singleton instance
export const pwaManager = new PWAManager();

// Hook personalizado para React
export const usePWA = () => {
  const [installStatus, setInstallStatus] = useState<PWAInstallStatus>(() => 
    pwaManager.getInstallStatus()
  );
  
  const [isOnline, setIsOnline] = useState(() => 
    pwaManager.isAppOnline()
  );

  useEffect(() => {
    pwaManager.onInstallStatusChange(setInstallStatus);
    pwaManager.onOnlineStatusChange(setIsOnline);
  }, []);

  return {
    ...installStatus,
    isOnline,
    showInstallPrompt: pwaManager.showInstallPrompt.bind(pwaManager),
    clearCache: pwaManager.clearCache.bind(pwaManager),
    getCacheInfo: pwaManager.getCacheInfo.bind(pwaManager)
  };
};

export default pwaManager;