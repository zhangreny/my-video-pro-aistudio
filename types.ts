
export interface VideoSegment {
  id: string;
  start: number;
  end: number;
  label: string;
}

export interface VideoMetadata {
  name: string;
  duration: number;
  size: number;
  type: string;
  url: string;
}

export enum ExportStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface CropConfig {
  enabled: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}
