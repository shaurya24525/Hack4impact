export default function AccessibilityButton({ open, setOpen }) {
  return (
    <button
      onClick={() => setOpen(true)}
      className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 flex items-center 
                 justify-center rounded-full shadow-xl hover:bg-blue-700 transition"
    >
      <span className="text-3xl">♿</span>
    </button>
  );
}
