"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldAlert, Cpu } from "lucide-react";
import InquiryModal from "./InquiryModal";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Our Work", href: "/gallery" },
    { name: "Contact", href: "/#contact" },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-7xl rounded-xl transition-all duration-300 ${
          scrolled
            ? "glass-container border-white/10 py-3 shadow-xl"
            : "bg-transparent py-5 border-transparent"
        }`}
      >
        <div className="mx-auto px-6 md:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-[#00e3fd] to-[#2380ff] shadow-[0_0_12px_rgba(0,229,255,0.3)]">
              <Cpu className="h-5 w-5 text-[#101415] transition-transform duration-500 group-hover:rotate-180" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white font-display">
                HD TECH
              </span>
              <span className="text-[10px] font-semibold font-geist text-[#00e3fd] uppercase tracking-widest -mt-1">
                Solutions
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 font-sans text-sm font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-colors duration-200 ${
                  isActive(link.href)
                    ? "text-[#00e3fd] hover:text-[#bdf4ff]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setIsInquiryOpen(true)}
              className="px-5 py-2 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-xs shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all duration-300"
            >
              Request Service
            </button>
          </div>

          {/* Hamburger Mobile Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-1.5 text-white/75 hover:bg-white/5 hover:text-white"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="md:hidden absolute top-[calc(100%+0.5rem)] left-0 w-full rounded-xl glass-container border border-white/10 p-5 shadow-2xl animate-fade-in">
            <div className="flex flex-col gap-4 font-sans text-sm font-semibold">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`py-1 transition-colors duration-200 ${
                    isActive(link.href)
                      ? "text-[#00e3fd]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-white/5 my-1" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsInquiryOpen(true);
                }}
                className="w-full py-2.5 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-xs text-center shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all duration-200"
              >
                Request Service
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Inquiry Form Modal */}
      <InquiryModal isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
    </>
  );
}
