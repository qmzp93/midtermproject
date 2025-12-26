import React, { useContext, useEffect, useState } from 'react';
import { KeyCode } from '@ar-project/host-object-model';
import { HomContext } from './context/HomContext';
import { ToolBar } from './components/toolbar/ToolBar';
import { LineBox } from './LineBox';

import {
  CreateCommentModal,
  CommentData,
} from './components/CreateCommentModal';
import { QueryCommentModal } from './components/QueryCommentModal';
import initialComments from './data/comments.json';

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const HelloWorld = () => {
  const { venomInstance, setSubscribedHost, subscribedHostInstance } =
    useContext(HomContext);

  // 管理 Create Modal 開關
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // 【新增】管理 Query Modal 開關
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);

  // 【新增】記錄當前正在編輯的註解 (如果是 null 代表是新增模式)
  const [editingComment, setEditingComment] = useState<CommentData | null>(
    null,
  );

  //  管理所有註解的 State (初始值來自 json 檔案)
  const [comments, setComments] = useState<CommentData[]>(
    initialComments as CommentData[],
  );

  useEffect(() => {
    const initializeSubscribedHost = async () => {
      if (venomInstance && !subscribedHostInstance) {
        await setSubscribedHost();
      }
    };

    initializeSubscribedHost();
  }, [venomInstance, subscribedHostInstance, setSubscribedHost]);

  const handleSaveComment = async (savedData: CommentData) => {
    // eslint-disable-next-line no-console
    console.log('儲存註解:', savedData);

    // 檢查 ID 是否已存在
    const exists = comments.some((c) => c.id === savedData.id);
    let updatedComments: CommentData[];

    if (exists) {
      // 編輯模式：取代舊資料
      updatedComments = comments.map((c) =>
        c.id === savedData.id ? savedData : c,
      );
    } else {
      // 新增模式：加入陣列
      updatedComments = [...comments, savedData];
    }

    setComments(updatedComments);

    if (window.api && window.api.saveComments) {
      window.api.saveComments(updatedComments);
    } else {
      // eslint-disable-next-line no-console
      console.warn('未偵測到 saveComments API，註解僅暫存於記憶體中。');
    }

    // 儲存後清空編輯狀態
    setEditingComment(null);
  };

  // 【新增】處理點擊編輯按鈕的行為
  const handleEditClick = (comment: CommentData) => {
    setEditingComment(comment); // 設定要編輯的資料
    setIsQueryModalOpen(false); // 關閉查詢視窗
    setIsCreateModalOpen(true); // 打開編輯(新增)視窗
  };

  const handleJumpClick = async (comment: CommentData) => {
    if (!venomInstance || !comment.fileName) return;

    setIsQueryModalOpen(false);
    window.api.button.OutButton();

    try {
      if (subscribedHostInstance) {
        await subscribedHostInstance.focus();
      }

      // --- 步驟 1: 開啟檔案 (Ctrl + P) ---
      await venomInstance.key(KeyCode.Ctrl, KeyCode.P);
      await sleep(300); // 等待搜尋框出現

      // 只輸入檔名
      await venomInstance.keyInput(comment.fileName);
      await sleep(300);

      await venomInstance.key(KeyCode.Enter); // 確認開啟檔案

      await sleep(500);

      // --- 步驟 2: 跳轉行數 (Ctrl + G) ---
      await venomInstance.key(KeyCode.Ctrl, KeyCode.G);
      await sleep(300); // 等待行號輸入框出現

      await venomInstance.keyInput(comment.line_number.toString());
      await sleep(300);

      await venomInstance.key(KeyCode.Enter); // 確認跳轉
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Auto-jump failed:', error);
    }
  };

  return (
    <>
      <LineBox comments={comments} onEdit={handleEditClick} />

      {/* 7. 放入 Modal 元件 */}
      <CreateCommentModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingComment(null); // 關閉時記得清空編輯狀態，不然下次打開會殘留
          // window.api.button.OutButton();
        }}
        onSave={handleSaveComment}
        initialData={editingComment} // 【新增】傳入初始資料
      />
      {/* 【新增】查詢註解 Modal */}
      <QueryCommentModal
        isOpen={isQueryModalOpen}
        onClose={() => {
          setIsQueryModalOpen(false);
          window.api.button.OutButton();
        }}
        comments={comments}
        onEdit={handleEditClick}
        onJump={handleJumpClick}
      />

      <ToolBar>
        <ToolBar.ActionButton
          label="Create"
          onClick={async () => {
            setEditingComment(null); // 確保是新增模式
            setIsCreateModalOpen(true); // 打開 Modal
          }}
        />
        <ToolBar.ActionButton
          label="Query"
          onClick={async () => {
            setIsQueryModalOpen(true);
          }}
        />
        <ToolBar.ActionButton
          label="Close"
          onClick={async () => {
            // eslint-disable-next-line no-console
            console.log('Settings button clicked');
            window.api.event.CloseWindow();
          }}
        />
      </ToolBar>
    </>
  );
};

export default HelloWorld;
