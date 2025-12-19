import React, { useContext, useEffect, useState } from 'react';
import { HomContext } from './context/HomContext';
import { ToolBar } from './components/toolbar/ToolBar';
import { LineBox } from './LineBox';
import {
  CreateCommentModal,
  CommentData,
} from './components/CreateCommentModal';
import { QueryCommentModal } from './components/QueryCommentModal';
import initialComments from './data/comments.json';

export const HelloWorld = () => {
  const { venomInstance, setSubscribedHost, subscribedHostInstance } =
    useContext(HomContext);

  // 管理 Create Modal 開關
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // 【新增】管理 Query Modal 開關
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);

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

  // 處理儲存註解的邏輯
  const handleSaveComment = async (newComment: CommentData) => {
    // eslint-disable-next-line no-console
    console.log('新增註解:', newComment);

    // A. 更新 React 畫面 (即時顯示)
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);

    // B. 寫入檔案系統
    if (window.api && window.api.saveComments) {
      window.api.saveComments(updatedComments);
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        '未偵測到 saveComments API，註解僅暫存於記憶體中，重整後會消失。',
      );
    }
  };

  return (
    <>
      {/* AR 顯示層 (包含 LineBox 和 CommentOverlay) */}
      <LineBox comments={comments} />

      {/* 7. 放入 Modal 元件 */}
      <CreateCommentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveComment}
      />
      {/* 【新增】查詢註解 Modal */}
      <QueryCommentModal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        comments={comments} // 將目前的註解資料傳進去
      />

      <ToolBar>
        <ToolBar.ActionButton
          label="Create"
          onClick={async () => {
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
