import { FiEye } from 'react-icons/fi';

export default function ViewButton({
  onClick,
  children = 'Ver',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-view btn-xs font-semibold px-3 py-1 flex items-center gap-1 border border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-300 dark:bg-gray-900 dark:hover:bg-blue-900 ${className}`}
      {...props}
    >
      <FiEye /> {children}
    </button>
  );
}
