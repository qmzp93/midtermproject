import React from 'react';
import {
  useLineNumberDetector,
  LineNumberResult,
} from '../hooks/useLineNumberDetector';
import type { BoundingInfo } from '../LineBox';

interface Props {
  // 這是從 LineBox 傳進來的 "行號區域" 絕對座標
  targetBoundingBox: BoundingInfo;
}

export const LineNumberOverlay: React.FC<Props> = ({ targetBoundingBox }) => {
  const { results, status } = useLineNumberDetector({
    boundingBox: targetBoundingBox, // 傳入區域，讓 API 知道要截哪裡
    enabled: !!targetBoundingBox,
  });

  if (!targetBoundingBox) return null;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: targetBoundingBox.x,
          top: targetBoundingBox.y - 20,
          background: status === 'running' ? '#4CAF50' : '#f44336',
          color: 'white',
          fontSize: '10px',
          padding: '2px 5px',
          zIndex: 2000,
          pointerEvents: 'none',
        }}
      >
        API: {status}
      </div>

      {/* 2. 遍歷 API 回傳的每一個數字 */}
      {results.map((line: LineNumberResult, index: number) => {
        // --- 【核心邏輯：座標定位】 ---
        // 螢幕絕對 X = 行號區起始 X + API 回傳的相對 x
        const absX = targetBoundingBox.x + line.x - 30;
        // 螢幕絕對 Y = 行號區起始 Y + API 回傳的相對 y
        const absY = targetBoundingBox.y + line.y;

        return (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={`${index}-${line.line_number}-${line.timestamp}`}
            style={{
              position: 'absolute',
              left: absX,
              top: absY,
              width: line.width,
              height: line.height,

              pointerEvents: 'none',
              zIndex: 1000,
            }}
          >
            {/* 顯示行號 (line_number) */}
            <span
              style={{
                position: 'absolute',
                right: '100%', // 顯示在框框左側
                top: 0,
                color: '#00ff00',
                background: 'rgba(0,0,0,0.8)',
                fontSize: '10px',
                padding: '0 2px',
                whiteSpace: 'nowrap',
              }}
            >
              #{line.line_number}
            </span>
          </div>
        );
      })}
    </>
  );
};

export default LineNumberOverlay;
