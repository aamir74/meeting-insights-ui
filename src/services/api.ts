import axios from 'axios';
import {
  SubmitTranscriptResponse,
  JobResponse,
  Task,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  /**
   * Submit a transcript for processing
   */
  submitTranscript: async (transcript: string): Promise<SubmitTranscriptResponse> => {
    const response = await api.post<SubmitTranscriptResponse>(
      '/api/transcripts',
      { transcript }
    );
    return response.data;
  },

  /**
   * Get job status and results
   */
  getJobStatus: async (jobId: string): Promise<JobResponse> => {
    const response = await api.get<JobResponse>(`/api/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Mark a task as completed
   */
  completeTask: async (taskId: string): Promise<{ success: boolean; data: { allTasks: Task[] } }> => {
    const response = await api.patch(`/api/tasks/${taskId}/complete`);
    return response.data;
  },

  /**
   * Health check
   */
  healthCheck: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default apiService;
