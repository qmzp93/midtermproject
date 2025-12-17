import React, { useState, useContext } from 'react';
import { HomContext } from '../context/HomContext';
import type { LineNumberResult } from '../hooks/useLineNumberDetector';
import type { BoundingInfo } from '../LineBox';
import type { CommentData } from './CreateCommentModal'; // 引入型別

interface Props {
  detectedLines: LineNumberResult[];
  targetBoundingBox: BoundingInfo;
  externalComments: CommentData[]; // 新增：接收外部傳入的註解列表
}

// 圖示對照 Helper
const getIcon = (type: string) => {
  switch (type) {
    case 'Info':
      return 'ℹ️';
    case 'Bug':
      return '🐞';
    case 'Todo':
      return '✅';
    default:
      return '📝';
  }
};

export const CommentOverlay: React.FC<Props> = ({
  detectedLines,
  targetBoundingBox,
  externalComments, // 預設為空陣列
}) => {
  // 用來記錄目前滑鼠懸停在哪個註解上 (存註解的 ID)
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);

  // 1. 從 Context 取得 activeFileElement
  const { currentFileName } = useContext(HomContext);

  // 篩選出屬於這個檔案的註解
  // console.log('CommentOverlay:', currentFileName);
  const fileComments = externalComments.filter(
    (c) => c.fileName === currentFileName,
  );

  if (fileComments.length === 0) return null;

  return (
    <>
      {fileComments.map((comment) => {
        // 比對行號
        const matchedLine = detectedLines.find(
          (l) => l.line_number === comment.line_number,
        );

        if (!matchedLine) return null;

        // 3. 計算註解顯示位置
        const absX =
          targetBoundingBox.x + matchedLine.x + matchedLine.width + 20;
        const absY = targetBoundingBox.y + matchedLine.y;

        const isHovered = hoveredCommentId === comment.id;

        return (
          <div
            key={comment.id}
            // 滑鼠事件綁定在最外層容器
            onMouseEnter={() => setHoveredCommentId(comment.id)}
            onMouseLeave={() => setHoveredCommentId(null)}
            style={{
              position: 'absolute',
              left: absX,
              top: absY,
              zIndex: 3000,
              pointerEvents: 'auto', // 關鍵：讓滑鼠可以感應到
              cursor: 'help',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* 1. 顯示小圖示 */}
            <div
              style={{
                fontSize: '19px',
                filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
                transition: 'transform 0.1s',
                transform: isHovered ? 'scale(1.2)' : 'scale(1)', // 移上去稍微放大
              }}
            >
              {getIcon(comment.type)}
            </div>

            {/* 2. 顯示詳細內容 (只有 Hover 時才出現) */}
            {isHovered && (
              <div
                style={{
                  position: 'absolute',
                  left: '30px', // 顯示在圖示右方 30px 處
                  top: '-10px', // 稍微往上調整，讓箭頭對齊圖示中心

                  // 【修正】樣式必須寫在 style 物件裡！
                  backgroundColor: 'rgba(40, 44, 52, 0.95)', // 深色背景
                  color: 'white',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  minWidth: '200px', // 設定最小寬度
                  maxWidth: '300px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  whiteSpace: 'normal', // 允許換行
                  backdropFilter: 'blur(4px)',
                  zIndex: 3001, // 確保內容框蓋過其他東西
                }}
              >
                {/* 裝飾：向左的小箭頭 */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-6px',
                    top: '16px', // 箭頭垂直位置
                    width: '0',
                    height: '0',
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderRight: '6px solid rgba(40, 44, 52, 0.95)', // 跟背景色一樣
                  }}
                />

                {/* 標題區 */}
                <div
                  style={{
                    borderBottom: '1px solid #666',
                    paddingBottom: '6px',
                    marginBottom: '6px',
                    fontWeight: 'bold',
                    color: '#61dafb', // 藍色標題
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>Line {comment.line_number}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      backgroundColor: '#333',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: '#ddd',
                    }}
                  >
                    {comment.type.toUpperCase()}
                  </span>
                </div>

                {/* 內容區 */}
                <div>{comment.content}</div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default CommentOverlay;
