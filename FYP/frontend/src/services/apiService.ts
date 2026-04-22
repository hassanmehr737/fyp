import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const apiService = {
    // Analysis
    analyzeEmail: async (data: { emailContent: string; subject?: string; sender?: string; providers?: string[]; promptStrategy?: string }) => {
        const response = await apiClient.post('/analyze', data);
        return response.data;
    },
    getAnalysisHistory: async () => {
        const response = await apiClient.get('/analyze/history/recent');
        return response.data;
    },
    getAnalysisById: async (id: string) => {
        const response = await apiClient.get(`/analyze/${id}`);
        return response.data;
    },

    // Training
    getModules: async () => {
        const response = await apiClient.get('/training/modules');
        return response.data;
    },
    getModuleById: async (id: string) => {
        const response = await apiClient.get(`/training/modules/${id}`);
        return response.data;
    },
    submitTrainingAnswer: async (data: { emailId: string; userAnswer: string; moduleId?: string; userId?: string; timeSpentMs?: number }) => {
        const response = await apiClient.post('/training/submit', data);
        return response.data;
    },
    getUserProgress: async (userId: string) => {
        const response = await apiClient.get(`/training/progress/${userId}`);
        return response.data;
    },

    // Dashboard
    getUserStats: async (userId: string) => {
        const response = await apiClient.get(`/dashboard/stats/${userId}`);
        return response.data;
    },
    getRecentActivity: async (userId: string) => {
        const response = await apiClient.get(`/dashboard/recent-activity/${userId}`);
        return response.data;
    },

    // Evaluation
    startEvaluation: async (data: { userId?: string; type: 'pre-test' | 'post-test' }) => {
        const response = await apiClient.post('/evaluation/start', data);
        return response.data;
    },
    submitEvaluationAnswer: async (data: { sessionId: string; emailId: string; userAnswer: string; timeSpentMs?: number }) => {
        const response = await apiClient.post('/evaluation/answer', data);
        return response.data;
    },
    completeEvaluation: async (sessionId: string) => {
        const response = await apiClient.post('/evaluation/complete', { sessionId });
        return response.data;
    },
    compareEvaluationResults: async (userId: string) => {
        const response = await apiClient.get(`/evaluation/compare/${userId}`);
        return response.data;
    },
};

export default apiClient;
