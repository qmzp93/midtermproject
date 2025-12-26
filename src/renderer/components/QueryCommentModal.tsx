// src/renderer/components/QueryCommentModal.tsx
import React, { useState, useMemo } from 'react';
import InteractiveElement from './InteractiveElement';
import { CommentData } from './CreateCommentModal';
import './QueryCommentModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  comments: CommentData[];
  onEdit: (comment: CommentData) => void;
  onJump: (comment: CommentData) => void;
}

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

export const QueryCommentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  comments,
  onEdit,
  onJump,
}) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<string>('Default');

  const displayComments = useMemo(() => {
    let result = comments.filter((c) => {
      if (filterType === 'All') return true;
      return c.type === filterType;
    });

    result = [...result].sort((a, b) => {
      if (sortOrder === 'FileName') {
        const fileCompare = (a.fileName || '').localeCompare(b.fileName || '');
        if (fileCompare !== 0) return fileCompare;
        return a.line_number - b.line_number;
      }

      if (sortOrder === 'Type') {
        const typeCompare = a.type.localeCompare(b.type);
        if (typeCompare !== 0) return typeCompare;

        const fileCompare = (a.fileName || '').localeCompare(b.fileName || '');
        if (fileCompare !== 0) return fileCompare;

        return a.line_number - b.line_number;
      }

      return 0;
    });

    return result;
  }, [comments, filterType, sortOrder]);

  if (!isOpen) return null;

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'Bug':
        return 'badge-bug';
      case 'Todo':
        return 'badge-todo';
      default:
        return 'badge-info';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Bug':
        return '🐞';
      case 'Todo':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <InteractiveElement>
      <div className="query-modal-overlay">
        <div className="query-modal-content">
          <div className="query-header">
            <span>註解查詢儀表板 ({displayComments.length})</span>
            <button
              type="button"
              onClick={onClose}
              className="modal-close-btn"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="query-controls">
            <div className="control-group">
              <span className="control-label">篩選類型:</span>
              <select
                className="control-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All">全部 (All)</option>
                <option value="Info">Info</option>
                <option value="Bug">Bug</option>
                <option value="Todo">Todo</option>
              </select>
            </div>

            <div className="control-group">
              <span className="control-label">排序方式:</span>
              <select
                className="control-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="Default">預設 (Default)</option>
                <option value="FileName">依照檔案名稱 (File Name)</option>
                <option value="Type">依照註解類型 (Type)</option>
              </select>
            </div>
          </div>

          <div className="comment-list">
            {displayComments.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: '#666',
                  marginTop: '20px',
                }}
              >
                沒有符合條件的註解
              </div>
            ) : (
              displayComments.map((item) => (
                <div
                  key={item.id}
                  className="comment-item"
                  // 【修正】加入 role 與 tabIndex 支援鍵盤聚焦
                  role="button"
                  tabIndex={0}
                  onClick={() => onJump(item)}
                  // 【修正】加入鍵盤事件支援
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onJump(item);
                    }
                  }}
                  title="點擊以跳轉至程式碼"
                >
                  <div className="comment-item-header">
                    <span className="comment-file-info">
                      {item.fileName || 'Unknown File'} : {item.line_number}
                    </span>

                    <div className="comment-right-group">
                      <span
                        className={`comment-type-badge ${getBadgeClass(item.type)}`}
                      >
                        {getIcon(item.type)} {item.type}
                      </span>
                      <button
                        type="button"
                        className="comment-edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        title="編輯註解"
                      >
                        <EditIcon />
                      </button>
                    </div>
                  </div>
                  <div className="comment-content">{item.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </InteractiveElement>
  );
};

export default QueryCommentModal;
