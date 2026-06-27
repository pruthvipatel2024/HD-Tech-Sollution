"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Inbox,
  ShoppingBag,
  Image as ImageIcon,
  Settings,
  LogOut,
  Phone,
  Mail,
  MapPin,
  Clock,
  Download,
  Trash2,
  CheckCircle,
  Clock3,
  Plus,
  X,
  Upload,
  Edit2,
  FileText,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/services/auth";
import { getInquiries, updateInquiryStatus, deleteInquiry } from "@/services/inquiries";
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from "@/services/products";
import { getGallery, createGalleryItem, deleteGalleryItem } from "@/services/gallery";
import { getCmsSettings, updateCmsSetting, getServices } from "@/services/cms";
import { uploadFile } from "@/services/upload";

interface DashboardClientProps {
  initialProducts?: any[];
  categories?: any[];
  initialGallery?: any[];
  initialInquiries?: any[];
  initialCMS?: any;
}

export default function DashboardClient({
  initialProducts = [],
  categories = [],
  initialGallery = [],
  initialInquiries = [],
  initialCMS = {},
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"inquiries" | "products" | "gallery" | "cms">("inquiries");
  const [inquiries, setInquiries] = useState<any[]>(initialInquiries);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [gallery, setGallery] = useState<any[]>(initialGallery);
  const [cms, setCms] = useState<any>(initialCMS);
  const [categoriesState, setCategoriesState] = useState<any[]>(categories);
  const [loading, setLoading] = useState(true);

  // Router for logout redirect
  const router = useRouter();

  // Load dashboard data client-side on mount
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [prodData, catData, galData, inqData, cmsData] = await Promise.all([
          getProducts(),
          getCategories(),
          getGallery(),
          getInquiries(),
          getCmsSettings(),
        ]);
        setProducts(prodData);
        setCategoriesState(catData);
        setGallery(galData);
        setInquiries(inqData);
        setCms(cmsData);
        
        // Populate default category in product form if loaded
        if (catData.length > 0) {
          setProductForm((prev) => ({ ...prev, categoryId: catData[0].id }));
        }
      } catch (err) {
        console.error("Failed to load dashboard parameters:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Active Inquiry status filter
  const [inquiryFilter, setInquiryFilter] = useState<string>("all");
  const [inquirySearch, setInquirySearch] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

  // Product CRUD states
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    availability: true,
    categoryId: categoriesState[0]?.id || "",
    imageUrls: [] as string[],
  });

  // Gallery CRUD states
  const [isGalleryFormOpen, setIsGalleryFormOpen] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    title: "",
    description: "",
    location: "",
    service: "CCTV Installation",
    imageUrls: [] as string[],
    beforeImageUrl: "",
    afterImageUrl: "",
    featured: false,
  });

  // CMS state logs
  const [cmsSaveStatus, setCmsSaveStatus] = useState<string | null>(null);

  // File uploading states
  const [isUploading, setIsUploading] = useState(false);

  // Statistics
  const totalProducts = products.length;
  const totalGallery = gallery.length;
  const totalInquiries = inquiries.length;
  const unreadInquiries = inquiries.filter((i) => i.status === "Unread").length;

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/admin/login";
    } catch (err) {
      console.error(err);
    }
  };

  // --- INQUIRY CRUD ---
  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    try {
      const data = await updateInquiryStatus(id, status);
      setInquiries(inquiries.map((i) => (i.id === id ? data : i)));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      await deleteInquiry(id);
      setInquiries(inquiries.filter((i) => i.id !== id));
      setSelectedInquiry(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Customer Name", "Phone", "Email", "Service", "Message", "Status", "Date"];
    const rows = inquiries.map((inq) => [
      inq.id,
      inq.customerName,
      inq.mobileNumber,
      inq.email || "",
      inq.service?.name || "",
      inq.message.replace(/"/g, '""'),
      inq.status,
      new Date(inq.createdAt).toLocaleString(),
    ]);

    const csvContent =
      "\uFEFF" + // UTF-8 BOM
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `HD_Tech_Inquiries_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered inquiries list
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = inquiryFilter === "all" || inq.status.toLowerCase() === inquiryFilter.toLowerCase();
    const matchesSearch =
      inq.customerName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.mobileNumber.includes(inquirySearch);
    return matchesStatus && matchesSearch;
  });

  // --- PRODUCT CRUD ---
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const secureUrl = await uploadFile(file);
      setProductForm((prev) => ({ ...prev, imageUrls: [secureUrl] }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.description || !productForm.price) return;

    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        availability: productForm.availability,
        categoryId: productForm.categoryId,
        imageUrls: productForm.imageUrls,
      };

      if (editingProduct) {
        const data = await updateProduct(editingProduct.id, payload);
        setProducts(products.map((p) => (p.id === editingProduct.id ? data : p)));
      } else {
        const data = await createProduct(payload);
        setProducts([data, ...products]);
      }
      setIsProductFormOpen(false);
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        availability: true,
        categoryId: categories[0]?.id || "",
        imageUrls: [],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProductClick = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      availability: product.availability,
      categoryId: product.categoryId,
      imageUrls: product.images ? product.images.map((img: any) => img.url) : [],
    });
    setIsProductFormOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // --- GALLERY CRUD ---
  const handleGalleryImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "main" | "before" | "after"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const secureUrl = await uploadFile(file);
      if (field === "main") {
        setGalleryForm((prev) => ({ ...prev, imageUrls: [secureUrl] }));
      } else if (field === "before") {
        setGalleryForm((prev) => ({ ...prev, beforeImageUrl: secureUrl }));
      } else if (field === "after") {
        setGalleryForm((prev) => ({ ...prev, afterImageUrl: secureUrl }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.title || !galleryForm.description || !galleryForm.location || !galleryForm.service || galleryForm.imageUrls.length === 0) {
      alert("Please fill in all required fields and upload an image.");
      return;
    }

    try {
      const resServices = await getServices();
      const matchedService = resServices.find((s: any) => s.name === galleryForm.service) || resServices[0];

      const data = await createGalleryItem({
        title: galleryForm.title,
        description: galleryForm.description,
        location: galleryForm.location,
        serviceId: matchedService.id,
        imageUrls: galleryForm.imageUrls,
        beforeImageUrl: galleryForm.beforeImageUrl,
        afterImageUrl: galleryForm.afterImageUrl,
        featured: galleryForm.featured,
      });

      setGallery([data, ...gallery]);
      setIsGalleryFormOpen(false);
      setGalleryForm({
        title: "",
        description: "",
        location: "",
        service: "CCTV Installation",
        imageUrls: [],
        beforeImageUrl: "",
        afterImageUrl: "",
        featured: false,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteGalleryItem(id);
      setGallery(gallery.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // --- CMS UPDATES ---
  const handleCMSChange = (key: string, value: string) => {
    setCms((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleCMSSave = async (key: string) => {
    setCmsSaveStatus("saving");
    try {
      await updateCmsSetting(key, cms[key]);
      setCmsSaveStatus("success");
      setTimeout(() => setCmsSaveStatus(null), 2000);
    } catch (err) {
      setCmsSaveStatus("error");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101415] text-[#e0e3e5] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-[#00e3fd] animate-spin" />
        <span className="font-geist text-[10px] uppercase tracking-wider text-white/40 font-bold">
          Loading Control Center...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101415] text-[#e0e3e5] flex font-sans text-sm">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-white/10 bg-[#0b0f10] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-white/5 flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-[#00e3fd]" />
            <div>
              <span className="font-bold text-white font-display text-sm tracking-wide uppercase">Admin Portal</span>
              <span className="block text-[9px] font-bold font-geist text-[#00e3fd] uppercase tracking-wider -mt-1">
                HD Tech Solutions
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5 font-semibold text-xs text-white/70">
            <button
              onClick={() => setActiveTab("inquiries")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "inquiries"
                  ? "bg-[#00e3fd]/10 border border-[#00e3fd]/20 text-[#00e3fd]"
                  : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <Inbox className="h-4.5 w-4.5" />
              Inquiries
              {unreadInquiries > 0 && (
                <span className="ml-auto bg-[#00e3fd] text-[#101415] rounded-full h-5 px-1.5 flex items-center justify-center font-bold text-[9px]">
                  {unreadInquiries}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "products"
                  ? "bg-[#00e3fd]/10 border border-[#00e3fd]/20 text-[#00e3fd]"
                  : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              Products
            </button>

            <button
              onClick={() => setActiveTab("gallery")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "gallery"
                  ? "bg-[#00e3fd]/10 border border-[#00e3fd]/20 text-[#00e3fd]"
                  : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <ImageIcon className="h-4.5 w-4.5" />
              Completed Work
            </button>

            <button
              onClick={() => setActiveTab("cms")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "cms"
                  ? "bg-[#00e3fd]/10 border border-[#00e3fd]/20 text-[#00e3fd]"
                  : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <Settings className="h-4.5 w-4.5" />
              CMS Configuration
            </button>
          </nav>
        </div>

        {/* Footer Area with user & logout */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between font-sans text-xs">
            <div>
              <div className="font-bold text-white leading-none">Administrator</div>
              <div className="text-[10px] text-white/40 mt-1 font-geist">Session Active</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition-colors"
              title="Log Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main workspace */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header summary cards */}
        <header className="p-6 md:p-8 border-b border-white/10 bg-[#0b0f10]/40 flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-white capitalize">
            {activeTab === "cms" ? "CMS Settings" : activeTab} Panel
          </h2>
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-[#00e3fd] hover:underline font-semibold"
          >
            Visit Public Site
            <ImageIcon className="h-3.5 w-3.5" />
          </a>
        </header>

        {/* Workspace body */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
          
          {/* Quick Metrics cards row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card rounded-xl border border-white/5 p-5 shadow flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold font-geist text-white/40 uppercase tracking-wider">Unread Inquiries</div>
                <div className="text-2xl font-extrabold text-[#00e3fd] mt-1">{unreadInquiries}</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#00e3fd]/10 text-[#00e3fd] flex items-center justify-center">
                <Inbox className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card rounded-xl border border-white/5 p-5 shadow flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold font-geist text-white/40 uppercase tracking-wider">Total Inquiries</div>
                <div className="text-2xl font-extrabold text-white mt-1">{totalInquiries}</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-white/5 text-white/60 flex items-center justify-center">
                <Inbox className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card rounded-xl border border-white/5 p-5 shadow flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold font-geist text-white/40 uppercase tracking-wider">Catalog Products</div>
                <div className="text-2xl font-extrabold text-[#adc6ff] mt-1">{totalProducts}</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#adc6ff]/10 text-[#adc6ff] flex items-center justify-center">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card rounded-xl border border-white/5 p-5 shadow flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold font-geist text-white/40 uppercase tracking-wider">Gallery Projects</div>
                <div className="text-2xl font-extrabold text-[#bdf4ff] mt-1">{totalGallery}</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#bdf4ff]/10 text-[#bdf4ff] flex items-center justify-center">
                <ImageIcon className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Tab Content Panel */}
          {activeTab === "inquiries" && (
            /* --- INQUIRIES VIEW PANEL --- */
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
              
              {/* Left Column: list & filter controls */}
              <div className="xl:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Status buttons */}
                  <div className="flex flex-wrap gap-1.5 rounded-lg bg-black/35 border border-white/5 p-1 text-[10px] font-bold font-geist">
                    {["All", "Unread", "In Progress", "Completed", "Closed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setInquiryFilter(status.toLowerCase())}
                        className={`px-3 py-1.5 rounded-md transition-all uppercase ${
                          inquiryFilter === status.toLowerCase()
                            ? "bg-[#00e3fd] text-[#101415] font-extrabold shadow"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {/* Search and export */}
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Search name/phone..."
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                      className="rounded-lg glass-input px-3 py-2 text-xs w-48"
                    />
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-semibold text-xs transition-colors shrink-0"
                    >
                      <Download className="h-4 w-4 text-[#00e3fd]" />
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* Grid Lists of Inquiries */}
                {filteredInquiries.length === 0 ? (
                  <div className="p-16 border border-white/5 rounded-xl bg-white/2 text-center text-white/40">
                    No matching customer inquiries found.
                  </div>
                ) : (
                  <div className="space-y-3 font-sans text-xs">
                    {filteredInquiries.map((inq) => (
                      <div
                        key={inq.id}
                        onClick={() => setSelectedInquiry(inq)}
                        className={`glass-card rounded-lg p-5 border cursor-pointer hover:border-[#00e3fd]/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all ${
                          selectedInquiry?.id === inq.id
                            ? "border-[#00e3fd]/30 bg-[#00e3fd]/5"
                            : "border-white/5 bg-[#191c1e]"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white text-sm">{inq.customerName}</span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold font-geist uppercase tracking-wider ${
                                inq.status === "Unread"
                                  ? "bg-[#00e3fd]/10 text-[#00e3fd] border border-[#00e3fd]/20"
                                  : inq.status === "In Progress"
                                  ? "bg-[#adc6ff]/10 text-[#adc6ff] border border-[#adc6ff]/20"
                                  : inq.status === "Completed"
                                  ? "bg-[#bdf4ff]/10 text-[#bdf4ff] border border-[#bdf4ff]/20"
                                  : "bg-white/5 text-white/40 border border-white/10"
                              }`}
                            >
                              {inq.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-white/50 text-[10px] font-geist">
                            <span>Phone: {inq.mobileNumber}</span>
                            {inq.email && <span>Email: {inq.email}</span>}
                            <span className="text-[#00e3fd]">Service: {inq.service}</span>
                          </div>
                        </div>

                        <div className="text-right text-[10px] text-white/40 font-geist">
                          {new Date(inq.createdAt).toLocaleDateString()} at {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Inquiry details card viewer */}
              <div className="xl:col-span-1">
                {selectedInquiry ? (
                  <div className="glass-card rounded-xl border border-white/10 bg-[#191c1e] p-6 shadow-xl space-y-6 sticky top-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                      <h3 className="text-base font-bold font-display text-white">Inquiry Details</h3>
                      <button
                        onClick={() => setSelectedInquiry(null)}
                        className="p-1 rounded-lg text-white/45 hover:bg-white/5"
                      >
                        <X className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Name Card */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold font-geist text-white/40 uppercase tracking-wider">Customer Name</div>
                        <div className="text-base font-bold text-white">{selectedInquiry.customerName}</div>
                      </div>

                      {/* Phone link */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold font-geist text-white/40 uppercase tracking-wider">Mobile Number</div>
                        <a
                          href={`tel:${selectedInquiry.mobileNumber}`}
                          className="flex items-center gap-1.5 font-semibold text-white/80 hover:text-[#00e3fd]"
                        >
                          <Phone className="h-4 w-4 text-[#00e3fd]" />
                          {selectedInquiry.mobileNumber}
                        </a>
                      </div>

                      {/* Email link */}
                      {selectedInquiry.email && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold font-geist text-white/40 uppercase tracking-wider">Email Address</div>
                          <a
                            href={`mailto:${selectedInquiry.email}`}
                            className="flex items-center gap-1.5 font-semibold text-white/80 hover:text-[#00e3fd]"
                          >
                            <Mail className="h-4 w-4 text-[#00e3fd]" />
                            {selectedInquiry.email}
                          </a>
                        </div>
                      )}

                      {/* Service Category */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold font-geist text-white/40 uppercase tracking-wider">Requested Service</div>
                        <span className="inline-block rounded-full bg-[#00e3fd]/10 border border-[#00e3fd]/20 px-3 py-0.5 text-xs font-bold text-[#00e3fd]">
                          {selectedInquiry.service}
                        </span>
                      </div>

                      {/* Message details */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold font-geist text-white/40 uppercase tracking-wider">Client Message</div>
                        <div className="p-3 rounded-lg border border-white/5 bg-black/15 text-xs text-white/70 font-sans leading-relaxed whitespace-pre-wrap">
                          {selectedInquiry.message}
                        </div>
                      </div>

                      {/* Screen upload or capture */}
                      {selectedInquiry.imageUrl && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold font-geist text-white/40 uppercase tracking-wider">Attached File</div>
                          <a
                            href={selectedInquiry.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg overflow-hidden border border-white/10 bg-black/10 group relative max-h-[160px]"
                          >
                            <img
                              src={selectedInquiry.imageUrl}
                              alt="Attachment"
                              className="w-full h-full object-cover max-h-[160px]"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold text-white">
                              Open Fullscreen
                            </div>
                          </a>
                        </div>
                      )}

                      {/* Status changes controls */}
                      <div className="space-y-2 pt-4 border-t border-white/5">
                        <div className="text-[10px] font-bold font-geist text-white/40 uppercase tracking-wider">Change Status</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleUpdateInquiryStatus(selectedInquiry.id, "In Progress")}
                            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-[#adc6ff]/10 hover:text-[#adc6ff] font-semibold text-xs text-white transition-colors"
                          >
                            <Clock3 className="h-3.5 w-3.5" />
                            In Progress
                          </button>
                          <button
                            onClick={() => handleUpdateInquiryStatus(selectedInquiry.id, "Completed")}
                            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#00e3fd]/10 border border-[#00e3fd]/20 hover:bg-[#00e3fd] hover:text-[#101415] font-bold text-xs text-[#00e3fd] transition-all"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Completed
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateInquiryStatus(selectedInquiry.id, "Closed")}
                            className="py-2 rounded-lg bg-white/2 border border-white/5 hover:bg-white/5 font-semibold text-xs text-white/60 hover:text-white transition-colors"
                          >
                            Close Ticket
                          </button>
                          <button
                            onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white font-semibold text-xs text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-xl border border-white/5 p-6 text-white/30 h-[350px]">
                    <Inbox className="h-10 w-10 text-white/10 mb-3" />
                    <p className="font-sans text-xs">Select an inquiry from the left table to inspect details, contact options, attachments, and update tickets.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === "products" && (
            /* --- PRODUCTS CONTROL PANEL --- */
            <div className="space-y-6">
              
              {/* Header and Add button */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/50">{products.length} Products configured</span>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: "",
                      description: "",
                      price: "",
                      availability: true,
                      categoryId: categories[0]?.id || "",
                      imageUrls: [],
                    });
                    setIsProductFormOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-xs shadow transition-all"
                >
                  <Plus className="h-4.5 w-4.5" />
                  Add Product
                </button>
              </div>

              {/* Product Form Modal (Inline Overlay/Drawer) */}
              {isProductFormOpen && (
                <div className="glass-card rounded-xl border border-[#00e3fd]/20 bg-[#191c1e] p-6 shadow-xl space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <h3 className="text-base font-bold font-display text-white">
                      {editingProduct ? `Edit Product: ${editingProduct.name}` : "Create New Product Listing"}
                    </h3>
                    <button
                      onClick={() => {
                        setIsProductFormOpen(false);
                        setEditingProduct(null);
                      }}
                      className="p-1 rounded-lg text-white/40 hover:bg-white/5"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/60 mb-1.5 font-geist uppercase text-[9px] font-bold tracking-wider">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="e.g. Crystalline Workstation v2"
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/60 mb-1.5 font-geist uppercase text-[9px] font-bold tracking-wider">
                            Price ($) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={productForm.price}
                            onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                            placeholder="e.g. 1999.00"
                            className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-white/60 mb-1.5 font-geist uppercase text-[9px] font-bold tracking-wider">
                            Category *
                          </label>
                          <select
                            value={productForm.categoryId}
                            onChange={(e) => setProductForm((p) => ({ ...p, categoryId: e.target.value }))}
                            className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/60 mb-1.5 font-geist uppercase text-[9px] font-bold tracking-wider">
                        Product Description *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={productForm.description}
                        onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                        placeholder="Detail the technical specifications: CPU, RAM, GPU, storage interfaces..."
                        className="w-full rounded-lg glass-input px-3 py-2 text-xs resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Image uploader */}
                      <div>
                        <label className="block text-white/60 mb-1.5 font-geist uppercase text-[9px] font-bold tracking-wider">
                          Product Image *
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => document.getElementById("product-file-input")?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all"
                          >
                            {isUploading ? (
                              <Clock className="h-4 w-4 animate-spin text-[#00e3fd]" />
                            ) : (
                              <Upload className="h-4 w-4 text-[#00e3fd]" />
                            )}
                            Choose Image
                          </button>
                          <input
                            id="product-file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleProductImageUpload}
                            className="hidden"
                          />
                          {productForm.imageUrls[0] ? (
                            <span className="text-[10px] text-[#bdf4ff] bg-[#00e3fd]/10 border border-[#00e3fd]/20 rounded-lg px-2.5 py-1 flex items-center gap-1">
                              File Uploaded
                            </span>
                          ) : (
                            <span className="text-white/40">No file uploaded</span>
                          )}
                        </div>
                        {productForm.imageUrls[0] && (
                          <div className="mt-3 rounded-lg overflow-hidden border border-white/10 w-24 h-16 bg-black/10">
                            <img src={productForm.imageUrls[0]} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      {/* Stock availability */}
                      <div>
                        <label className="block text-white/60 mb-1.5 font-geist uppercase text-[9px] font-bold tracking-wider">
                          Availability Status
                        </label>
                        <label className="flex items-center gap-2.5 mt-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={productForm.availability}
                            onChange={(e) => setProductForm((p) => ({ ...p, availability: e.target.checked }))}
                            className="rounded border-white/10 bg-white/5 text-[#00e3fd] focus:ring-0 cursor-pointer h-4.5 w-4.5"
                          />
                          <span className="font-semibold text-white/70">Toggle: Product is in stock and visible on page</span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProductFormOpen(false);
                          setEditingProduct(null);
                        }}
                        className="px-4 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 font-semibold text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="px-6 py-2.5 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold shadow"
                      >
                        {editingProduct ? "Save Changes" : "Create Listing"}
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* Products Table list */}
              <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/25 text-white/50 font-geist uppercase tracking-wider text-[9px]">
                        <th className="p-4 font-bold">Image</th>
                        <th className="p-4 font-bold">Name</th>
                        <th className="p-4 font-bold">Category</th>
                        <th className="p-4 font-bold">Price</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-white/2 transition-colors">
                          <td className="p-4">
                            <div className="h-12 w-16 rounded overflow-hidden bg-black/10 border border-white/10 shrink-0">
                              {prod.imageUrls && prod.imageUrls[0] ? (
                                <img src={prod.imageUrls[0]} alt={prod.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-white/10">N/A</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-white text-sm">{prod.name}</div>
                            <div className="text-[10px] text-white/40 line-clamp-1 max-w-sm mt-0.5">{prod.description}</div>
                          </td>
                          <td className="p-4">
                            <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-white/70">
                              {prod.category?.name || "Hardware"}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-white">${prod.price.toLocaleString()}</td>
                          <td className="p-4">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold font-geist uppercase tracking-wider ${
                                prod.availability
                                  ? "bg-[#00e3fd]/10 text-[#00e3fd]"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {prod.availability ? "In Stock" : "Out"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <button
                                onClick={() => handleEditProductClick(prod)}
                                className="p-1.5 rounded bg-white/5 border border-white/10 hover:border-[#00e3fd]/30 text-white/60 hover:text-white transition-all"
                                title="Edit"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 rounded bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeTab === "gallery" && (
            /* --- GALLERY CONTROL PANEL --- */
            <div className="space-y-6">
              
              {/* Header and Add button */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/50">{gallery.length} Projects displayed</span>
                <button
                  onClick={() => setIsGalleryFormOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-xs shadow transition-all"
                >
                  <Plus className="h-4.5 w-4.5" />
                  Add Project Photo
                </button>
              </div>

              {/* Gallery upload Form overlay */}
              {isGalleryFormOpen && (
                <div className="glass-card rounded-xl border border-[#00e3fd]/20 bg-[#191c1e] p-6 shadow-xl space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <h3 className="text-base font-bold font-display text-white">Upload Gallery Project</h3>
                    <button
                      onClick={() => setIsGalleryFormOpen(false)}
                      className="p-1 rounded-lg text-white/40 hover:bg-white/5"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <form onSubmit={handleGallerySubmit} className="space-y-4 text-xs">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/60 mb-1.5 font-geist uppercase text-[9px] font-bold tracking-wider">
                          Project Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={galleryForm.title}
                          onChange={(e) => setGalleryForm((g) => ({ ...g, title: e.target.value }))}
                          placeholder="e.g. WiFi Access Points deployment at VortexHQ"
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/60 mb-1.5 font-geist uppercase text-[9px] font-bold tracking-wider">
                            Location (City/State) *
                          </label>
                          <input
                            type="text"
                            required
                            value={galleryForm.location}
                            onChange={(e) => setGalleryForm((g) => ({ ...g, location: e.target.value }))}
                            placeholder="e.g. Metro City, NY"
                            className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-white/60 mb-1.5 font-geist uppercase text-[9px] font-bold tracking-wider">
                            Service Type *
                          </label>
                          <select
                            value={galleryForm.service}
                            onChange={(e) => setGalleryForm((g) => ({ ...g, service: e.target.value }))}
                            className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                          >
                            <option value="Computer Sales">Computer Sales</option>
                            <option value="Laptop Repair">Laptop Repair</option>
                            <option value="Networking">Networking</option>
                            <option value="CCTV Installation">CCTV Installation</option>
                            <option value="AMC Support">AMC Support</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/60 mb-1.5 font-geist uppercase text-[9px] font-bold tracking-wider">
                        Project Description *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={galleryForm.description}
                        onChange={(e) => setGalleryForm((g) => ({ ...g, description: e.target.value }))}
                        placeholder="Describe what was accomplished, equipment installed, or improvements made..."
                        className="w-full rounded-lg glass-input px-3 py-2 text-xs resize-none"
                      />
                    </div>

                    {/* Image files uploads grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Main Image */}
                      <div>
                        <label className="block text-white/60 mb-1.5 font-geist uppercase text-[9px] font-bold tracking-wider">
                          Main Project Image *
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => document.getElementById("gal-main-input")?.click()}
                            disabled={isUploading}
                            className="p-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center gap-1.5"
                          >
                            <Upload className="h-4 w-4" />
                            Upload
                          </button>
                          <input
                            id="gal-main-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleGalleryImageUpload(e, "main")}
                            className="hidden"
                          />
                          {galleryForm.imageUrls[0] && <span className="text-[10px] text-[#00e3fd] font-geist">Ready</span>}
                        </div>
                        {galleryForm.imageUrls[0] && (
                          <div className="mt-2 h-14 w-20 rounded border border-white/5 overflow-hidden">
                            <img src={galleryForm.imageUrls[0]} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      {/* Before Image */}
                      <div>
                        <label className="block text-white/60 mb-1.5 font-geist uppercase text-[9px] font-bold tracking-wider">
                          Before Image (Optional)
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => document.getElementById("gal-before-input")?.click()}
                            disabled={isUploading}
                            className="p-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center gap-1.5"
                          >
                            <Upload className="h-4 w-4" />
                            Upload
                          </button>
                          <input
                            id="gal-before-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleGalleryImageUpload(e, "before")}
                            className="hidden"
                          />
                          {galleryForm.beforeImageUrl && <span className="text-[10px] text-[#00e3fd] font-geist">Ready</span>}
                        </div>
                        {galleryForm.beforeImageUrl && (
                          <div className="mt-2 h-14 w-20 rounded border border-white/5 overflow-hidden">
                            <img src={galleryForm.beforeImageUrl} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      {/* After Image */}
                      <div>
                        <label className="block text-white/60 mb-1.5 font-geist uppercase text-[9px] font-bold tracking-wider">
                          After Image (Optional)
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => document.getElementById("gal-after-input")?.click()}
                            disabled={isUploading}
                            className="p-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center gap-1.5"
                          >
                            <Upload className="h-4 w-4" />
                            Upload
                          </button>
                          <input
                            id="gal-after-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleGalleryImageUpload(e, "after")}
                            className="hidden"
                          />
                          {galleryForm.afterImageUrl && <span className="text-[10px] text-[#00e3fd] font-geist">Ready</span>}
                        </div>
                        {galleryForm.afterImageUrl && (
                          <div className="mt-2 h-14 w-20 rounded border border-white/5 overflow-hidden">
                            <img src={galleryForm.afterImageUrl} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer mt-4">
                        <input
                          type="checkbox"
                          checked={galleryForm.featured}
                          onChange={(e) => setGalleryForm((g) => ({ ...g, featured: e.target.checked }))}
                          className="rounded border-white/10 bg-white/5 text-[#00e3fd] h-4.5 w-4.5 cursor-pointer"
                        />
                        <span className="font-semibold text-white/70">Pin project to homepage featured listings</span>
                      </label>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setIsGalleryFormOpen(false)}
                        className="px-4 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 font-semibold text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="px-6 py-2.5 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold shadow"
                      >
                        Add Project
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* Gallery lists cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {gallery.map((g) => (
                  <div
                    key={g.id}
                    className="glass-card rounded-xl border border-white/5 overflow-hidden bg-[#191c1e] flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[4/3] bg-black/10">
                        {g.imageUrls && g.imageUrls[0] ? (
                          <img src={g.imageUrls[0]} alt={g.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-white/10">No Image</div>
                        )}
                        <span className="absolute top-3 left-3 rounded bg-[#0b0f10]/80 px-2 py-0.5 text-[9px] font-bold font-geist text-white uppercase border border-white/10">
                          {g.service}
                        </span>
                        {g.featured && (
                          <span className="absolute top-3 right-3 rounded bg-[#00e3fd]/20 px-2 py-0.5 text-[9px] font-bold font-geist text-[#00e3fd] uppercase border border-[#00e3fd]/30">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="p-5 space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-geist text-white/40">
                          <MapPin className="h-3 w-3 text-[#00e3fd]" />
                          <span>{g.location}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white leading-tight font-display">{g.title}</h4>
                        <p className="text-white/50 text-[11px] leading-relaxed line-clamp-3 font-sans">{g.description}</p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-white/5 mt-4 flex items-center justify-end">
                      <button
                        onClick={() => handleDeleteGallery(g.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 text-[11px] font-semibold transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Project
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {activeTab === "cms" && (
            /* --- CMS CONFIG PANEL --- */
            <div className="glass-card rounded-xl border border-white/10 bg-[#191c1e] p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-base font-bold font-display text-white">Homepage & Business Content Manager</h3>
                  <p className="text-white/40 text-[11px] font-sans mt-0.5">Edit copy headlines, addresses, phone support numbers, and social URLs instantly without modifying code.</p>
                </div>

                {cmsSaveStatus && (
                  <div className={`px-4 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${
                    cmsSaveStatus === "saving"
                      ? "bg-white/5 border-white/10 text-white"
                      : cmsSaveStatus === "success"
                      ? "bg-[#00e3fd]/10 border-[#00e3fd]/20 text-[#bdf4ff]"
                      : "bg-red-500/15 border-red-500/20 text-red-400"
                  }`}>
                    {cmsSaveStatus === "saving" && <Clock className="h-4 w-4 animate-spin text-[#00e3fd]" />}
                    {cmsSaveStatus === "success" && <CheckCircle className="h-4 w-4 text-[#00e3fd]" />}
                    {cmsSaveStatus === "error" && <AlertCircle className="h-4 w-4" />}
                    {cmsSaveStatus === "saving" ? "Saving..." : cmsSaveStatus === "success" ? "Saved Successfully" : "Error saving"}
                  </div>
                )}
              </div>

              <div className="space-y-6 text-xs font-sans">
                
                {/* Hero section CMS */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold font-display text-xs uppercase tracking-wider text-[#00e3fd]">1. Hero Section Copy</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-white/50 font-geist text-[9px] uppercase tracking-wider font-bold">Hero Title Copy</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cms.hero_title}
                          onChange={(e) => handleCMSChange("hero_title", e.target.value)}
                          className="flex-1 rounded-lg glass-input px-3 py-2 text-xs"
                        />
                        <button
                          onClick={() => handleCMSSave("hero_title")}
                          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all text-[11px]"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-white/50 font-geist text-[9px] uppercase tracking-wider font-bold">Hero Subtitle Copy</label>
                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          value={cms.hero_subtitle}
                          onChange={(e) => handleCMSChange("hero_subtitle", e.target.value)}
                          className="flex-1 rounded-lg glass-input px-3 py-2 text-xs resize-none"
                        />
                        <button
                          onClick={() => handleCMSSave("hero_subtitle")}
                          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all text-[11px] self-end"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-white/5" />

                {/* About section CMS */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold font-display text-xs uppercase tracking-wider text-[#00e3fd]">2. About Section Copy</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-white/50 font-geist text-[9px] uppercase tracking-wider font-bold">About Section Header Title</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cms.about_title}
                          onChange={(e) => handleCMSChange("about_title", e.target.value)}
                          className="flex-1 rounded-lg glass-input px-3 py-2 text-xs"
                        />
                        <button
                          onClick={() => handleCMSSave("about_title")}
                          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all text-[11px]"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-white/50 font-geist text-[9px] uppercase tracking-wider font-bold">About Section Paragraph Copy</label>
                      <div className="flex gap-2">
                        <textarea
                          rows={3}
                          value={cms.about_text}
                          onChange={(e) => handleCMSChange("about_text", e.target.value)}
                          className="flex-1 rounded-lg glass-input px-3 py-2 text-xs resize-none"
                        />
                        <button
                          onClick={() => handleCMSSave("about_text")}
                          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all text-[11px] self-end"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-white/5" />

                {/* Business contact CMS */}
                <div className="space-y-4">
                  <h4 className="text-white font-bold font-display text-xs uppercase tracking-wider text-[#00e3fd]">3. Business Location & Contact details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-white/50 font-geist text-[9px] uppercase tracking-wider font-bold">Office Address</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cms.contact_address}
                          onChange={(e) => handleCMSChange("contact_address", e.target.value)}
                          className="flex-1 rounded-lg glass-input px-3 py-2 text-xs"
                        />
                        <button
                          onClick={() => handleCMSSave("contact_address")}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all text-[11px]"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-white/50 font-geist text-[9px] uppercase tracking-wider font-bold">Working Hours Display</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cms.business_hours}
                          onChange={(e) => handleCMSChange("business_hours", e.target.value)}
                          className="flex-1 rounded-lg glass-input px-3 py-2 text-xs"
                        />
                        <button
                          onClick={() => handleCMSSave("business_hours")}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all text-[11px]"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-white/50 font-geist text-[9px] uppercase tracking-wider font-bold">Direct Phone Number</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cms.contact_phone}
                          onChange={(e) => handleCMSChange("contact_phone", e.target.value)}
                          className="flex-1 rounded-lg glass-input px-3 py-2 text-xs"
                        />
                        <button
                          onClick={() => handleCMSSave("contact_phone")}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all text-[11px]"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-white/50 font-geist text-[9px] uppercase tracking-wider font-bold">WhatsApp Direct Number (no spaces)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cms.contact_whatsapp}
                          onChange={(e) => handleCMSChange("contact_whatsapp", e.target.value)}
                          className="flex-1 rounded-lg glass-input px-3 py-2 text-xs"
                        />
                        <button
                          onClick={() => handleCMSSave("contact_whatsapp")}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all text-[11px]"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-white/50 font-geist text-[9px] uppercase tracking-wider font-bold">Support Email Address</label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={cms.contact_email}
                          onChange={(e) => handleCMSChange("contact_email", e.target.value)}
                          className="flex-1 rounded-lg glass-input px-3 py-2 text-xs"
                        />
                        <button
                          onClick={() => handleCMSSave("contact_email")}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all text-[11px]"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
