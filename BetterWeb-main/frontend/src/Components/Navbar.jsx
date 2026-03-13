"use client";
import React, { useState, useEffect } from "react";
import Logo from "../assets/logo.svg";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNav, setShowNav] = useState(false);

  const links = [
    { name: "Pricing", href: "/pricing" },
    { name: "Features", href: "#features" },
    { name: "Demo", href: "#demo" },
    { name: "How it works", href: "#how-it-works" },
  ];

  useEffect(() => {
    const scrollHandler = () => setShowNav(window.scrollY > 10);
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50
          flex items-center justify-between px-6 py-3 w-[92%] md:w-[78%]
          rounded-3xl border bg-white/80 shadow-sm backdrop-blur-xl
          transition-all duration-300
          ${showNav ? "opacity-100" : "opacity-0"}
        `}
      >
        {/* LOGO + MOBILE MENU */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <span className="text-3xl">✕</span>
            ) : (
              <span className="text-3xl">☰</span>
            )}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={Logo} alt="logo" className="w-8 h-8 object-cover" />
            <span className="text-blue-700 font-bold text-xl">
              BetterWeb AI
            </span>
          </div>
        </div>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-6 text-gray-600 text-lg">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="hover:text-blue-700 transition font-medium"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* BUTTONS */}
        <div className="hidden md:flex items-center gap-3">
          <button className="px-4 py-2 border border-blue-600 text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition">
            Install
          </button>

          <button className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Get Started
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isOpen && (
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[92%] bg-white 
          text-gray-700 rounded-2xl border shadow-lg backdrop-blur-xl py-6 
          flex flex-col items-center gap-6 z-40 md:hidden"
        >
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium hover:text-blue-700"
            >
              {link.name}
            </a>
          ))}

          <button className="w-40 py-2 border border-blue-600 text-blue-700 rounded-lg">
            Install
          </button>

          <button className="w-40 py-2 bg-blue-600 text-white rounded-lg">
            Get Started
          </button>
        </div>
      )}
    </>
  );
}
