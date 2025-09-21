import React, { useState, useMemo } from 'react';
import { useFileRegistry } from '../../contexts/FileRegistryContext';
import './SourcesList.css';

interface SourcesListProps {
  sources: string[] | any; // Can accept URLs or structured data
  maxVisible?: number;
  imageSize?: 'small' | 'medium';
  label?: string;
  showLabel?: boolean;
}

const SourcesList: React.FC<SourcesListProps> = ({
  sources,
  maxVisible = 3,
  imageSize = 'small',
  label = 'Sources',
  showLabel = true
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { getFileByName, getDownloadUrl, isFileAvailable } = useFileRegistry();

  // Helper function to check if a string is a direct image path
  const isDirectImagePath = (source: string): boolean => {
    if (typeof source !== 'string') return false;

    // Check if it starts with '/' (relative path) or contains common image extensions
    const imageExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico'];
    const startsWithSlash = source.startsWith('/');
    const hasImageExtension = imageExtensions.some(ext => source.toLowerCase().includes(ext));

    return startsWithSlash && hasImageExtension;
  };

  // Helper function to check if a string is a website URL
  const isWebsiteUrl = (source: string): boolean => {
    if (typeof source !== 'string') return false;
    return source.startsWith('http://') || source.startsWith('https://');
  };

  // Define the source data type
  type SourceData = { image: string; url?: string; name?: string };

  // Helper function to extract source data (images and original URLs)
  const extractSourceData = useMemo(() => (input: any): SourceData[] => {
    // Handle null, undefined, or empty array inputs
    if (!input || (Array.isArray(input) && input.length === 0)) {
      return [];
    }

    // If already an array, process it
    if (Array.isArray(input) && input.length > 0) {
      // Process each source and filter out unavailable files
      const mappedSources = input.map((source: string): SourceData | null => {
        // If it's already a direct image path, return as is
        if (isDirectImagePath(source)) {
          // Extract filename from path
          const name = source.split('/').pop() || source;
          return { image: source, name };
        }

        // If it's a website URL, get its favicon and keep the URL
        if (isWebsiteUrl(source)) {
          try {
            const url = new URL(source);
            const domain = url.hostname;

            // Special case for centralbank.ae - use custom CBUAE icon
            if (domain.includes('centralbank.ae')) {
              return {
                image: '/images/CBUAE.png',
                url: source,
                name: 'Central Bank of the UAE'
              };
            }

            // Use Google's favicon service for all other URLs
            return {
              image: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
              url: source,
              name: domain
            };
          } catch (e) {
            // If URL parsing fails, return default icon
            return { image: '/images/source-icon.webp', name: 'Source' };
          }
        }

        // Check if it's a filename in the file registry
        if (typeof source === 'string') {
          // Extract just the filename if it's a path
          const filename = source.split('/').pop() || source;
          
          // Check if file exists in registry
          const fileInfo = getFileByName(filename);
          if (fileInfo) {
            // File exists, create download URL
            const downloadUrl = getDownloadUrl(fileInfo.file_id);
            return {
              image: '/images/source-icon.webp',
              url: downloadUrl,
              name: fileInfo.filename
            };
          }
          
          // File doesn't exist in registry, return null to filter out
          return null;
        }

        // Default case - check if it might be a filename
        const possibleFilename = typeof source === 'string' ? source : '';
        if (possibleFilename && isFileAvailable(possibleFilename)) {
          const fileInfo = getFileByName(possibleFilename);
          if (fileInfo) {
            return {
              image: '/images/source-icon.webp',
              url: getDownloadUrl(fileInfo.file_id),
              name: fileInfo.filename
            };
          }
        }

        // Source not recognized and not in file registry - filter out
        return null;
      });

      // First filter out null values, then remove duplicates
      const validSources = mappedSources.filter((item): item is SourceData => item !== null);
      
      // Remove duplicates based on URL or image
      const seen = new Set<string>();
      return validSources.filter(item => {
        const key = item.url || item.image;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    // If input has a sources property (like chart data)
    if (input && typeof input === 'object' && input.sources && Array.isArray(input.sources)) {
      // Recursive call will use the same logic
      return []; // We'll handle this in the main processing
    }

    // Return empty array if no valid sources
    return [];
  }, [getFileByName, getDownloadUrl, isFileAvailable]);

  // Process sources with proper handling of nested sources
  const processedSources = useMemo(() => {
    // If input has a sources property (like chart data), extract it first
    const actualSources = (sources && typeof sources === 'object' && sources.sources && Array.isArray(sources.sources))
      ? sources.sources
      : sources;
    
    return extractSourceData(actualSources);
  }, [sources, extractSourceData]);

  // Don't render if no sources or sources is explicitly null/undefined/empty
  if (!sources || processedSources.length === 0) {
    return null;
  }

  const visibleSources = processedSources.slice(0, maxVisible);
  const remainingCount = processedSources.length - maxVisible;
  const hasMore = remainingCount > 0;

  return (
    <div className="sources-list">
      {showLabel && <span className="sources-list-label">{label}</span>}
      <div className="sources-list-images">
        {visibleSources.map((source, index) =>
          source.url ? (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="source-link"
              title={source.name || source.url}
            >
              <img
                src={source.image}
                alt={`Source ${index + 1}`}
                className={`source-list-image source-list-image-${imageSize} source-list-image-clickable`}
                title={source.name || source.url}
              />
            </a>
          ) : (
            <img
              key={index}
              src={source.image}
              alt={`Source ${index + 1}`}
              className={`source-list-image source-list-image-${imageSize}`}
              title={source.name || `Source ${index + 1}`}
            />
          )
        )}
        {hasMore && (
          <div
            className="sources-more-indicator"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span className="sources-more-count">+{remainingCount}</span>
            {showTooltip && (
              <div className="sources-tooltip">
                <div className="sources-tooltip-content">
                  <div className="sources-tooltip-title">All Sources</div>
                  <div className="sources-tooltip-grid">
                    {processedSources.map((source, index) =>
                      source.url ? (
                        <a
                          key={index}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-tooltip-link"
                          title={source.name || source.url}
                        >
                          <img
                            src={source.image}
                            alt={`Source ${index + 1}`}
                            className="source-tooltip-image source-tooltip-image-clickable"
                            title={source.name || source.url}
                          />
                        </a>
                      ) : (
                        <img
                          key={index}
                          src={source.image}
                          alt={`Source ${index + 1}`}
                          className="source-tooltip-image"
                          title={source.name || `Source ${index + 1}`}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SourcesList;