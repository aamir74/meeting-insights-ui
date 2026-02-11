export interface Task {
  _id: string;
  taskId: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  status: 'ready' | 'blocked' | 'completed' | 'error';
  errorMessage?: string;
  transcriptId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transcript {
  _id: string;
  jobId: string;
  content: string;
  contentHash: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  metadata?: {
    taskCount?: number;
    cyclesDetected?: boolean;
    processingTime?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface JobResponse {
  success: boolean;
  data: {
    jobId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    transcript: {
      id: string;
      content: string;
      createdAt: string;
      updatedAt: string;
    };
    tasks: Task[];
    metadata?: {
      taskCount?: number;
      cyclesDetected?: boolean;
      processingTime?: number;
    };
    errorMessage?: string;
  };
}

export interface SubmitTranscriptResponse {
  success: boolean;
  jobId: string;
  message: string;
  isDuplicate: boolean;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
  };
}
