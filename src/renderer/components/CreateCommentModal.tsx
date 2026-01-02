// src/renderer/components/CreateCommentModal.tsx
import React, { useState, useContext, useEffect } from 'react';
import { HomContext } from '../context/HomContext';
import InteractiveElement from './InteractiveElement';
import './CreateCommentModal.css';

// 定義註解的格式
export interface CommentData {
  id: string;
  content: string;
  fileName: string | null;
  line_number: number;
  type: 'Info' | 'Bug' | 'Todo';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CommentData) => void;
  initialData: CommentData | null; // 【新增】接收編輯用的初始資料
}

export const CreateCommentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { currentFileName } = useContext(HomContext);

  const [content, setContent] = useState('');
  const [lineNumber, setLineNumber] = useState(1);
  const [type, setType] = useState<'Info' | 'Bug' | 'Todo'>('Info');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // --- 編輯模式 ---
        setContent(initialData.content);
        setLineNumber(initialData.line_number);
        setType(initialData.type);
        setFileName(initialData.fileName || '');
      } else {
        // --- 新增模式 ---
        setContent('');
        setLineNumber(1);
        setType('Info');
        setFileName(currentFileName || '');
      }
    }
  }, [isOpen, initialData, currentFileName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 建立新註解物件
    const newComment: CommentData = {
      id: initialData ? initialData.id : `c${Date.now()}`,
      content,
      fileName,
      line_number: Number(lineNumber),
      type,
    };

    onSave(newComment);

    // 重置表單並關閉
    setContent('');
    onClose();
  };

  const modeClass = `${type.toLowerCase()}-mode`;

  return (
    <InteractiveElement>
      <div className="modal-overlay">
        {/* 加入動態 class 以切換顏色主題 */}
        <div className={`modal-content ${modeClass}`}>
          <h3 className="modal-header">
            {initialData ? '編輯註解' : '新增 AR 註解'}
          </h3>

          <form onSubmit={handleSubmit}>
            {/* 類型選擇 */}
            <div style={{ marginBottom: '20px' }}>
              <label className="form-group" htmlFor="comment-type">
                <span className="form-label">註解類型</span>
                <select
                  id="comment-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="form-select"
                >
                  <option value="Info">ℹ️ Info (資訊)</option>
                  <option value="Bug">🐞 Bug (錯誤)</option>
                  <option value="Todo">✅ Todo (待辦)</option>
                </select>
              </label>
            </div>

            {/* 檔案名稱 + 行號 */}
            <div className="form-row">
              <label className="form-group flex-2" htmlFor="file-name">
                <span className="form-label">檔案名稱</span>
                <input
                  id="file-name"
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="例如: App.tsx"
                  className="form-input"
                />
              </label>

              <label className="form-group" htmlFor="line-number">
                <span className="form-label">行號</span>
                <input
                  id="line-number"
                  type="number"
                  min="1"
                  value={lineNumber}
                  onChange={(e) => setLineNumber(Number(e.target.value))}
                  className="form-input"
                />
              </label>
            </div>

            {/* 內容輸入 */}
            <label className="form-group" htmlFor="comment-content">
              <span className="form-label">內容描述</span>
              <textarea
                id="comment-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="請輸入註解內容..."
                rows={4}
                className="form-textarea"
              />
            </label>

            {/* 按鈕區 */}
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn-cancel">
                取消
              </button>
              <button type="submit" className="btn-save">
                儲存
              </button>
            </div>
          </form>
        </div>
      </div>
    </InteractiveElement>
  );
};

export default CreateCommentModal;
