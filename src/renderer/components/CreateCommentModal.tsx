// src/renderer/components/CreateCommentModal.tsx
import React, { useState, useContext } from 'react';
import { HomContext } from '../context/HomContext';
import InteractiveElement from './InteractiveElement';

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
  // 表單狀態
  const [content, setContent] = useState('');
  const [lineNumber, setLineNumber] = useState(1);
  const [type, setType] = useState<'Info' | 'Bug' | 'Todo'>('Info');
  const { currentFileName } = useContext(HomContext);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 建立新註解物件
    const newComment: CommentData = {
      id: `c${Date.now()}`, // 使用時間戳當作唯一 ID
      content,
      fileName: currentFileName, // 目前先固定，未來可改成動態
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
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          // 【關鍵修正】: 啟用滑鼠事件，防止點擊穿透到底下的 VSCode
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            backgroundColor: '#2d2d2d',
            padding: '20px',
            borderRadius: '8px',
            width: '300px',
            color: 'white',
            border: '1px solid #444',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#61dafb' }}>新增註解</h3>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            {/* 註解類型 */}
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '12px',
              }}
            >
              類型
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '5px',
                  borderRadius: '4px',
                  backgroundColor: '#444',
                  color: 'white',
                  border: 'none',
                  marginTop: '5px',
                }}
              >
                <option value="Info">Info (ℹ️)</option>
                <option value="Bug">Bug (🐞)</option>
                <option value="Todo">Todo (✅)</option>
              </select>
            </label>

            {/* 行號 */}
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '12px',
              }}
            >
              行號
              <input
                type="number"
                value={lineNumber}
                onChange={(e) => setLineNumber(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '5px',
                  borderRadius: '4px',
                  backgroundColor: '#444',
                  color: 'white',
                  border: 'none',
                  marginTop: '5px',
                }}
              />
            </label>

            {/* 內容 */}
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '12px',
              }}
            >
              內容
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '5px',
                  borderRadius: '4px',
                  backgroundColor: '#444',
                  color: 'white',
                  border: 'none',
                  resize: 'none',
                  marginTop: '5px',
                }}
              />
            </label>

            {/* 按鈕區 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '10px',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid #666',
                  background: 'transparent',
                  color: '#ccc',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                type="submit"
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#61dafb',
                  color: '#000',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
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
