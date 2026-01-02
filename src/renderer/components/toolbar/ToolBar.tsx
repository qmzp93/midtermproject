import { useState, useRef, useEffect, ReactNode } from 'react';
import { ActionButton } from './buttons/ActionButton';
import InteractiveElement from '../InteractiveElement';
import './ToolBar.css';

const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M14.25 5.25L8.25 12l6 6.75L12 18l-6-6 6-6.75z"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M9.75 5.25L15.75 12l-6 6.75L12 18l6-6-6-6.75z"
    />
  </svg>
);

export const ToolBar = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [listWidth, setListWidth] = useState(0);

  useEffect(() => {
    if (listRef.current) {
      setListWidth(listRef.current.offsetWidth);
    }
  }, [open]);

  return (
    <div className="toolbar-container">
      <div
        className="toolbar-slider"
        style={{
          // 動態計算位移，這部分保留 inline style
          transform: open ? 'translateX(0)' : `translateX(${listWidth}px)`,
        }}
      >
        <InteractiveElement>
          <div
            ref={listRef}
            className="toolbar-list"
            style={{
              opacity: open ? 1 : 0, // 配合 CSS transition
            }}
          >
            {children}
          </div>
        </InteractiveElement>

        <InteractiveElement>
          <button
            type="button"
            className="toolbar-toggle-btn"
            onClick={() => setOpen(!open)}
            title={open ? '收起選單' : '展開選單'}
          >
            {open ? <ArrowRightIcon /> : <ArrowLeftIcon />}
          </button>
        </InteractiveElement>
      </div>
    </div>
  );
};

ToolBar.ActionButton = ActionButton;

export default ToolBar;
