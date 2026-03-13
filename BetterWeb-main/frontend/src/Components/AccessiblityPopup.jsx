export default function AccessibilityPopup({ open, setOpen }) {
  if (!open) return null;

  return (
    <div className="fixed bottom-24 right-6 w-64 bg-white p-5 rounded-lg shadow-xl border">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">
        Accessibility Options
      </h3>

      <div className="space-y-3 text-sm">
        <button className="w-full p-2 border rounded hover:bg-gray-100">
          Increase Font Size
        </button>
        <button className="w-full p-2 border rounded hover:bg-gray-100">
          High Contrast Mode
        </button>
        <button className="w-full p-2 border rounded hover:bg-gray-100">
          Dyslexia Font
        </button>
      </div>

      <button
        onClick={() => setOpen(false)}
        className="mt-4 text-xs text-red-500 underline"
      >
        Close
      </button>
    </div>
  );
}
