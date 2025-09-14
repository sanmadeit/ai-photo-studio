
export enum ImageStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface ProcessedImage {
  id: string;
  originalFile: File;
  originalUrl: string;
  transformedUrl: string | null;
  status: ImageStatus;
  error: string | null;
}
