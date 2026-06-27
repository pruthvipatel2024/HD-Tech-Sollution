"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ShoppingBag, ArrowLeft, ZoomIn, ShieldCheck, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InquiryModal from "@/components/InquiryModal";
import Link from "next/link";
import Image from "next/image";

interface ProductsClientProps {
  categories: any[];
  initialProducts: any[];
}

export default function ProductsClient({ categories, initialProducts }: ProductsClientProps) {
  const [products] = useState<any[]>(initialProducts || []);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryService, setInquiryService] = useState("Computer");

  // Detailed Modal overlay states
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category Filter
      const matchesCategory =
        selectedCategory === "all" || prod.categoryId === selectedCategory;

      // Search Query Filter
      const matchesSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.sku && prod.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (prod.modelNumber && prod.modelNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      // Availability Filter
      const matchesAvailability = !showInStockOnly || prod.availability;

      return matchesCategory && matchesSearch && matchesAvailability;
    });
  }, [products, selectedCategory, searchQuery, showInStockOnly]);

  const handleInquireClick = (e: React.MouseEvent, product: any) => {
    e.stopPropagation(); // Avoid triggering open detailed card
    triggerInquiry(product);
  };

  const triggerInquiry = (product: any) => {
    let service = "Computer";
    const catName = product.category?.name?.toLowerCase() || "";
    if (catName.includes("laptop")) service = "Laptop";
    else if (catName.includes("network")) service = "Networking";
    else if (catName.includes("cctv")) service = "CCTV";
    else if (catName.includes("accessor")) service = "Accessories";

    const priceText = product.showPrice && !product.contactForPrice && product.price
      ? `₹${product.price.toLocaleString("en-IN")}`
      : "Contact for pricing";

    setInquiryService(service);
    setInquiryMessage(
      `Hello, I would like to inquire about purchasing the Product: "${product.name}" (SKU: ${product.sku || "N/A"}). Listed Price/Status: ${priceText}. Please provide sales details.`
    );
    setIsInquiryOpen(true);
  };

  const handleCardClick = (product: any) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
  };

  // Get related products (same category, max 3)
  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return products
      .filter((p) => p.categoryId === selectedProduct.categoryId && p.id !== selectedProduct.id)
      .slice(0, 3);
  }, [selectedProduct, products]);

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
                placeholder="Search catalog by name, model or SKU..."
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
              <h3 className="text-lg font-bold text-white mb-1">No Products Available</h3>
              <p className="text-white/40 text-xs font-sans max-w-xs">
                Try clearing your search query, switching categories, or wait for admin listings uploads.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((prod) => {
                  const imageUrls = prod.images && prod.images.length > 0
                    ? prod.images.map((img: any) => img.url)
                    : [];

                  const shouldShowPrice = prod.showPrice && !prod.contactForPrice && prod.price;
                  const priceText = shouldShowPrice
                    ? `₹${prod.price.toLocaleString("en-IN")}`
                    : "Contact Us";

                  return (
                    <motion.div
                      key={prod.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => handleCardClick(prod)}
                      className="glass-card rounded-xl border border-white/5 overflow-hidden flex flex-col justify-between group hover:border-[#00e3fd]/20 shadow-lg relative cursor-pointer"
                    >
                      <div>
                        {/* Product Image */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20">
                          {imageUrls.length > 0 ? (
                            <Image
                              src={imageUrls[0]}
                              alt={prod.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-white/20 bg-[#161a1c]">
                              <ShoppingBag className="h-12 w-12" />
                            </div>
                          )}

                          {/* Zoom Icon indicator */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <ZoomIn className="h-8 w-8 text-[#00e3fd]" />
                          </div>

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
                          <div className="flex justify-between items-center text-[10px] font-bold font-geist text-[#00e3fd]/85 uppercase tracking-widest">
                            <span>{prod.category?.name || "Hardware"}</span>
                            {prod.brand?.name && <span>{prod.brand.name}</span>}
                          </div>
                          <h3 className="text-lg font-bold font-display text-white group-hover:text-[#00e3fd] transition-colors leading-tight line-clamp-1">
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
                          <div className="text-base font-extrabold text-white mt-0.5">
                            {priceText}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleInquireClick(e, prod)}
                          className="px-4 py-2 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-xs transition-all duration-200"
                        >
                          Inquire Now
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

        </div>
      </main>

      {/* Detailed Product Card overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#101415] overflow-hidden shadow-2xl relative my-8"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00e3fd] to-[#2380ff]" />
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left Side: Images & Gallery zoom */}
                <div className="p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 space-y-4">
                  {/* Primary Big Image */}
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-black/40 border border-white/5">
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      <Image
                        src={selectedProduct.images[activeImageIndex]?.url}
                        alt={selectedProduct.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/20">
                        <ShoppingBag className="h-16 w-16" />
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selectedProduct.images.map((img: any, idx: number) => (
                        <button
                          key={img.id}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative h-12 w-16 rounded overflow-hidden border transition-all ${
                            activeImageIndex === idx ? "border-[#00e3fd] scale-95" : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <Image
                            src={img.url}
                            alt="thumbnail"
                            fill
                            sizes="60px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side: Product Details info sheet */}
                <div className="p-6 md:p-8 flex flex-col justify-between space-y-6 text-xs font-sans">
                  <div className="space-y-4">
                    {/* Header Badges */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="rounded bg-[#00e3fd]/10 border border-[#00e3fd]/20 px-2 py-0.5 text-[9px] font-bold text-[#00e3fd] uppercase font-geist">
                        {selectedProduct.category?.name}
                      </span>
                      {selectedProduct.brand?.name && (
                        <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-bold text-white/70 font-geist">
                          Brand: {selectedProduct.brand.name}
                        </span>
                      )}
                      <span
                        className={`rounded px-2 py-0.5 text-[9px] font-bold font-geist uppercase ${
                          selectedProduct.availability
                            ? "bg-green-500/10 border border-green-500/20 text-green-400"
                            : "bg-red-500/10 border border-red-500/20 text-red-400"
                        }`}
                      >
                        {selectedProduct.availability ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-tight">
                      {selectedProduct.name}
                    </h2>

                    {selectedProduct.sku && (
                      <div className="text-[10px] text-white/40 font-mono">
                        SKU: {selectedProduct.sku} {selectedProduct.modelNumber && `| Model: ${selectedProduct.modelNumber}`}
                      </div>
                    )}

                    <p className="text-white/70 leading-relaxed text-xs">
                      {selectedProduct.description}
                    </p>

                    {/* Warranty */}
                    {selectedProduct.warranty && (
                      <div className="flex items-center gap-2 text-white/80 font-semibold bg-white/5 border border-white/5 rounded-lg p-2.5">
                        <ShieldCheck className="h-4 w-4 text-[#00e3fd]" />
                        <span>Warranty: {selectedProduct.warranty}</span>
                      </div>
                    )}

                    {/* Specs Sheet */}
                    {selectedProduct.specifications && (
                      <div className="space-y-2">
                        <h4 className="font-bold font-display uppercase tracking-widest text-[9px] text-white/40">Technical Specifications</h4>
                        <div className="p-3 rounded-lg bg-black/20 border border-white/5 max-h-[140px] overflow-y-auto space-y-1.5 leading-relaxed text-[11px] text-white/60">
                          {selectedProduct.specifications.split("\n").map((line: string, i: number) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span className="text-[#00e3fd] shrink-0 mt-1">•</span>
                              <span>{line}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing footer block inside overlay */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">Catalog Price</span>
                      <span className="text-xl font-black text-white">
                        {selectedProduct.showPrice && !selectedProduct.contactForPrice && selectedProduct.price
                          ? `₹${selectedProduct.price.toLocaleString("en-IN")}`
                          : "Contact Us"}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => triggerInquiry(selectedProduct)}
                      className="px-6 py-3 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-xs shadow-lg transition-all"
                    >
                      Place Purchase Inquiry
                    </button>
                  </div>
                </div>
              </div>

              {/* Related Products Section */}
              {relatedProducts.length > 0 && (
                <div className="bg-black/10 border-t border-white/5 p-6 md:p-8 space-y-4">
                  <h4 className="font-bold font-display uppercase tracking-widest text-[9px] text-white/40 flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-[#00e3fd]" />
                    Related Products
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {relatedProducts.map((rel: any) => {
                      const relImage = rel.images && rel.images.length > 0 ? rel.images[0].url : "";
                      return (
                        <div
                          key={rel.id}
                          onClick={() => handleCardClick(rel)}
                          className="glass-card rounded-lg border border-white/5 p-3 flex items-center gap-3 hover:border-[#00e3fd]/20 transition-all cursor-pointer"
                        >
                          <div className="relative h-10 w-12 rounded overflow-hidden shrink-0 bg-black/40">
                            {relImage ? (
                              <Image
                                src={relImage}
                                alt={rel.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-white/20">
                                <ShoppingBag className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 font-sans text-xs">
                            <h5 className="font-bold text-white truncate leading-tight group-hover:text-[#00e3fd] transition-colors">{rel.name}</h5>
                            <span className="text-[10px] text-white/40 mt-1 block">
                              {rel.showPrice && !rel.contactForPrice && rel.price ? `₹${rel.price.toLocaleString("en-IN")}` : "Contact Us"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />

      {/* Inquiry Form Modal */}
      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        defaultService={inquiryService}
        initialMessage={inquiryMessage}
      />
    </>
  );
}
