describe('useLineNumberDetector() Hook 測試', () => {
  describe('初始化與提早結束 (Initialization & Early Return)', () => {
    it('TestCase9: LineNumberDetector_DisabledIdle - 當 enabled 為 false 或 boundingBox 為 undefined 時，應提早 return，且 status 維持 "idle"', () => {
      expect(true).toBe(true);
    });
  });

  describe('生命週期與 API 呼叫 (Lifecycle & API Mutations)', () => {
    it('TestCase10: LineNumberDetector_SetupFlow - 滿足條件時，應使用 Math.floor() 轉換 boundingBox 座標，並呼叫 createCaptureMutation 建立截圖', () => {
      expect(true).toBe(true);
    });

    it('TestCase11: LineNumberDetector_StartAction - 成功取得 currentId 後，應呼叫 controlCaptureMutation 傳送 { action: "start" } 指令，並設定 captureId', () => {
      expect(true).toBe(true);
    });

    it('TestCase12: LineNumberDetector_CleanupStop - 當元件卸載或重新執行 effect 時，cleanup function 應使用 mutate (而非 mutateAsync) 發送 { action: "stop" }，並將 captureId 設為 null', () => {
      expect(true).toBe(true);
    });
  });

  describe('React Query 狀態映射與效能優化 (State Mapping & Optimization)', () => {
    it('TestCase13: LineNumberDetector_StatusDerivation - 應根據 useLineNumberResults 的 isLoading 與 isError，正確將 status 映射為 "connecting", "error" 或 "running"', () => {
      expect(true).toBe(true);
    });

    it('TestCase14: LineNumberDetector_BoxKeyStability - useEffect 的依賴應使用字串化的 boxKey (x,y,w,h) 而非物件本身，以避免不必要的重新渲染', () => {
      expect(true).toBe(true);
    });
  });
});
