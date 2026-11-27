import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const WIDTHS = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-xl', xl: 'max-w-2xl' };

/** Shared modal shell: overlay, panel, close button, header with icon. Closes on Escape. */
export function Modal({ isOpen, onClose, title, subtitle, icon: Icon, iconClass = 'bg-[#0F3B3F] text-white', size = 'lg', headerAction, children }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-white/95 backdrop-blur-2xl border border-white/70 rounded-t-[24px] sm:rounded-[28px] ${WIDTHS[size]} w-full p-5 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl relative text-[#1F2A2E] max-h-[90vh] sm:max-h-[92vh] overflow-y-auto overscroll-contain`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pr-10">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconClass}`}>
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-[#1F2A2E]">{title}</h3>
              {subtitle && <p className="text-xs text-[#8A9AA0]">{subtitle}</p>}
            </div>
          </div>
          {headerAction}
        </div>

        {children}
      </div>
    </div>
  );
}
