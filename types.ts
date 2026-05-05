
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
