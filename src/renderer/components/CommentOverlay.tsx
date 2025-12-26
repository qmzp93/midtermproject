// src/renderer/components/CommentOverlay.tsx
import React, { useState, useContext, useEffect } from 'react';
import { HomContext } from '../context/HomContext';
import type { LineNumberResult } from '../hooks/useLineNumberDetector';
import type { BoundingInfo } from '../LineBox';
import type { CommentData } from './CreateCommentModal';
import InteractiveElement from './InteractiveElement';

interface Props {
  detectedLines: LineNumberResult[];
  targetBoundingBox: BoundingInfo;
  externalComments: CommentData[];
  onEdit: (comment: CommentData) => void;
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

const EditIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: '12px', height: '12px' }}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const CommentOverlay: React.FC<Props> = ({
  detectedLines,
  targetBoundingBox,
  externalComments,
  onEdit,
}) => {
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null,
  );

  const { currentFileName } = useContext(HomContext);

  useEffect(() => {
    setSelectedCommentId(null);
  }, [currentFileName]);

  const fileComments = externalComments.filter(
    (c) => c.fileName === currentFileName,
  );

  if (fileComments.length === 0) return null;

  return (
    <>
      {fileComments.map((comment) => {
        const matchedLine = detectedLines.find(
          (l) => l.line_number === comment.line_number,
        );

        if (!matchedLine) return null;

        const absX =
          targetBoundingBox.x + matchedLine.x + matchedLine.width + 20;
        const absY = targetBoundingBox.y + matchedLine.y;

        const isHovered = hoveredCommentId === comment.id;
        const isSelected = selectedCommentId === comment.id;
        const showDetails = isHovered || isSelected;

        return (
          <InteractiveElement>
            <div
              key={comment.id}
              onMouseEnter={() => setHoveredCommentId(comment.id)}
              onMouseLeave={() => setHoveredCommentId(null)}
              style={{
                position: 'absolute',
                left: absX,
                top: absY,
                zIndex: 3000,
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSelected) {
                    setSelectedCommentId(null);
                  } else {
                    setSelectedCommentId(comment.id);
                  }
                }}
                style={{
                  fontSize: '19px',
                  filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
                  transition: 'transform 0.1s',
                  transform: showDetails ? 'scale(1.2)' : 'scale(1)',
                  cursor: 'pointer',
                  // 重置按鈕樣式
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  lineHeight: 1, // 避免按鈕高度撐開
                }}
              >
                {getIcon(comment.type)}
              </button>

              {showDetails && (
                <div
                  style={{
                    position: 'absolute',
                    left: '30px',
                    top: '-10px',
                    backgroundColor: 'rgba(40, 44, 52, 0.95)',
                    color: 'white',
                    border: '1px solid #555',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    minWidth: '200px',
                    maxWidth: '300px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    whiteSpace: 'normal',
                    backdropFilter: 'blur(4px)',
                    zIndex: 3001,
                    cursor: 'text',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: '-6px',
                      top: '16px',
                      width: '0',
                      height: '0',
                      borderTop: '6px solid transparent',
                      borderBottom: '6px solid transparent',
                      borderRight: '6px solid rgba(40, 44, 52, 0.95)',
                    }}
                  />

                  <div
                    style={{
                      borderBottom: '1px solid #666',
                      paddingBottom: '6px',
                      marginBottom: '6px',
                      fontWeight: 'bold',
                      color: '#61dafb',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>Line {comment.line_number}</span>
                    {/* 右側工具區：釘選圖示 + 類型標籤 + 編輯按鈕 */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      {isSelected && (
                        <span style={{ fontSize: '10px' }} title="已釘選">
                          📌
                        </span>
                      )}

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

                      {/* 【新增】編輯按鈕 */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // 避免觸發外層的切換顯示
                          onEdit(comment);
                        }}
                        title="編輯註解"
                        style={{
                          background: 'transparent',
                          border: '1px solid #666',
                          borderRadius: '4px',
                          color: '#ccc',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#555';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <EditIcon />
                      </button>
                    </div>
                  </div>

                  {/* 內容區 */}
                  <div>{comment.content}</div>
                </div>
              )}
            </div>
          </InteractiveElement>
        );
      })}
    </>
  );
};

export default CommentOverlay;
