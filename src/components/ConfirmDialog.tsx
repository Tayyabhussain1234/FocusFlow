import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmDialog: React.FC = () => {
  const { confirmDialog, closeConfirmDialog } = useApp();
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirmDialog.isOpen) {
      cancelBtnRef.current?.focus();
    }
  }, [confirmDialog.isOpen]);

  if (!confirmDialog.isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#1B1E21] border border-[#303438] p-6 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF7373]/10 border border-[#FF7373]/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#FF7373]" />
            </div>
            <h2 id="confirm-dialog-title" className="text-lg font-bold text-[#F7F7F5]">
              {confirmDialog.title || 'Confirm Action'}
            </h2>
          </div>
          <button
            onClick={closeConfirmDialog}
            className="text-[#A3A8AE] hover:text-[#F7F7F5] transition-colors p-1 rounded-lg"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-[#A3A8AE] leading-relaxed">
          {confirmDialog.message}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={closeConfirmDialog}
            className="px-4 py-2 text-sm font-medium text-[#A3A8AE] hover:text-[#F7F7F5] bg-[#151719] hover:bg-[#22262A] border border-[#303438] rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDialog.onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#FF7373] hover:bg-[#e65a5a] rounded-xl shadow-lg shadow-[#FF7373]/20 transition-colors"
          >
            {confirmDialog.confirmText || 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
