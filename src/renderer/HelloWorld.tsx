import React, { useContext, useEffect, useState } from 'react';
import { HomContext } from './context/HomContext';
import { ToolBar } from './components/toolbar/ToolBar';
import { LineBox } from './LineBox';
import {
  CreateCommentModal,
  CommentData,
} from './components/CreateCommentModal';
import initialComments from './data/comments.json';

export const HelloWorld = () => {
  const { venomInstance, setSubscribedHost, subscribedHostInstance } =
    useContext(HomContext);

  // 管理 Modal 開關的 State
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // 5. 【新增】處理儲存註解的邏輯
  const handleSaveComment = async (newComment: CommentData) => {
    console.log('新增註解:', newComment);

    // A. 更新 React 畫面 (即時顯示)
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);

    // B. 寫入檔案系統
    if (window.api && window.api.saveComments) {
      window.api.saveComments(updatedComments);
    } else {
      console.warn(
        '未偵測到 saveComments API，註解僅暫存於記憶體中，重整後會消失。',
      );
    }
  };

  return (
    <>
      {/* 6. 將最新的 comments 傳遞給 LineBox */}
      <LineBox comments={comments} />

      {/* 7. 放入 Modal 元件 */}
      <CreateCommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveComment}
      />

      <ToolBar>
        <ToolBar.ActionButton
          label="Create"
          onClick={async () => {
            // eslint-disable-next-line no-console
            setIsModalOpen(true); // 打開 Modal
          }}
        />
        <ToolBar.ActionButton
          label="Stop"
          onClick={async () => {
            // eslint-disable-next-line no-console
            console.log('Stop button clicked');
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
