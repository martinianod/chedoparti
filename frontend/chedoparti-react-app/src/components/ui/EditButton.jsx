import { FiEdit2 } from 'react-icons/fi';

export default function EditButton({
  onClick,
  children = 'Editar',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-edit btn-xs font-semibold px-3 py-1 flex items-center gap-1 border border-yellow-500 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-400 dark:text-yellow-300 dark:bg-gray-900 dark:hover:bg-yellow-900 ${className}`}
      {...props}
    >
      <FiEdit2 /> {children}
    </button>
  );
}
