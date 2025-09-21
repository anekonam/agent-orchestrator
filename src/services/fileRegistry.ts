import { FileInfo } from '../types/fileRegistry';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.fab.columbus.tech';
const FILES_ENDPOINT = `${API_BASE_URL}/api/v1/files`;
const CACHE_KEY = 'fileRegistry_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class FileRegistryService {
  private cache: FileInfo[] | null = null;
  private cacheTimestamp: number | null = null;
  private fileMap: Map<string, FileInfo> = new Map();

  /**
   * Fetches the global files from the API
   */
  async fetchGlobalFiles(): Promise<FileInfo[]> {
    try {
      // Check cache first
      if (this.isCacheValid()) {
        return this.cache!;
      }

      const response = await fetch(`${FILES_ENDPOINT}/?scope=global&limit=100`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.status}`);
      }

      const files: FileInfo[] = await response.json();
      
      // Update cache
      this.cache = files;
      this.cacheTimestamp = Date.now();
      
      // Update file map for quick lookups
      this.updateFileMap(files);
      
      // Store in localStorage for persistence
      this.saveToLocalStorage(files);
      
      return files;
    } catch (error) {
      console.error('Error fetching global files:', error);
      
      // Try to load from localStorage as fallback
      const cachedFiles = this.loadFromLocalStorage();
      if (cachedFiles) {
        this.updateFileMap(cachedFiles);
        return cachedFiles;
      }
      
      throw error;
    }
  }

  /**
   * Gets a file by its filename
   */
  getFileByName(filename: string): FileInfo | undefined {
    // Try to get from map first
    if (this.fileMap.has(filename)) {
      return this.fileMap.get(filename);
    }

    // Try variations of the filename (with/without extensions, case variations)
    const variations = this.getFilenameVariations(filename);
    for (const variation of variations) {
      if (this.fileMap.has(variation)) {
        return this.fileMap.get(variation);
      }
    }

    return undefined;
  }

  /**
   * Generates the download URL for a file
   */
  getDownloadUrl(fileId: string): string {
    return `${FILES_ENDPOINT}/${fileId}/download`;
  }

  /**
   * Checks if a file is available in the registry
   */
  isFileAvailable(filename: string): boolean {
    return this.getFileByName(filename) !== undefined;
  }

  /**
   * Refreshes the file registry
   */
  async refreshFileRegistry(): Promise<FileInfo[]> {
    // Force cache invalidation
    this.cache = null;
    this.cacheTimestamp = null;
    this.fileMap.clear();
    
    return this.fetchGlobalFiles();
  }

  /**
   * Updates the file map for quick lookups
   */
  private updateFileMap(files: FileInfo[]): void {
    this.fileMap.clear();
    files.forEach(file => {
      // Store by exact filename
      this.fileMap.set(file.filename, file);
      
      // Also store without extension for flexible matching
      const nameWithoutExt = this.removeExtension(file.filename);
      if (nameWithoutExt !== file.filename) {
        this.fileMap.set(nameWithoutExt, file);
      }
    });
  }

  /**
   * Checks if the cache is still valid
   */
  private isCacheValid(): boolean {
    if (!this.cache || !this.cacheTimestamp) {
      return false;
    }
    
    const now = Date.now();
    return (now - this.cacheTimestamp) < CACHE_DURATION;
  }

  /**
   * Saves files to localStorage
   */
  private saveToLocalStorage(files: FileInfo[]): void {
    try {
      const cacheData = {
        files,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Loads files from localStorage
   */
  private loadFromLocalStorage(): FileInfo[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      
      // Check if cache is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - cacheData.timestamp > maxAge) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return cacheData.files;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  /**
   * Removes file extension from filename
   */
  private removeExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return filename;
    return filename.substring(0, lastDot);
  }

  /**
   * Gets filename variations for flexible matching
   */
  private getFilenameVariations(filename: string): string[] {
    const variations: string[] = [];
    
    // Original
    variations.push(filename);
    
    // Without extension
    variations.push(this.removeExtension(filename));
    
    // With common extensions if not present
    if (!filename.includes('.')) {
      const commonExtensions = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.txt'];
      commonExtensions.forEach(ext => {
        variations.push(filename + ext);
      });
    }
    
    // Case variations
    variations.push(filename.toLowerCase());
    variations.push(filename.toUpperCase());
    
    return variations;
  }
}

// Export singleton instance
export const fileRegistryService = new FileRegistryService();