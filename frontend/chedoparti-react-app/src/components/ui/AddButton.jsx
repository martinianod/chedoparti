import { FiPlus } from 'react-icons/fi';

export default function AddButton({
  onClick,
  children = 'Agregar',
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
      className={`btn btn-add btn-xs font-semibold px-3 py-1 flex items-center gap-1 border border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-300 dark:bg-gray-900 dark:hover:bg-blue-900 ${className}`}
      {...props}
    >
      <FiPlus /> {children}
    </button>
  );
}
