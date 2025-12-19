// src/renderer/components/QueryCommentModal.tsx
import React, { useState, useMemo } from 'react';
import InteractiveElement from './InteractiveElement';
import { CommentData } from './CreateCommentModal';
import './QueryCommentModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  comments: CommentData[];
}

export const QueryCommentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  comments,
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
          {/* Header */}
          <div className="query-header">
            <span>註解查詢儀表板 ({displayComments.length})</span>
            {/* 【修正】加入 type="button" */}
            <button
              type="button"
              onClick={onClose}
              className="modal-close-btn"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Controls: Filter & Sort */}
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

          {/* Comment List */}
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
                <div key={item.id} className="comment-item">
                  <div className="comment-item-header">
                    <span className="comment-file-info">
                      {item.fileName || 'Unknown File'} : {item.line_number}
                    </span>
                    <span
                      className={`comment-type-badge ${getBadgeClass(item.type)}`}
                    >
                      {getIcon(item.type)} {item.type}
                    </span>
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
