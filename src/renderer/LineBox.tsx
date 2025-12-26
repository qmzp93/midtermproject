import React, { useContext } from 'react';
import { BoundingBox } from '@ar-project/host-object-model';
import { HomContext } from './context/HomContext';
import { PrintBox } from './components/PrintBox';

import { useLineNumberDetector } from './hooks/useLineNumberDetector';
import { CommentOverlay } from './components/CommentOverlay';
import type { CommentData } from './components/CreateCommentModal';

// 1. 定義 LineBox 的 Props
interface LineBoxProps {
  comments: CommentData[]; // 新增這個屬性
  onEdit: (data: CommentData) => void;
}

export type BoundingInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const getMergedBoundingInfo = (
  xElement: BoundingBox | null | undefined,
  yElement: BoundingBox | null | undefined,
): BoundingInfo | null => {
  if (!xElement || !yElement) {
    return null;
  }
  const { x, height } = xElement;

  const width = 45;
  const y = yElement.y + yElement.height;

  return {
    x: x + 11,
    y,
    width,
    height: height - 70,
  };
};

export const LineBox: React.FC<LineBoxProps> = ({ comments, onEdit }) => {
  const { editorAreaBoundingBox, breadCrumbBoundingBox } =
    useContext(HomContext);

  // 計算屬性：將兩個 Instance 的資料合併
  const mergedBoundingInfo = getMergedBoundingInfo(
    editorAreaBoundingBox,
    breadCrumbBoundingBox,
  );

  // 2. 【新增】在這裡直接呼叫 Hook 取得 API 資料
  // 我們把 mergedBoundingInfo 傳給 Hook，讓它去截圖辨識
  const { results: detectedLines } = useLineNumberDetector({
    boundingBox: mergedBoundingInfo || undefined, // 如果是 null 轉 undefined
    enabled: !!mergedBoundingInfo,
  });

  return (
    <>
      {mergedBoundingInfo && <PrintBox boundingInfo={mergedBoundingInfo} />}

      {mergedBoundingInfo && (
        <CommentOverlay
          detectedLines={detectedLines}
          targetBoundingBox={mergedBoundingInfo}
          externalComments={comments}
          onEdit={onEdit}
        />
      )}
    </>
  );
};

export default LineBox;
