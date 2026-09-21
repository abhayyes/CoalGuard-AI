import { apiClient } from './api';

export const aiService = {
  predictRisk: async (data: any) => {
    const response = await apiClient.post('/ai/predict-risk', data);
    return response.data;
  },

  detectAnomaly: async (data: any) => {
    const response = await apiClient.post('/ai/detect-anomaly', data);
    return response.data;
  },

  analyzeMineFull: async (data: any) => {
    const response = await apiClient.post('/ai/analyze-mine-full', data);
    return response.data;
  }
};
