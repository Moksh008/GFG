import React, { useCallback, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ToastContext } from './toast-context';

/** Global toast: call `showToast(message)` or `showToast(message, 'error')`. */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback((message, variant = 'success') => {
    clearTimeout(timer.current);
    setToast({ message, variant });
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] bg-[#0F3B3F] text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs border border-white/20 max-w-sm"
        >
          {toast.variant === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-[#F2C98A] shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#2FBF71] shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}
