import { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number; // ms
  onClose?: () => void;
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-green-600 border-green-700 text-white',
  error: 'bg-red-600 border-red-700 text-white',
  info: 'bg-blue-600 border-blue-700 text-white'
};

export default function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    if (!duration) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`min-w-[280px] max-w-sm border rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 ${typeStyles[type]}`}>
        <div className="pt-0.5">
          {type === 'success' && (
            <span role="img" aria-label="Success">✅</span>
          )}
          {type === 'error' && (
            <span role="img" aria-label="Error">❌</span>
          )}
          {type === 'info' && (
            <span role="img" aria-label="Info">ℹ️</span>
          )}
        </div>
        <div className="flex-1 text-sm">{message}</div>
        <button
          onClick={onClose}
          className="ml-2 text-white/90 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
