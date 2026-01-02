// src/renderer/components/CommentOverlay.tsx
import React, { useState, useContext, useEffect } from 'react';
import { HomContext } from '../context/HomContext';
import type { LineNumberResult } from '../hooks/useLineNumberDetector';
import type { BoundingInfo } from '../LineBox';
import type { CommentData } from './CreateCommentModal';
import InteractiveElement from './InteractiveElement';
import './CommentOverlay.css';

interface Props {
  detectedLines: LineNumberResult[];
  targetBoundingBox: BoundingInfo;
  externalComments: CommentData[];
  onEdit: (comment: CommentData) => void;
  onDelete: (id: string) => void;
}

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
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const CommentOverlay: React.FC<Props> = ({
  detectedLines,
  targetBoundingBox,
  externalComments,
  onEdit,
  onDelete,
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
          targetBoundingBox.x + matchedLine.x + matchedLine.width + 7;
        const absY = targetBoundingBox.y + matchedLine.y;

        const isHovered = hoveredCommentId === comment.id;
        const isSelected = selectedCommentId === comment.id;
        const showDetails = isHovered || isSelected;

        return (
          <div
            key={comment.id}
            className="comment-overlay-container"
            onMouseEnter={() => setHoveredCommentId(comment.id)}
            onMouseLeave={() => setHoveredCommentId(null)}
            style={{
              left: absX,
              top: absY,
            }}
          >
            {/* 主圖示按鈕 */}
            <InteractiveElement>
              <button
                type="button"
                className={`comment-toggle-btn ${showDetails ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSelected) {
                    setSelectedCommentId(null);
                  } else {
                    setSelectedCommentId(comment.id);
                  }
                }}
              >
                {getIcon(comment.type)}
              </button>

              {/* 詳細資訊彈窗 */}
              {showDetails && (
                // 【修改】加入動態 class 根據 type 套用對應的漸層主題
                <div
                  className={`comment-tooltip ${comment.type.toLowerCase()}-theme`}
                >
                  <div className="tooltip-arrow" />
                  {isSelected && (
                    <span className="pin-icon" title="已釘選">
                      📌
                    </span>
                  )}
                  <div className="tooltip-header">
                    <div className="header-left">
                      <span className="type-badge">{comment.type}</span>
                    </div>

                    <div className="header-right">
                      <span className="line-number">
                        Line {comment.line_number}
                      </span>

                      <button
                        type="button"
                        className="action-btn edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(comment);
                        }}
                        title="編輯註解"
                      >
                        <EditIcon />
                      </button>

                      <button
                        type="button"
                        className="action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(comment.id);
                        }}
                        title="刪除註解"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>

                  <div className="tooltip-content">{comment.content}</div>
                </div>
              )}
            </InteractiveElement>
          </div>
        );
      })}
    </>
  );
};

export default CommentOverlay;
