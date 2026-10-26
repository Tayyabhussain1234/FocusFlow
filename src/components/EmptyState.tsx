import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-[#1B1E21]/60 border border-[#303438] py-14">
      <div className="w-12 h-12 rounded-2xl bg-[#22262A] border border-[#303438] flex items-center justify-center mb-4 text-[#FFD166]">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[#F7F7F5]">{title}</h3>
      <p className="mt-1.5 text-sm text-[#A3A8AE] max-w-sm leading-relaxed">
        {description}
      </p>

      {(actionText || secondaryActionText) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-black bg-gradient-to-r from-[#FFD166] to-[#FF8A00] hover:brightness-110 rounded-xl transition-all shadow-md shadow-[#FF8A00]/20"
            >
              {actionText}
            </button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-[#A3A8AE] hover:text-[#F7F7F5] bg-[#151719] hover:bg-[#22262A] border border-[#303438] rounded-xl transition-colors"
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
