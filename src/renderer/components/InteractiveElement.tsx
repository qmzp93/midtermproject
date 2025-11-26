import { ReactNode } from 'react';

const InteractiveElement = ({ children }: { children: ReactNode }) => {
  const handleMouseEnter = () => {
    window.api.button.EnterButton();
  };

  const handleMouseLeave = () => {
    window.api.button.OutButton();
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }}
    >
      {children}
    </div>
  );
};

export default InteractiveElement;
