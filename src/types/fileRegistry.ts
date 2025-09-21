export interface FileInfo {
  file_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  content_type: string;
  scope: string;
  category: string;
  status: string;
  uploaded_at: string;
  processed_at: string | null;
  project_id: string | null;
  uploader_id: string;
  chunk_count: number;
  vector_count: number;
  error_message: string | null;
  document_metadata: Record<string, any>;
  tags: string[];
}

export interface FileRegistryState {
  files: FileInfo[];
  fileMap: Map<string, FileInfo>; // For O(1) lookups by filename
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

export interface FileRegistryContextType {
  state: FileRegistryState;
  getFileByName: (filename: string) => FileInfo | undefined;
  getDownloadUrl: (fileId: string) => string;
  isFileAvailable: (filename: string) => boolean;
  refreshFileRegistry: () => Promise<void>;
}