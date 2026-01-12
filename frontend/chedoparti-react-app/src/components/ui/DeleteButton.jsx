import { FiTrash2 } from 'react-icons/fi';

export default function DeleteButton({
  onClick,
  children = 'Eliminar',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-accent btn-xs font-semibold px-3 py-1 flex items-center gap-1 border border-gold text-navy bg-gold hover:bg-gold/90 dark:border-gold dark:text-navy dark:bg-gold dark:hover:bg-gold/80 ${className}`}
      {...props}
    >
      <FiTrash2 /> {children}
    </button>
  );
}
