import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { FileInfo, FileRegistryState, FileRegistryContextType } from '../types/fileRegistry';
import { fileRegistryService } from '../services/fileRegistry';

const initialState: FileRegistryState = {
  files: [],
  fileMap: new Map(),
  isLoading: false,
  error: null,
  lastFetched: null,
};

const FileRegistryContext = createContext<FileRegistryContextType | undefined>(undefined);

interface FileRegistryProviderProps {
  children: ReactNode;
}

export const FileRegistryProvider: React.FC<FileRegistryProviderProps> = ({ children }) => {
  const [state, setState] = useState<FileRegistryState>(initialState);

  // Initialize file registry on mount
  useEffect(() => {
    loadFileRegistry();
  }, []);

  const loadFileRegistry = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const files = await fileRegistryService.fetchGlobalFiles();
      
      // Create file map for O(1) lookups
      const fileMap = new Map<string, FileInfo>();
      files.forEach(file => {
        fileMap.set(file.filename, file);
        
        // Also store without extension for flexible matching
        const nameWithoutExt = file.filename.replace(/\.[^/.]+$/, '');
        if (nameWithoutExt !== file.filename) {
          fileMap.set(nameWithoutExt, file);
        }
      });
      
      setState({
        files,
        fileMap,
        isLoading: false,
        error: null,
        lastFetched: new Date(),
      });
    } catch (error) {
      console.error('Failed to load file registry:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load file registry',
      }));
    }
  };

  const getFileByName = useCallback((filename: string): FileInfo | undefined => {
    // Direct lookup
    if (state.fileMap.has(filename)) {
      return state.fileMap.get(filename);
    }

    // Try case-insensitive lookup
    const lowerFilename = filename.toLowerCase();
    const entries = Array.from(state.fileMap.entries());
    for (const [key, file] of entries) {
      if (key.toLowerCase() === lowerFilename) {
        return file;
      }
    }

    // Try partial match (filename without path)
    const baseFilename = filename.split('/').pop() || filename;
    if (baseFilename !== filename) {
      return getFileByName(baseFilename);
    }

    return undefined;
  }, [state.fileMap]);

  const getDownloadUrl = useCallback((fileId: string): string => {
    return fileRegistryService.getDownloadUrl(fileId);
  }, []);

  const isFileAvailable = useCallback((filename: string): boolean => {
    return getFileByName(filename) !== undefined;
  }, [getFileByName]);

  const refreshFileRegistry = useCallback(async (): Promise<void> => {
    await loadFileRegistry();
  }, []);

  const contextValue: FileRegistryContextType = {
    state,
    getFileByName,
    getDownloadUrl,
    isFileAvailable,
    refreshFileRegistry,
  };

  return (
    <FileRegistryContext.Provider value={contextValue}>
      {children}
    </FileRegistryContext.Provider>
  );
};

export const useFileRegistry = (): FileRegistryContextType => {
  const context = useContext(FileRegistryContext);
  if (!context) {
    throw new Error('useFileRegistry must be used within a FileRegistryProvider');
  }
  return context;
};