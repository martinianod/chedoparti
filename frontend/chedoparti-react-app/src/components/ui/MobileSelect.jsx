import React, { Fragment, useState, useEffect } from 'react';
import { Listbox, Transition, Dialog } from '@headlessui/react';
import { Check, ChevronDown, X } from 'lucide-react';

/**
 * MobileSelect Component
 * 
 * Provides a responsive select experience:
 * - Desktop: Standard dropdown
 * - Mobile: Bottom sheet (Action Sheet style)
 * 
 * @param {Object} props
 * @param {any} props.value - Selected value
 * @param {function} props.onChange - Change handler
 * @param {Array<{value: any, label: string}>} props.options - Array of options
 * @param {string} [props.label] - Label text
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.disabled] - Disabled state
 * @param {string} [props.className] - Extra classes
 */
export default function MobileSelect({
  value,
  onChange,
  options = [],
  label,
  placeholder = 'Seleccionar...',
  disabled = false,
  className = '',
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const selectedOption = options.find(opt => opt.value == value);

  // Handle selection (closes modal on mobile)
  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between
            px-3 py-2 text-left
            border border-gray-300 dark:border-gray-600 rounded-lg
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span className="block truncate">
            {selectedOption ? selectedOption.label : <span className="text-gray-400">{placeholder}</span>}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
        </button>

        {/* Mobile Bottom Sheet Modal */}
        <Transition show={isOpen} as={Fragment}>
          <Dialog 
            as="div" 
            className="relative z-[60]" 
            onClose={() => setIsOpen(false)}
          >
            {/* Backdrop */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50" />
            </Transition.Child>

            <div className="fixed inset-x-0 bottom-0 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center text-center">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-y-full"
                  enterTo="translate-y-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-y-0"
                  leaveTo="translate-y-full"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-t-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                      >
                        {label || placeholder}
                      </Dialog.Title>
                      <button
                        type="button"
                        className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsOpen(false)}
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    <div className="mt-2 space-y-2 max-h-[60vh] overflow-y-auto pb-safe">
                      {options.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSelect(option.value)}
                          className={`
                            w-full flex items-center justify-between p-4 rounded-xl text-left transition-colors
                            ${String(value) === String(option.value)
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-1 ring-blue-700/10' 
                              : 'bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}
                          `}
                        >
                          <span className="font-medium">{option.label}</span>
                          {String(value) === String(option.value) && (
                            <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    );
  }

  // Desktop Dropdown (Headless UI Listbox)
  return (
    <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative mt-1">
          <Listbox.Button className={`
            relative w-full cursor-pointer
            bg-white dark:bg-gray-800 
            py-2 pl-3 pr-10 text-left 
            border border-gray-300 dark:border-gray-600 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            sm:text-sm
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            <span className="block truncate text-gray-900 dark:text-white">
              {selectedOption ? selectedOption.label : <span className="text-gray-400">{placeholder}</span>}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((person, personIdx) => (
                <Listbox.Option
                  key={personIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                    }`
                  }
                  value={person.value}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {person.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
