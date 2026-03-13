import { useState } from "react";
import AccessibilityButton from './Components/AccessibiltyButton'
import AccessibilityPopup from './Components/AccessiblityPopup'
import Navbar from "./Components/Navbar";
import Home from './Components/Home'
import AccessibilityWidget from "./Components/AccessibilityWidgest";


export default function Landing() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F6FA] relative overflow-x-hidden">
        <Navbar/>
        <Home/>
        
        <AccessibilityWidget/>

      <AccessibilityButton open={open} setOpen={setOpen} />

      
      {open && <AccessibilityPopup setOpen={setOpen} />}

      <footer className="bg-blue-600 mt-7 h-3 text-white py-12 text-center">
          <span className="text-center mx-auto">
            &copy; 2025 BetterWeb.Ai All right reserved 
          </span>
      </footer>
    </div>
  );
}
