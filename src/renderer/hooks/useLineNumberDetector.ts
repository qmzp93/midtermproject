import { useState, useEffect } from 'react';
import {
  useCreateCapture,
  useControlCapture,
  useLineNumberResults,
  LineNumberResult,
} from '../hooks/useLineNumberApi';

export type { LineNumberResult };

interface UseLineNumberDetectorProps {
  boundingBox:
    | { x: number; y: number; width: number; height: number }
    | undefined;
  enabled: boolean;
  serverUrl?: string;
}

export const useLineNumberDetector = ({
  boundingBox,
  enabled,
}: UseLineNumberDetectorProps) => {
  // 狀態只剩下 captureId，其他的交給 React Query 管理
  const [captureId, setCaptureId] = useState<string | null>(null);

  // 初始化 Mutations
  const createCaptureMutation = useCreateCapture();
  const controlCaptureMutation = useControlCapture();

  // 2. 使用 Query Hook 獲取結果 (Polling)
  // 當 captureId 有值時，這個 Hook 會自動每 500ms 去後端抓一次資料
  const {
    data: results = [], // 預設值為空陣列
    isLoading,
    isError
  } = useLineNumberResults(captureId);

  // 計算狀態字串 (給 UI 顯示用)
  const status = captureId
    ? (isLoading ? 'connecting' : isError ? 'error' : 'running')
    : 'idle';

  // 穩定化依賴：將 boundingBox 轉為字串 key
  const boxKey = boundingBox
    ? `${boundingBox.x},${boundingBox.y},${boundingBox.width},${boundingBox.height}`
    : null;

  // 3. 處理生命週期：建立 -> 開始 -> (清理) -> 停止
  useEffect(() => {
    let isMounted = true;
    // 暫存 ID 以便 cleanup 使用
    let currentId: string | null = null;

    const setupCapture = async () => {
      // 檢查條件
      if (!enabled || !boundingBox) return;

      try {
        // A. 建立截圖設定 (POST /captures/)
        const captureData = await createCaptureMutation.mutateAsync({
          x: Math.floor(boundingBox.x),
          y: Math.floor(boundingBox.y),
          width: Math.floor(boundingBox.width),
          height: Math.floor(boundingBox.height),
          frequency: 5.0,
        });

        if (!isMounted) return;
        currentId = captureData.id;

        // B. 開始截圖 (POST /captures/control start)
        await controlCaptureMutation.mutateAsync({
          id: currentId,
          action: 'start',
        });

        // C. 設定 ID，這會觸發 useLineNumberResults 開始輪詢
        if (isMounted) {
          setCaptureId(currentId);
        }
      } catch (error) {
        console.error('Setup Capture Failed:', error);
      }
    };

    setupCapture();

    // Cleanup Function
    return () => {
      isMounted = false;
      // 停止並重置
      if (currentId) {
        // 發送停止指令 (使用 mutate 而非 mutateAsync，因為我們不等待結果)
        controlCaptureMutation.mutate({ id: currentId, action: 'stop' });
      }
      setCaptureId(null);
    };

    // 當 boxKey 改變 (位置變了) 或 enabled 改變時，重新執行
  }, [enabled, boxKey]); // eslint-disable-line react-hooks/exhaustive-deps


  return { results: results, status };
};

export default useLineNumberDetector;
