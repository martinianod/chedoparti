import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function Accordion({ summary, children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr
        className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setOpen((v) => !v)}
      >
        {summary}
        <td className="p-2 text-right" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-icon dark:text-gray-200"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Cerrar detalles' : 'Ver detalles'}
          >
            {open ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </td>
      </tr>
      {open && (
        <tr className="bg-gray-50 dark:bg-gray-900">
          <td colSpan={summary.props.children.length + 2} className="p-4 dark:text-gray-100">
            {children}
          </td>
        </tr>
      )}
    </>
  );
}
