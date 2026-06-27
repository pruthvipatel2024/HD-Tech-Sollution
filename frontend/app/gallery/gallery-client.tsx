"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Camera, ArrowLeftRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

interface GalleryClientProps {
  initialItems: any[];
}

export default function GalleryClient({ initialItems }: GalleryClientProps) {
  const [items] = useState<any[]>(initialItems);
  const [selectedService, setSelectedService] = useState<string>("all");
  const [activeLightboxItem, setActiveLightboxItem] = useState<any | null>(null);
  const [showBeforeAfter, setShowBeforeAfter] = useState<"current" | "before" | "after">("current");

  // Collect unique services for filters
  const services = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.service) set.add(item.service);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedService === "all") return items;
    return items.filter((item) => item.service === selectedService);
  }, [items, selectedService]);

  const openLightbox = (item: any) => {
    setActiveLightboxItem(item);
    setShowBeforeAfter("current");
  };

  const closeLightbox = () => {
    setActiveLightboxItem(null);
  };

  const getActiveImage = (item: any) => {
    if (showBeforeAfter === "before" && item.beforeImageUrl) {
      return item.beforeImageUrl;
    }
    if (showBeforeAfter === "after" && item.afterImageUrl) {
      return item.afterImageUrl;
    }
    return item.imageUrls[0];
  };

  const formatDate = (dateStr: string | Date) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    } catch (e) {
      return dateStr.toString();
    }
  };

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen pt-32 pb-24 px-6 md:px-8 bg-[#101415] text-[#e0e3e5] font-sans">
        {/* Background Radial Glows */}
        <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-[#00e3fd]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-[#b1c7f2]/5 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative">
          
          {/* Header */}
          <div className="space-y-2 mb-12">
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-[#00e3fd] hover:text-[#bdf4ff] mb-2 font-geist">
              <ArrowLeft className="h-3 w-3" />
              Back to Home
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight">
              Our Completed Work
            </h1>
            <p className="text-white/50 text-xs max-w-lg">
              Inspect our high-end server deployments, customized liquid-loop builds, and structural security surveillance installations.
            </p>
          </div>

          {/* Service Filters */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none [mask-image:linear-gradient(to_right,white_85%,transparent)]">
            <button
              onClick={() => setSelectedService("all")}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedService === "all"
                  ? "bg-[#00e3fd] text-[#101415] font-bold shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                  : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              Show All Projects
            </button>
            {services.map((srv) => (
              <button
                key={srv}
                onClick={() => setSelectedService(srv)}
                className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  selectedService === srv
                    ? "bg-[#00e3fd] text-[#101415] font-bold shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {srv}
              </button>
            ))}
          </div>

          {/* Gallery Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-xl border border-white/5">
              <Camera className="h-16 w-16 text-white/20 mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">No Projects Found</h3>
              <p className="text-white/40 text-xs font-sans">
                Stay tuned, our team is constantly uploading pictures of recently finished works.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => openLightbox(item)}
                    className="glass-card rounded-xl border border-white/5 overflow-hidden group hover:border-[#00e3fd]/20 shadow-lg cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20">
                        <Image
                          src={item.imageUrls[0]}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#101415]/80 via-[#101415]/10 to-transparent opacity-85" />
                        
                        {/* Service Label */}
                        <span className="absolute top-4 left-4 rounded-full bg-[#00e3fd]/15 border border-[#00e3fd]/35 px-3 py-1 text-[9px] font-bold font-geist text-[#00e3fd] uppercase tracking-wider">
                          {item.service}
                        </span>

                        {/* Before/After Indicator Badge */}
                        {(item.beforeImageUrl || item.afterImageUrl) && (
                          <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2.5 py-1 text-[9px] font-bold text-white font-geist">
                            <ArrowLeftRight className="h-3 w-3 text-[#00e3fd]" />
                            B/A
                          </span>
                        )}
                      </div>

                      {/* Info body */}
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-4 text-[10px] font-bold font-geist text-white/40 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-[#00e3fd]" />
                            <span>{item.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-[#00e3fd]" />
                            <span>{formatDate(item.date)}</span>
                          </div>
                        </div>
                        <h3 className="text-base font-bold font-display text-white leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-white/60 text-xs font-sans leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

        </div>
      </main>

      {/* Lightbox Modal overlay */}
      <AnimatePresence>
        {activeLightboxItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop click clears */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
              className="fixed inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Lightbox Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-[#101415] shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh]"
            >
              {/* Image Column */}
              <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] md:min-h-0">
                <Image
                  src={getActiveImage(activeLightboxItem)}
                  alt={activeLightboxItem.title}
                  fill
                  sizes="(max-width: 1200px) 100vw, 80vw"
                  className="object-contain"
                />

                {/* Before / After toggle switches */}
                {(activeLightboxItem.beforeImageUrl || activeLightboxItem.afterImageUrl) && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-lg bg-black/60 border border-white/10 p-1 backdrop-blur-sm z-20">
                    <button
                      onClick={() => setShowBeforeAfter("current")}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold font-geist uppercase transition-all ${
                        showBeforeAfter === "current"
                          ? "bg-[#00e3fd] text-[#101415]"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      General
                    </button>
                    {activeLightboxItem.beforeImageUrl && (
                      <button
                        onClick={() => setShowBeforeAfter("before")}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold font-geist uppercase transition-all ${
                          showBeforeAfter === "before"
                            ? "bg-[#00e3fd] text-[#101415]"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        Before
                      </button>
                    )}
                    {activeLightboxItem.afterImageUrl && (
                      <button
                        onClick={() => setShowBeforeAfter("after")}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold font-geist uppercase transition-all ${
                          showBeforeAfter === "after"
                            ? "bg-[#00e3fd] text-[#101415]"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        After
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar Description Column */}
              <div className="w-full md:w-[320px] p-6 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 bg-[#191c1e] text-sm overflow-y-auto">
                <div className="space-y-6">
                  {/* Top Bar info */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#00e3fd]/10 border border-[#00e3fd]/20 px-3 py-1 text-[9px] font-bold font-geist text-[#00e3fd] uppercase tracking-wider">
                      {activeLightboxItem.service}
                    </span>
                    <button
                      onClick={closeLightbox}
                      className="rounded-lg p-1 text-white/50 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-xl font-bold font-display text-white leading-tight">
                      {activeLightboxItem.title}
                    </h2>
                    
                    <div className="flex flex-wrap gap-4 text-[10px] font-bold font-geist text-white/40 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#00e3fd]" />
                        <span>{activeLightboxItem.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#00e3fd]" />
                        <span>{formatDate(activeLightboxItem.date)}</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  <p className="text-white/70 text-xs font-sans leading-relaxed">
                    {activeLightboxItem.description}
                  </p>
                </div>

                <div className="pt-8">
                  <button
                    onClick={closeLightbox}
                    className="w-full py-2.5 rounded-lg border border-white/10 hover:bg-white/5 font-semibold text-xs text-white transition-colors"
                  >
                    Close Showcase
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
