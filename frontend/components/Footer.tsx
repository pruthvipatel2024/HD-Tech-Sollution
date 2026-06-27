import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cpu, Phone, Mail, MapPin, Clock } from "lucide-react";
import { getCmsSettings } from "@/services/cms";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [cms, setCms] = useState<any>({
    contact_address: "Q4JX+M5Q, Unnamed Road, Karchaliya Para, Bhavnagar, Gujarat 364001",
    contact_phone: "+91 75758 24006",
    contact_email: "harshildumaniya28@gmail.com",
    business_hours: "Mon - Sat: 10:00 AM - 8:00 PM, Sunday: Closed",
  });

  useEffect(() => {
    getCmsSettings()
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setCms((prev: any) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error("Failed to load footer CMS settings:", err));
  }, []);

  return (
    <footer className="relative mt-auto border-t border-white/5 bg-[#0b0f10] text-[#e0e3e5] py-12 md:py-16 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-[#00e3fd]/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-[#00e3fd] to-[#2380ff]">
                <Cpu className="h-4.5 w-4.5 text-[#101415]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-tight text-white font-display">
                  HD TECH
                </span>
                <span className="text-[9px] font-semibold font-geist text-[#00e3fd] uppercase tracking-widest -mt-1">
                  Solutions
                </span>
              </div>
            </Link>
            <p className="text-xs text-white/50 max-w-sm font-sans leading-relaxed">
              Empowering residential clients and corporate enterprises with custom workstation solutions, high-bandwidth structured wireless networks, and high-fidelity CCTV camera installations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 font-sans text-xs">
            <h4 className="text-white font-bold font-display uppercase tracking-widest text-[10px]">
              Services
            </h4>
            <ul className="space-y-2 text-white/60">
              <li>Computer & Laptop Sales</li>
              <li>Custom Water-Cooled Builds</li>
              <li>Network Auditing & Setup</li>
              <li>IP CCTV Surveillance Systems</li>
              <li>Annual Maintenance Contracts</li>
            </ul>
          </div>

          {/* Business Info */}
          <div className="space-y-4 font-sans text-xs">
            <h4 className="text-white font-bold font-display uppercase tracking-widest text-[10px]">
              Contact Info
            </h4>
            <ul className="space-y-2.5 text-white/60">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#00e3fd] shrink-0 mt-0.5" />
                <span>{cms.contact_address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#00e3fd] shrink-0" />
                <span>
                  <a href={`tel:${cms.contact_phone}`} className="hover:text-white transition-colors">
                    {cms.contact_phone}
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#00e3fd] shrink-0" />
                <span>
                  <a href={`mailto:${cms.contact_email}`} className="hover:text-white transition-colors">
                    {cms.contact_email}
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-[#00e3fd] shrink-0 mt-0.5" />
                <span>{cms.business_hours}</span>
              </li>
            </ul>
          </div>

          {/* Map Location */}
          <div className="space-y-4 font-sans text-xs">
            <h4 className="text-white font-bold font-display uppercase tracking-widest text-[10px]">
              Office Location
            </h4>
            <div className="w-full relative aspect-square md:aspect-[4/3] rounded-lg overflow-hidden border border-white/10 bg-[#191c1e] shadow-md group">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(cms.contact_address || "Q4JX+M5Q, Unnamed Road, Karchaliya Para, Bhavnagar, Gujarat 364001")}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)" }}
                allowFullScreen={false}
                loading="lazy"
                title="Office Map"
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </div>

        </div>

        {/* Bottom Block */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-xs text-white/40">
          <p>© {currentYear} HD Tech Solutions. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/admin/dashboard" className="hover:text-white transition-colors">
              Admin Portal
            </Link>
            <span className="cursor-default">|</span>
            <span className="text-[#00e3fd]/60">Crystalline Design System</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
