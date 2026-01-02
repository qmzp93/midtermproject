interface IActionButtonProps {
  label: string;
  onClick: () => void | Promise<void>;
}

export const ActionButton = ({ label, onClick }: IActionButtonProps) => (
  <button type="button" className="toolbar-action-btn" onClick={onClick}>
    {label}
  </button>
);

export default ActionButton;
