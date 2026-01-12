import { FiSave } from 'react-icons/fi';

export default function SaveButton({
  onClick,
  children = 'Guardar',
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-save btn-xs font-semibold px-3 py-1 flex items-center gap-1 border border-green-500 text-green-700 bg-green-50 hover:bg-green-100 dark:border-green-400 dark:text-green-300 dark:bg-gray-900 dark:hover:bg-green-900 ${className}`}
      {...props}
    >
      <FiSave /> {children}
    </button>
  );
}
