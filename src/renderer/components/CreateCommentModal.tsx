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
}

export const CreateCommentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { currentFileName } = useContext(HomContext);

  // 表單狀態
  const [content, setContent] = useState('');
  const [lineNumber, setLineNumber] = useState(1);
  const [type, setType] = useState<'Info' | 'Bug' | 'Todo'>('Info');

  // 【新增】檔案名稱的 State
  const [fileName, setFileName] = useState('');

  // 當 Modal 開啟時，自動帶入當前的檔案名稱
  useEffect(() => {
    if (isOpen) {
      setFileName(currentFileName || '');
      // 如果需要，也可以在這裡重置其他欄位
    }
  }, [isOpen, currentFileName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 建立新註解物件
    const newComment: CommentData = {
      id: `c${Date.now()}`, // 使用時間戳當作唯一 ID
      content,
      fileName,
      line_number: Number(lineNumber),
      type,
    };

    onSave(newComment);

    // 重置表單並關閉
    setContent('');
    onClose();
    window.api.button.OutButton();
  };

  return (
    <InteractiveElement>
      <div className="modal-overlay">
        <div className="modal-content">
          <h3 className="modal-header">新增 AR 註解</h3>

          <form onSubmit={handleSubmit}>
            {/* 類型選擇 */}
            <div style={{ marginBottom: '16px' }}>
              {/* 【修正】將 div 改為 label，讓它包覆整個輸入區域 */}
              <label className="form-group" htmlFor="comment-type">
                {/* 【修正】內層原本的 label 改為 span，避免 label 包 label */}
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
              {/* 【修正】將 div 改為 label */}
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

              {/* 【修正】將 div 改為 label */}
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
            {/* 【修正】將 div 改為 label */}
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
                儲存註解
              </button>
            </div>
          </form>
        </div>
      </div>
    </InteractiveElement>
  );
};

export default CreateCommentModal;
