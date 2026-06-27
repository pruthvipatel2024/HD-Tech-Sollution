"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Check, X, ShoppingBag, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InquiryModal from "@/components/InquiryModal";
import Link from "next/link";

interface ProductsClientProps {
  categories: any[];
  initialProducts: any[];
}

export default function ProductsClient({ categories, initialProducts }: ProductsClientProps) {
  const [products] = useState<any[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryService, setInquiryService] = useState("Computer");

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category Filter
      const matchesCategory =
        selectedCategory === "all" || prod.categoryId === selectedCategory;

      // Search Query Filter
      const matchesSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Availability Filter
      const matchesAvailability = !showInStockOnly || prod.availability;

      return matchesCategory && matchesSearch && matchesAvailability;
    });
  }, [products, selectedCategory, searchQuery, showInStockOnly]);

  const handleInquireClick = (product: any) => {
    // Map product category to service dropdown
    let service = "Computer";
    const catName = product.category?.name?.toLowerCase() || "";
    if (catName.includes("laptop")) service = "Laptop";
    else if (catName.includes("network")) service = "Networking";
    else if (catName.includes("cctv")) service = "CCTV";
    else if (catName.includes("accessor")) service = "Accessories";

    setInquiryService(service);
    setInquiryMessage(
      `Hello, I would like to inquire about purchasing the Product: "${product.name}" listed at $${product.price.toLocaleString()}. Please provide pricing and availability details.`
    );
    setIsInquiryOpen(true);
  };

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen pt-32 pb-24 px-6 md:px-8 bg-[#101415] text-[#e0e3e5] font-sans">
        {/* Background Gradients */}
        <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-[#00e3fd]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-[#b1c7f2]/5 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div className="space-y-2">
              <Link href="/" className="inline-flex items-center gap-1 text-xs text-[#00e3fd] hover:text-[#bdf4ff] mb-2 font-geist">
                <ArrowLeft className="h-3 w-3" />
                Back to Home
              </Link>
              <h1 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight">
                Tech Catalog
              </h1>
              <p className="text-white/50 text-xs max-w-lg">
                Explore our commercial inventories of workstations, high-throughput network nodes, smart cameras, and premium peripherals.
              </p>
            </div>

            {/* In-Stock Filter & Stats */}
            <div className="flex items-center gap-6 self-start md:self-auto">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white/70 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={showInStockOnly}
                  onChange={(e) => setShowInStockOnly(e.target.checked)}
                  className="rounded border-white/10 bg-white/5 text-[#00e3fd] focus:ring-0 cursor-pointer h-4 w-4"
                />
                In-Stock Only
              </label>
              <span className="text-[10px] font-bold font-geist text-[#00e3fd] bg-[#00e3fd]/10 border border-[#00e3fd]/20 rounded-full px-3 py-1 uppercase tracking-wider">
                {filteredProducts.length} Products Found
              </span>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 items-center">
            
            {/* Search Input */}
            <div className="lg:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg glass-input text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Category selection Tabs */}
            <div className="lg:col-span-3 flex gap-2 overflow-x-auto pb-2 scrollbar-none [mask-image:linear-gradient(to_right,white_85%,transparent)]">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  selectedCategory === "all"
                    ? "bg-[#00e3fd] text-[#101415] font-bold shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                All categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? "bg-[#00e3fd] text-[#101415] font-bold shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                      : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-xl border border-white/5">
              <ShoppingBag className="h-16 w-16 text-white/20 mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">No Products Match Filters</h3>
              <p className="text-white/40 text-xs font-sans max-w-xs">
                Try clearing your search query or switching categories to see other hardware.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((prod) => (
                  <motion.div
                    key={prod.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="glass-card rounded-xl border border-white/5 overflow-hidden flex flex-col justify-between group hover:border-[#00e3fd]/20 shadow-lg relative"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20">
                        {prod.imageUrls && prod.imageUrls[0] ? (
                          <img
                            src={prod.imageUrls[0]}
                            alt={prod.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/20">
                            <ShoppingBag className="h-12 w-12" />
                          </div>
                        )}

                        {/* Availability Badging */}
                        <span
                          className={`absolute top-4 right-4 rounded-full px-3 py-1 text-[9px] font-bold font-geist uppercase tracking-wider ${
                            prod.availability
                              ? "bg-[#00e3fd]/15 border border-[#00e3fd]/30 text-[#00e3fd]"
                              : "bg-red-500/10 border border-red-500/20 text-red-400"
                          }`}
                        >
                          {prod.availability ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-3">
                        <div className="text-[10px] font-bold font-geist text-[#00e3fd]/80 uppercase tracking-widest">
                          {prod.category?.name || "Hardware"}
                        </div>
                        <h3 className="text-lg font-bold font-display text-white group-hover:text-[#00e3fd] transition-colors leading-tight">
                          {prod.name}
                        </h3>
                        <p className="text-white/60 text-xs font-sans leading-relaxed line-clamp-3">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 pt-0 flex items-center justify-between border-t border-white/5 mt-4">
                      <div className="font-display">
                        <div className="text-[10px] font-bold font-geist text-white/40 uppercase tracking-wider">Unit Price</div>
                        <div className="text-lg font-extrabold text-white mt-0.5">
                          ${prod.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <button
                        onClick={() => handleInquireClick(prod)}
                        className="px-4 py-2 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-xs transition-all duration-200"
                      >
                        Inquire Now
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

        </div>
      </main>

      <Footer />

      {/* Inquiry Form Modal */}
      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        defaultService={inquiryService}
      />
    </>
  );
}
