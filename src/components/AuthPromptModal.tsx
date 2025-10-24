// components/AuthPromptModal.tsx
"use client";

export default function AuthPromptModal({ show, onClose, onLogin }: any) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
        <h2 className="text-lg font-semibold mb-2">Login Required</h2>
        <p className="text-gray-600 mb-4">You need to log in to add this item to your bag.</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onLogin}
            className="bg-[var(--brand-primary)] text-white px-4 py-2 rounded hover:opacity-90"
          >
            Login
          </button>
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
