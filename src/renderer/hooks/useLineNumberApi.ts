import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

export interface CaptureSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  frequency: number;
}

interface CaptureResponse {
  id: string;
}

interface SuccessResponse {
  success: boolean;
}

interface CaptureStatus {
  id: string;
  active: boolean;
  settings: Record<string, any>;
  has_results: boolean;
  client_count: number;
}

// 1. 【修改】加上 export，讓外部可以引用這個型別
export interface LineNumberResult {
  line_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  timestamp: string;
}

const api = axios.create({
  baseURL: BASE_URL,
});

export const useCreateCapture = () => {
  const queryClient = useQueryClient();
  return useMutation<CaptureResponse, Error, CaptureSettings>({
    mutationFn: async (settings: CaptureSettings) => {
      const response = await api.post('/captures/', settings);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captures'] });
    },
  });
};

export const useUpdateCapture = () => {
  const queryClient = useQueryClient();
  return useMutation<
    SuccessResponse,
    Error,
    { captureId: string; settings: CaptureSettings }
  >({
    mutationFn: async ({ captureId, settings }) => {
      const response = await api.put(`/captures/${captureId}`, settings);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['captures', variables.captureId],
      });
    },
  });
};

export const useControlCapture = () => {
  const queryClient = useQueryClient();
  return useMutation<
    SuccessResponse,
    Error,
    { id: string; action: 'start' | 'stop' }
  >({
    mutationFn: async (controlParams) => {
      const response = await api.post('/captures/control', controlParams);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['captures', variables.id] });
    },
  });
};

export const useCaptureStatus = (captureId: string, enabled = true) => {
  return useQuery<CaptureStatus, Error>({
    queryKey: ['captures', captureId],
    queryFn: async () => {
      const response = await api.get(`/captures/${captureId}`);
      return response.data;
    },
    enabled,
    refetchInterval: 3000,
  });
};

// 2. 【修改】啟用 refetchInterval 進行輪詢
export const useLineNumberResults = (captureId: string | null) => {
  return useQuery<LineNumberResult[], Error>({
    queryKey: ['captures', captureId, 'results'],
    queryFn: async () => {
      // 這裡如果 captureId 為 null 不應該執行，但由 enabled 控制更安全
      if (!captureId) return [];
      const response = await api.get(`/captures/${captureId}/results`);
      return response.data;
    },
    // 只有當 captureId 存在時才開始查詢
    enabled: !!captureId,
    // 【關鍵】每 500ms 自動重新抓取一次 (Polling)
    refetchInterval: 3000,
  });
};
