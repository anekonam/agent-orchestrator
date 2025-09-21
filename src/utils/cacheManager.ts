// Cache management utilities
export class CacheManager {
  private static VERSION_KEY = 'app_version';
  private static LAST_UPDATED_KEY = 'app_last_updated';

  /**
   * Check if the app version has changed and clear cache if needed
   */
  static async checkAndClearCache(currentVersion: string) {
    try {
      const storedVersion = localStorage.getItem(this.VERSION_KEY);
      
      // If version has changed or no version stored, clear everything
      if (storedVersion !== currentVersion) {
        console.log(`Version changed from ${storedVersion} to ${currentVersion}. Clearing cache...`);
        
        // Clear all caches
        await this.clearAllCaches();
        
        // Store new version
        localStorage.setItem(this.VERSION_KEY, currentVersion);
        localStorage.setItem(this.LAST_UPDATED_KEY, new Date().toISOString());
        
        // Force reload to get fresh content
        return true; // Indicates reload needed
      }
      
      return false; // No reload needed
    } catch (error) {
      console.error('Error checking cache version:', error);
      return false;
    }
  }

  /**
   * Clear all browser caches
   */
  static async clearAllCaches() {
    // Clear Cache Storage
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Cache Storage cleared');
    }

    // Clear localStorage (except version info)
    const version = localStorage.getItem(this.VERSION_KEY);
    const lastUpdated = localStorage.getItem(this.LAST_UPDATED_KEY);
    localStorage.clear();
    if (version) localStorage.setItem(this.VERSION_KEY, version);
    if (lastUpdated) localStorage.setItem(this.LAST_UPDATED_KEY, lastUpdated);
    console.log('LocalStorage cleared');

    // Clear sessionStorage
    sessionStorage.clear();
    console.log('SessionStorage cleared');

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log('Service workers unregistered');
    }
  }

  /**
   * Force a hard reload of the page
   */
  static forceHardReload() {
    // Add timestamp to force bypass cache
    const timestamp = new Date().getTime();
    const url = new URL(window.location.href);
    url.searchParams.set('_t', timestamp.toString());
    
    // Use location.replace to prevent back button issues
    window.location.replace(url.toString());
  }

  /**
   * Get version info for debugging
   */
  static getVersionInfo() {
    return {
      version: localStorage.getItem(this.VERSION_KEY),
      lastUpdated: localStorage.getItem(this.LAST_UPDATED_KEY)
    };
  }
}

export default CacheManager;