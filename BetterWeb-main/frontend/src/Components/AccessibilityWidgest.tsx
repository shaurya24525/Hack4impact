


// AccessibilityWidget.tsx
import { useState } from "react";
import { X,
   Accessibility,
  Type,
  Contrast,
  EyeOff,
  MousePointer2,
  Volume2,
  Palette,
  AlignLeft,
  Ruler,
  BookOpen,
  RefreshCw,
  Move
 } from "lucide-react";

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Accessibility Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl transition-all hover:bg-blue-700 hover:scale-110"
        aria-label="Accessibility Menu"
      >
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <path d="M9 12h6M12 9v6" />
          <path d="m7 17 5-4 5 4" />
        </svg>
      </button>

      {/* Popup - Exact Match */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />

          {/* Main Popup */}
          <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[92vw] rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Accessibility Menu 
                {/* <span className="text-sm font-normal text-gray-500">(CTRL+U)</span> */}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 transition hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto p-6">
              {/* Language Bar */}
              <div className="mb-6 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    US
                  </div>
                  <span className="text-sm font-medium text-gray-700">English (USA)</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">×</button>
              </div>

              {/* Grid: 2 per row */}
              <div className="grid grid-cols-2 gap-4">
               
               <ToggleButton icon={<Contrast className="h-6 w-6" />} label="Smart Contrast" />
                <ToggleButton icon={<EyeOff className="h-6 w-6 hidden" />} label="Pause Animations" />
                 <ToggleButton icon={<Volume2 className="h-6 w-6" />} label="Screen Reader" />


                <ToggleButton active icon={<Volume2 className="h-scale-x-100 h-7 w-7" />} label="Voice Navigation" />
                <ToggleButton icon={<Palette className="h-6 w-6" />} label="Contrast +" />
                 <ToggleButton icon={<AlignLeft className="h-6 w-6" />} label="Highlight Links" />

                {/* Row 3 */}
                <ToggleButton icon={<Type className="h-7 w-7" />} label="Bigger Text" />
                <ToggleButton icon={<Ruler className="h-6 w-6" />} label="Text Spacing" />
                 <ToggleButton icon={<EyeOff className="h-6 w-6" />} label="Hide Images" />

                {/* Row 4 */}
                 <ToggleButton icon={<BookOpen className="h-7 w-7" />} label="Dyslexia Friendly" />
                 <ToggleButton icon={<MousePointer2 className="h-6 w-6" />} label="Cursor" />
              

                 {/* Row 5 */}
                 <ToggleButton icon={<AlignLeft className="h-6 w-6" />} label="Page Structure" />
                <ToggleButton icon={<Ruler className="h-6 w-6" />} label="Line Height" />
                 <ToggleButton icon={<AlignLeft className="h-6 w-6" />} label="Text Align" />

                
                {/* Low Saturation - Full Width */}
                <div className="col-span-2 rounded-2xl border-2 border border-blue-500 bg-blue-50 p-5 text-center">
                  <div className="mx-auto mb-3 h-12 w-12 text-blue-600">
                    <PaletteIcon />
                  </div>
                  <p className="mb-3 text-sm font-semibold text-gray-800">Low Saturation</p>
                  <input
                    type="range"
                    className="w-full accent-blue-600"
                    defaultValue={35}
                  />
                </div>
              </div>

              {/* Reset Button */}
              <button className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 py-4 text-white transition hover:bg-blue-700">
                <RefreshCw className="h-5 w-5" />
                <span className="font-medium">Reset All Accessibility Settings</span>
              </button>

            </div>
          </div>
        </>
      )}
    </>
  );
}

// Reusable Feature Card
function Feature({ icon, label, active = false }: { icon?: string; label: string; active?: boolean }) {
  return (
    <button
      className={`
        flex flex-col items-center justify-center rounded-2xl border p-5 transition-all
        ${active 
          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md" 
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
        }
      `}
    >
      <div className="mb-3 text-3xl">
        {getIcon(icon, active)}
      </div>
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </button>
  );
}

// Simple SVG Icons (exact match to your screenshot)
function getIcon(name?: string, active = false) {
  switch (name) {
    case "MagnifyingGlassPlus": return <ContrastIcon />;
    case "Pause": return <PauseIcon />;
    case "Volume": return <ScreenReaderIcon />;
    case "Voice Navigation": return <VoiceIcon active={active} />;
    case "Contrast": return <HighContrastIcon />;
    case "Link": return <LinkIcon />;
    case "TextSize": return <BiggerTextIcon />;
    case "Spacing": return <TextSpacingIcon />;
    case "Off": return <HideImagesIcon />;
    case "Dyslexia": return <DyslexiaIcon />;
    case "Cursor": return <CursorIcon />;
    case "Info": return <span className="text-2xl">i</span>;
    case "Structure": return <PageStructureIcon />;
    case "LineHeight": return <LineHeightIcon />;
    case "Align": return <TextAlignIcon />;
    case "Dictionary": return <DictionaryIcon active={active} />;
    default: return <div className="h-8 w-8 rounded bg-gray-300" />;
  }
}

// Icon Components (SVG)
const ContrastIcon = () => <div className="h-8 w-8 rounded-full bg-black" />;
const PauseIcon = () => <span className="text-4xl">⏸</span>;
const ScreenReaderIcon = () => <span className="text-4xl">🔊</span>;
const VoiceIcon = ({ active }: { active: boolean }) => (
  <span className={`text-5xl ${active ? "text-blue-600" : ""}`}>🎤</span>
);
const HighContrastIcon = () => <div className="h-8 w-8 rounded-full bg-gray-800" />;
const LinkIcon = () => <span className="text-4xl">🔗</span>;
const BiggerTextIcon = () => <span className="text-4xl font-bold">T</span>;
const TextSpacingIcon = () => <span className="text-4xl">↔</span>;
const HideImagesIcon = () => <span className="text-4xl">🚫</span>;
const DyslexiaIcon = () => <span className="text-4xl font-bold">Df</span>;
const CursorIcon = () => <span className="text-4xl">➤</span>;
const PageStructureIcon = () => <span className="text-4xl">📑</span>;
const LineHeightIcon = () => <span className="text-4xl">↕</span>;
const TextAlignIcon = () => <span className="text-4xl">≡</span>;
const DictionaryIcon = ({ active }: { active: boolean }) => (
  <span className={`text-5xl font-bold ${active ? "text-blue-600" : ""}`}>A</span>
);
const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="12" cy="18" r="4" />
  </svg>
);


function ToggleButton({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`
        flex flex-col items-center justify-center rounded-xl border p-4 transition
        ${
          active
            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
            : "border-gray-200 bg-white hover:bg-gray-50"
        }
      `}
    >
      {icon}
      <div className="mt-2 text-xs font-medium">{label}</div>
    </button>
  );
}