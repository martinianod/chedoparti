import { X } from 'lucide-react';

export default function CancelButton({
  onClick,
  children = 'Cancelar',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-cancel btn-xs font-semibold px-3 py-1 flex items-center gap-1 border border-red-600 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 dark:border-red-500 dark:text-red-400 dark:bg-navy-900 dark:hover:bg-red-900/20 dark:focus:ring-offset-navy-800 transition-all duration-200 ${className}`}
      {...props}
    >
      <X className="w-3 h-3" />
      {children}
    </button>
  );
}
