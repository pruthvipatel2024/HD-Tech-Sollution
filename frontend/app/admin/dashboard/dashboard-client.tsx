"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Plus,
  X,
  Upload,
  Edit2,
  FileText,
  AlertCircle,
  Loader2,
  Star,
  Cpu,
  Layers,
  Search,
  Eye,
  Key,
  FolderOpen
} from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/services/auth";
import { getInquiries, updateInquiryStatus, deleteInquiry, addInquiryNote } from "@/services/inquiries";
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from "@/services/products";
import { getGallery, createGalleryItem, deleteGalleryItem } from "@/services/gallery";
import { getCmsSettings, updateCmsSetting, getServices, getBrands, getTestimonials, createBrand, deleteBrand, deleteTestimonial, createService, deleteService } from "@/services/cms";
import { apiRequest } from "@/services/api-client";
import NextImage from "next/image";

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
  const [activeTab, setActiveTab] = useState<
    "overview" | "inquiries" | "products" | "categories" | "services" | "gallery" | "testimonials" | "brands" | "cms" | "media" | "logs" | "settings"
  >("overview");

  // Core Data States
  const [inquiries, setInquiries] = useState<any[]>(initialInquiries);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [gallery, setGallery] = useState<any[]>(initialGallery);
  const [cms, setCms] = useState<any>(initialCMS);
  const [categoriesState, setCategoriesState] = useState<any[]>(categories);
  const [servicesState, setServicesState] = useState<any[]>([]);
  const [brandsState, setBrandsState] = useState<any[]>([]);
  const [testimonialsState, setTestimonialsState] = useState<any[]>([]);
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selector helper states for reusing media
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [mediaSelectorTarget, setMediaSelectorTarget] = useState<{ form: string; field: string } | null>(null);

  // Password change states
  const [passwordOld, setPasswordOld] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Router for logout redirect
  const router = useRouter();

  // Load dashboard data client-side on mount
  const fetchDashboardData = async () => {
    try {
      const [prodData, catData, galData, inqData, cmsData, srvData, brandData, testData] = await Promise.all([
        getProducts(),
        getCategories(),
        getGallery(),
        getInquiries(),
        getCmsSettings(),
        getServices(),
        getBrands(),
        getTestimonials(),
      ]);
      setProducts(prodData);
      setCategoriesState(catData);
      setGallery(galData);
      setInquiries(inqData);
      setCms(cmsData);
      setServicesState(srvData);
      setBrandsState(brandData);
      setTestimonialsState(testData);

      // Fetch new media assets & activity logs
      const mediaRes = await apiRequest("/media");
      if (mediaRes.success) setMediaAssets(mediaRes.data || []);

      const logsRes = await apiRequest("/logs");
      if (logsRes.success) setActivityLogs(logsRes.data || []);
      
    } catch (err) {
      console.error("Failed to load dashboard parameters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter lists states
  const [inquiryFilter, setInquiryFilter] = useState<string>("all");
  const [inquirySearch, setInquirySearch] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  
  // Media Search
  const [mediaSearch, setMediaSearch] = useState("");

  // Product CRUD states
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    availability: true,
    sku: "",
    modelNumber: "",
    specifications: "",
    warranty: "",
    featured: false,
    showPrice: false,
    contactForPrice: true,
    categoryId: categoriesState[0]?.id || "",
    brandId: "",
    imageUrls: [] as string[],
  });

  // Category CRUD states
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  // Service CRUD states
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    icon: "Monitor",
    description: "",
    bannerUrl: "",
    displayOrder: 0,
    featured: false,
    active: true,
    buttonText: "Request Service",
    buttonLink: "",
  });

  // Gallery CRUD states
  const [isGalleryFormOpen, setIsGalleryFormOpen] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    title: "",
    slug: "",
    description: "",
    location: "",
    clientName: "",
    duration: "",
    serviceId: "",
    beforeImageUrl: "",
    afterImageUrl: "",
    featured: false,
    order: 0,
    completionDate: new Date().toISOString().split("T")[0],
    imageUrls: [] as string[],
  });

  // Brand CRUD states
  const [isBrandFormOpen, setIsBrandFormOpen] = useState(false);
  const [brandForm, setBrandForm] = useState({
    name: "",
    logoUrl: "",
  });

  // Reviews approval flow states
  const [reviewReplyText, setReviewReplyText] = useState<Record<string, string>>({});

  // Inquiry Notes states
  const [newNoteText, setNewNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // File Upload handling locally
  const [isUploading, setIsUploading] = useState(false);

  // CMS key-value list state
  const [cmsRawSettings, setCmsRawSettings] = useState<any[]>([]);
  const [cmsActiveGroup, setCmsActiveGroup] = useState("Hero");

  // Fetch admin CMS settings list
  useEffect(() => {
    if (activeTab === "cms") {
      apiRequest("/cms/admin").then((res) => {
        if (res.success) setCmsRawSettings(res.data || []);
      });
    }
  }, [activeTab]);

  // Statistics Computations
  const totalProducts = products.length;
  const totalServices = servicesState.length;
  const totalGallery = gallery.length;
  const totalInquiries = inquiries.length;
  const unreadInquiries = inquiries.filter((i) => i.status === "UNREAD").length;
  const approvedReviews = testimonialsState.filter((t) => t.approved).length;
  const mediaCount = mediaAssets.length;

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

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedInquiry) return;
    setIsSavingNote(true);
    try {
      const note = await addInquiryNote(selectedInquiry.id, newNoteText);
      const updatedNotes = selectedInquiry.notes ? [note, ...selectedInquiry.notes] : [note];
      const updatedInquiry = { ...selectedInquiry, notes: updatedNotes };
      setSelectedInquiry(updatedInquiry);
      setInquiries(inquiries.map((inq) => (inq.id === selectedInquiry.id ? updatedInquiry : inq)));
      setNewNoteText("");
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setIsSavingNote(false);
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

  // --- PRODUCT CRUD ---
  const handleEditProductClick = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: product.description,
      price: product.price ? product.price.toString() : "",
      availability: product.availability,
      sku: product.sku || "",
      modelNumber: product.modelNumber || "",
      specifications: product.specifications || "",
      warranty: product.warranty || "",
      featured: product.featured || false,
      showPrice: product.showPrice || false,
      contactForPrice: product.contactForPrice ?? true,
      categoryId: product.categoryId,
      brandId: product.brandId || "",
      imageUrls: product.images ? product.images.map((img: any) => img.url) : [],
    });
    setIsProductFormOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.slug || !productForm.description) return;

    try {
      const payload = {
        ...productForm,
        price: productForm.price ? Number(productForm.price) : null,
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
        slug: "",
        description: "",
        price: "",
        availability: true,
        sku: "",
        modelNumber: "",
        specifications: "",
        warranty: "",
        featured: false,
        showPrice: false,
        contactForPrice: true,
        categoryId: categoriesState[0]?.id || "",
        brandId: "",
        imageUrls: [],
      });
    } catch (err) {
      console.error(err);
    }
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

  // --- CATEGORIES CRUD ---
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;
    try {
      const res = await apiRequest("/categories", {
        method: "POST",
        body: JSON.stringify({ name: categoryName, slug: categoryName.toLowerCase().replace(/[^a-z0-9]/g, "-") }),
      });
      if (res.success) {
        setCategoriesState([...categoriesState, res.data]);
        setCategoryName("");
        setIsCategoryFormOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Deleting this category will delete all related products. Proceed?")) return;
    try {
      const res = await apiRequest(`/categories/${id}`, { method: "DELETE" });
      if (res.success) {
        setCategoriesState(categoriesState.filter((c) => c.id !== id));
        setProducts(products.filter((p) => p.categoryId !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- SERVICES CRUD ---
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest("/services", {
        method: "POST",
        body: JSON.stringify(serviceForm),
      });
      if (res.success) {
        setServicesState([...servicesState, res.data]);
        setIsServiceFormOpen(false);
        setServiceForm({
          name: "",
          icon: "Monitor",
          description: "",
          bannerUrl: "",
          displayOrder: 0,
          featured: false,
          active: true,
          buttonText: "Request Service",
          buttonLink: "",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteService(id);
      setServicesState(servicesState.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // --- GALLERY CRUD ---
  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.title || !galleryForm.slug || !galleryForm.serviceId) return;
    try {
      const matchedService = servicesState.find((s) => s.id === galleryForm.serviceId);
      const payload = {
        ...galleryForm,
        order: Number(galleryForm.order),
        service: matchedService?.name || "",
        completionDate: new Date(galleryForm.completionDate).toISOString(),
      };

      const res = await apiRequest("/gallery", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.success) {
        setGallery([res.data, ...gallery]);
        setIsGalleryFormOpen(false);
        setGalleryForm({
          title: "",
          slug: "",
          description: "",
          location: "",
          clientName: "",
          duration: "",
          serviceId: "",
          beforeImageUrl: "",
          afterImageUrl: "",
          featured: false,
          order: 0,
          completionDate: new Date().toISOString().split("T")[0],
          imageUrls: [],
        });
      }
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

  // --- BRANDS CRUD ---
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newBrand = await createBrand(brandForm.name, brandForm.logoUrl);
      setBrandsState([...brandsState, newBrand]);
      setIsBrandFormOpen(false);
      setBrandForm({ name: "", logoUrl: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    try {
      await deleteBrand(id);
      setBrandsState(brandsState.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // --- TESTIMONIALS (REVIEWS) CRUD & REPLY ---
  const handleReviewUpdate = async (id: string, payload: any) => {
    try {
      const res = await apiRequest(`/testimonials/admin/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (res.success) {
        setTestimonialsState(testimonialsState.map((t) => (t.id === id ? res.data : t)));
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await apiRequest(`/testimonials/admin/${id}`, { method: "DELETE" });
      if (res.success) {
        setTestimonialsState(testimonialsState.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewReplySubmit = async (id: string) => {
    const text = reviewReplyText[id];
    if (!text) return;
    await handleReviewUpdate(id, { replyFromBusiness: text });
    setReviewReplyText({ ...reviewReplyText, [id]: "" });
  };

  // --- MEDIA LIBRARY CRUD ---
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiRequest("/media/upload", {
        method: "POST",
        body: formData,
      });
      if (res.success) {
        setMediaAssets([res.data, ...mediaAssets]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media asset?")) return;
    try {
      const res = await apiRequest(`/media/${id}`, { method: "DELETE" });
      if (res.success) {
        setMediaAssets(mediaAssets.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- CMS SETTINGS VALUE UPDATE ---
  const handleCmsSettingSave = async (key: string, val: string) => {
    try {
      const res = await apiRequest("/cms", {
        method: "PUT",
        body: JSON.stringify({ key, value: val }),
      });
      if (res.success) {
        setCmsRawSettings(cmsRawSettings.map((s) => (s.key === key ? { ...s, value: val } : s)));
        setCms({ ...cms, [key]: val });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- PASSWORD UPDATE ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordSuccess(false);

    if (passwordNew.length < 6) {
      setPasswordMessage("New password must be at least 6 characters.");
      return;
    }

    try {
      const res = await apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword: passwordOld, newPassword: passwordNew }),
      });
      if (res.success) {
        setPasswordSuccess(true);
        setPasswordMessage("Password updated successfully.");
        setPasswordOld("");
        setPasswordNew("");
      } else {
        setPasswordMessage(res.message || "Failed to update password.");
      }
    } catch (err) {
      setPasswordMessage("Error updating password.");
    }
  };

  // Media selector helper function
  const triggerMediaSelector = (form: string, field: string) => {
    setMediaSelectorTarget({ form, field });
    setIsMediaSelectorOpen(true);
  };

  const selectMediaUrl = (url: string) => {
    if (!mediaSelectorTarget) return;
    const { form, field } = mediaSelectorTarget;
    if (form === "product") {
      setProductForm((prev) => ({ ...prev, imageUrls: [url] }));
    } else if (form === "service") {
      setServiceForm((prev) => ({ ...prev, [field]: url }));
    } else if (form === "gallery") {
      if (field === "before") setGalleryForm((prev) => ({ ...prev, beforeImageUrl: url }));
      else if (field === "after") setGalleryForm((prev) => ({ ...prev, afterImageUrl: url }));
      else setGalleryForm((prev) => ({ ...prev, imageUrls: [url] }));
    }
    setIsMediaSelectorOpen(false);
    setMediaSelectorTarget(null);
  };

  // Lists filtering
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = inquiryFilter === "all" || inq.status === inquiryFilter;
    const matchesSearch =
      inq.customerName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.mobileNumber.includes(inquirySearch);
    return matchesStatus && matchesSearch;
  });

  const filteredMedia = mediaAssets.filter((asset) =>
    asset.filename.toLowerCase().includes(mediaSearch.toLowerCase())
  );

  const cmsGroupSettings = cmsRawSettings.filter((s) => s.group === cmsActiveGroup);

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
      {/* Sidebar Tree Navigation */}
      <aside className="w-64 border-r border-white/10 bg-[#0b0f10] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-white/5 flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-[#00e3fd]" />
            <div>
              <span className="font-bold text-white font-display text-sm tracking-wide uppercase">Admin Panel</span>
              <span className="block text-[9px] font-bold font-geist text-[#00e3fd] uppercase tracking-wider -mt-1">
                HD Tech Solutions
              </span>
            </div>
          </div>

          {/* Navigation Tree */}
          <nav className="p-4 space-y-1 font-semibold text-xs text-white/70">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                activeTab === "overview" ? "bg-[#00e3fd]/10 text-[#00e3fd] border border-[#00e3fd]/20" : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <Cpu className="h-4 w-4" />
              Overview
            </button>

            <button
              onClick={() => setActiveTab("inquiries")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                activeTab === "inquiries" ? "bg-[#00e3fd]/10 text-[#00e3fd] border border-[#00e3fd]/20" : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <Inbox className="h-4 w-4" />
              Inquiries
              {unreadInquiries > 0 && (
                <span className="ml-auto bg-[#00e3fd] text-[#101415] rounded-full h-4.5 px-1.5 flex items-center justify-center font-bold text-[9px]">
                  {unreadInquiries}
                </span>
              )}
            </button>

            <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider px-4 pt-4 pb-2">Catalog & CMS</div>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                activeTab === "products" ? "bg-[#00e3fd]/10 text-[#00e3fd] border border-[#00e3fd]/20" : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              Products
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                activeTab === "categories" ? "bg-[#00e3fd]/10 text-[#00e3fd] border border-[#00e3fd]/20" : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              Categories
            </button>

            <button
              onClick={() => setActiveTab("services")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                activeTab === "services" ? "bg-[#00e3fd]/10 text-[#00e3fd] border border-[#00e3fd]/20" : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <Layers className="h-4 w-4" />
              Services Offerings
            </button>

            <button
              onClick={() => setActiveTab("gallery")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                activeTab === "gallery" ? "bg-[#00e3fd]/10 text-[#00e3fd] border border-[#00e3fd]/20" : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              Projects Gallery
            </button>

            <button
              onClick={() => setActiveTab("brands")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                activeTab === "brands" ? "bg-[#00e3fd]/10 text-[#00e3fd] border border-[#00e3fd]/20" : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <Cpu className="h-4 w-4" />
              Partner Brands
            </button>

            <button
              onClick={() => setActiveTab("testimonials")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                activeTab === "testimonials" ? "bg-[#00e3fd]/10 text-[#00e3fd] border border-[#00e3fd]/20" : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <Star className="h-4 w-4" />
              Reviews Approval
            </button>

            <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider px-4 pt-4 pb-2">Configuration</div>

            <button
              onClick={() => setActiveTab("cms")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                activeTab === "cms" ? "bg-[#00e3fd]/10 text-[#00e3fd] border border-[#00e3fd]/20" : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <Settings className="h-4 w-4" />
              Homepage CMS
            </button>

            <button
              onClick={() => setActiveTab("media")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                activeTab === "media" ? "bg-[#00e3fd]/10 text-[#00e3fd] border border-[#00e3fd]/20" : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              Media Library
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                activeTab === "logs" ? "bg-[#00e3fd]/10 text-[#00e3fd] border border-[#00e3fd]/20" : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <FileText className="h-4 w-4" />
              Audit Logs
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                activeTab === "settings" ? "bg-[#00e3fd]/10 text-[#00e3fd] border border-[#00e3fd]/20" : "hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <Key className="h-4 w-4" />
              Admin Settings
            </button>
          </nav>
        </div>

        {/* User logout */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between font-sans text-xs">
          <div>
            <div className="font-bold text-white leading-none">Super Admin</div>
            <span className="text-[10px] text-white/40 mt-1 block">Session Active</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#101415] overflow-y-auto">
        <header className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0b0f10]/30 shrink-0">
          <h2 className="text-base font-bold font-display text-white capitalize tracking-wide">
            {activeTab === "cms" ? "CMS Settings" : activeTab === "logs" ? "Security Audit Trails" : activeTab} Management
          </h2>
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-[#00e3fd] hover:underline font-bold"
          >
            Visit Live Site
            <Eye className="h-3.5 w-3.5" />
          </a>
        </header>

        {/* Content Tabs Area */}
        <div className="p-6 md:p-8 max-w-6xl w-full mx-auto">
          {activeTab === "overview" && (
            /* --- OVERVIEW BOARD --- */
            <div className="space-y-8">
              {/* Quick stats counters grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl border border-white/5 p-5">
                  <span className="block text-[10px] font-bold text-white/45 uppercase tracking-wider">Catalog Products</span>
                  <span className="block text-2xl font-extrabold text-white mt-1">{totalProducts}</span>
                </div>
                <div className="glass-card rounded-xl border border-white/5 p-5">
                  <span className="block text-[10px] font-bold text-white/45 uppercase tracking-wider">Active Services</span>
                  <span className="block text-2xl font-extrabold text-[#00e3fd] mt-1">{totalServices}</span>
                </div>
                <div className="glass-card rounded-xl border border-white/5 p-5">
                  <span className="block text-[10px] font-bold text-white/45 uppercase tracking-wider">Unread Inquiries</span>
                  <span className="block text-2xl font-extrabold text-white mt-1">{unreadInquiries}</span>
                </div>
                <div className="glass-card rounded-xl border border-white/5 p-5">
                  <span className="block text-[10px] font-bold text-white/45 uppercase tracking-wider">Media Library Assets</span>
                  <span className="block text-2xl font-extrabold text-[#00e3fd] mt-1">{mediaCount}</span>
                </div>
              </div>

              {/* Achievements settings card list summary */}
              <div className="glass-card rounded-xl border border-white/5 p-6 space-y-4">
                <h3 className="text-sm font-bold font-display text-white tracking-wide">Live Achievements Counters (CMS)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                  <div className="p-3 bg-white/2 rounded-lg border border-white/5">
                    <span className="text-white/40 block text-[9px] uppercase tracking-wider">Experience</span>
                    <span className="text-lg font-bold text-white">{cms.Experience || "2+"}</span>
                  </div>
                  <div className="p-3 bg-white/2 rounded-lg border border-white/5">
                    <span className="text-white/40 block text-[9px] uppercase tracking-wider">Systems Built</span>
                    <span className="text-lg font-bold text-[#00e3fd]">{cms.SystemsInstalled || "350+"}</span>
                  </div>
                  <div className="p-3 bg-white/2 rounded-lg border border-white/5">
                    <span className="text-white/40 block text-[9px] uppercase tracking-wider">CCTV Deployed</span>
                    <span className="text-lg font-bold text-white">{cms.CCTVNodes || "40+"}</span>
                  </div>
                  <div className="p-3 bg-white/2 rounded-lg border border-white/5">
                    <span className="text-white/40 block text-[9px] uppercase tracking-wider">Happy Clients</span>
                    <span className="text-lg font-bold text-[#00e3fd]">{cms.HappyClients || "100%"}</span>
                  </div>
                  <div className="p-3 bg-white/2 rounded-lg border border-white/5">
                    <span className="text-white/40 block text-[9px] uppercase tracking-wider">Projects Done</span>
                    <span className="text-lg font-bold text-white">{cms.ProjectsCompleted || "500+"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "inquiries" && (
            /* --- INQUIRIES BOARD --- */
            <div className="space-y-6">
              {/* Header options */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {["all", "UNREAD", "IN_PROGRESS", "COMPLETED", "CLOSED"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setInquiryFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                        inquiryFilter === filter
                          ? "bg-[#00e3fd]/10 border-[#00e3fd]/30 text-[#00e3fd]"
                          : "border-white/5 bg-white/2 text-white/50 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {filter.replace("_", " ")}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/35" />
                    <input
                      type="text"
                      placeholder="Search inquiries..."
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-lg glass-input text-xs w-48"
                    />
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-[#00e3fd]/20 hover:border-[#00e3fd] text-[#00e3fd] text-xs font-bold transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Inquiry list container */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* List Pane */}
                <div className="lg:col-span-1 space-y-3">
                  {filteredInquiries.length === 0 ? (
                    <div className="text-center py-12 glass-card rounded-xl border border-white/5">
                      <Inbox className="h-10 w-10 text-white/20 mx-auto mb-2" />
                      <p className="text-white/40 text-xs">No inquiries matching filter.</p>
                    </div>
                  ) : (
                    filteredInquiries.map((inq) => (
                      <div
                        key={inq.id}
                        onClick={() => {
                          setSelectedInquiry(inq);
                          if (inq.status === "UNREAD") handleUpdateInquiryStatus(inq.id, "IN_PROGRESS");
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                          selectedInquiry?.id === inq.id
                            ? "bg-[#00e3fd]/5 border-[#00e3fd]/30 shadow-lg"
                            : "bg-white/2 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-white truncate max-w-[120px]">{inq.customerName}</span>
                          <span className={`text-[8px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 ${
                            inq.status === "UNREAD" ? "bg-[#00e3fd]/15 text-[#00e3fd] border border-[#00e3fd]/30" : "bg-white/5 text-white/50"
                          }`}>
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-white/60 text-[11px] font-sans line-clamp-1">{inq.message}</p>
                        <span className="block text-[9px] text-white/35 font-geist">{new Date(inq.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Details / Action Pane */}
                <div className="lg:col-span-2">
                  {selectedInquiry ? (
                    <div className="glass-card rounded-xl border border-white/10 p-6 md:p-8 space-y-6 relative">
                      {/* Delete Inquiry button */}
                      <button
                        onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                        className="absolute top-6 right-6 p-2 rounded bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 transition-colors"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold block font-geist">Service Inquiry Details</span>
                          <h3 className="text-lg font-bold font-display text-white">{selectedInquiry.customerName}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                          <div>
                            <span className="text-white/40 block mb-0.5">Phone:</span>
                            <a href={`tel:${selectedInquiry.mobileNumber}`} className="text-[#00e3fd] hover:underline font-semibold block">{selectedInquiry.mobileNumber}</a>
                          </div>
                          <div>
                            <span className="text-white/40 block mb-0.5">Email:</span>
                            <a href={`mailto:${selectedInquiry.email || ""}`} className="text-white/80 hover:underline block">{selectedInquiry.email || "N/A"}</a>
                          </div>
                        </div>

                        <div className="p-3 bg-white/2 rounded-lg border border-white/5 text-xs text-white/70 leading-relaxed font-sans">
                          {selectedInquiry.message}
                        </div>

                        {/* Attachments preview */}
                        {selectedInquiry.attachments && selectedInquiry.attachments.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[9px] font-bold text-white/35 uppercase tracking-wider">Attachment Uploads</span>
                            <div className="grid grid-cols-3 gap-3">
                              {selectedInquiry.attachments.map((att: any) => (
                                <a
                                  key={att.id}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="relative aspect-video rounded overflow-hidden border border-white/10 hover:border-[#00e3fd]/30 block"
                                >
                                  <NextImage src={att.url} alt={att.name} fill className="object-cover" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Status selection */}
                        <div className="space-y-1 text-xs">
                          <label className="text-white/60 font-semibold block mb-1">Update Status:</label>
                          <select
                            value={selectedInquiry.status}
                            onChange={(e) => handleUpdateInquiryStatus(selectedInquiry.id, e.target.value)}
                            className="rounded bg-[#101415] border border-white/10 p-2 text-white outline-none focus:border-[#00e3fd] transition-colors"
                          >
                            <option value="UNREAD">Unread</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CLOSED">Closed</option>
                          </select>
                        </div>

                        {/* Internal notes timeline */}
                        <div className="pt-4 border-t border-white/5 space-y-4">
                          <h4 className="text-xs font-bold text-white/80 font-display uppercase tracking-wider">Diagnostic Timeline Notes</h4>
                          
                          <form onSubmit={handleAddNote} className="flex gap-2">
                            <input
                              type="text"
                              required
                              value={newNoteText}
                              onChange={(e) => setNewNoteText(e.target.value)}
                              placeholder="Add diagnostic comments or resolution notes..."
                              className="flex-1 rounded-lg glass-input px-3 py-2 text-xs"
                            />
                            <button
                              type="submit"
                              disabled={isSavingNote}
                              className="px-4 py-2 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-xs shadow transition-colors"
                            >
                              Add
                            </button>
                          </form>

                          <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2">
                            {selectedInquiry.notes && selectedInquiry.notes.length > 0 ? (
                              selectedInquiry.notes.map((note: any) => (
                                <div key={note.id} className="p-3 bg-[#101415]/60 border border-white/5 rounded-lg text-xs leading-relaxed font-sans">
                                  <div className="flex justify-between items-center text-[9px] text-white/35 font-bold mb-1 uppercase">
                                    <span>By: {note.admin?.username || "Admin"}</span>
                                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                                  </div>
                                  <p className="text-white/70">{note.text}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-white/30 text-xs italic">No internal comments added yet.</p>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center border border-dashed border-white/10 rounded-xl text-white/30 font-sans text-xs">
                      Select an inquiry from the list to view diagnostic comments and manage SLA status.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            /* --- PRODUCTS BOARD --- */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white/50">{totalProducts} Products listed</span>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: "",
                      slug: "",
                      description: "",
                      price: "",
                      availability: true,
                      sku: "",
                      modelNumber: "",
                      specifications: "",
                      warranty: "",
                      featured: false,
                      showPrice: false,
                      contactForPrice: true,
                      categoryId: categoriesState[0]?.id || "",
                      brandId: "",
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

              {isProductFormOpen && (
                <div className="glass-card rounded-xl border border-[#00e3fd]/20 bg-[#191c1e] p-6 shadow-xl space-y-6">
                  <h3 className="text-sm font-bold font-display text-white border-b border-white/5 pb-2">
                    {editingProduct ? `Edit Product: ${editingProduct.name}` : "Create Product Listing"}
                  </h3>
                  <form onSubmit={handleProductSubmit} className="space-y-4 text-xs font-sans">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-white/60 block mb-0.5">Product Name *</label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          placeholder="e.g. Crystalline Workstation v2"
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block mb-0.5">Slug (For URL) *</label>
                        <input
                          type="text"
                          required
                          value={productForm.slug}
                          onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                          placeholder="e.g. crystalline-workstation-v2"
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block mb-0.5">Category *</label>
                        <select
                          value={productForm.categoryId}
                          onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs bg-[#191c1e]"
                        >
                          {categoriesState.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-white/60 block mb-0.5">SKU (Stock ID)</label>
                        <input
                          type="text"
                          value={productForm.sku}
                          onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                          placeholder="e.g. SKU-1002"
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block mb-0.5">Model Number</label>
                        <input
                          type="text"
                          value={productForm.modelNumber}
                          onChange={(e) => setProductForm({ ...productForm, modelNumber: e.target.value })}
                          placeholder="e.g. MD-900"
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block mb-0.5">Price (₹)</label>
                        <input
                          type="number"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          placeholder="e.g. 45000"
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block mb-0.5">Brand</label>
                        <select
                          value={productForm.brandId}
                          onChange={(e) => setProductForm({ ...productForm, brandId: e.target.value })}
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs bg-[#191c1e]"
                        >
                          <option value="">No brand selected</option>
                          {brandsState.map((br) => (
                            <option key={br.id} value={br.id}>{br.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-white/60 block mb-0.5">Image Link URL (or upload via Media Library)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={productForm.imageUrls[0] || ""}
                            onChange={(e) => setProductForm({ ...productForm, imageUrls: [e.target.value] })}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 rounded-lg glass-input px-3 py-2 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => triggerMediaSelector("product", "imageUrls")}
                            className="px-3 py-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 font-bold"
                          >
                            Library
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block mb-0.5">Warranty Info</label>
                        <input
                          type="text"
                          value={productForm.warranty}
                          onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                          placeholder="e.g. 2 Years Manufacturer Warranty"
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-white/60 block mb-0.5">Specifications (One per line)</label>
                        <textarea
                          rows={3}
                          value={productForm.specifications}
                          onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
                          placeholder="Intel Core i7&#10;16GB RAM&#10;512GB SSD"
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs resize-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block mb-0.5">Product Description *</label>
                        <textarea
                          required
                          rows={3}
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          placeholder="Detailed customer description..."
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs resize-none"
                        />
                      </div>
                    </div>

                    {/* Checkboxes layout */}
                    <div className="flex flex-wrap gap-6 items-center pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productForm.availability}
                          onChange={(e) => setProductForm({ ...productForm, availability: e.target.checked })}
                          className="rounded border-white/10 bg-white/5 text-[#00e3fd] h-4.5 w-4.5"
                        />
                        <span className="font-semibold text-white/70">In Stock</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productForm.showPrice}
                          onChange={(e) => setProductForm({ ...productForm, showPrice: e.target.checked })}
                          className="rounded border-white/10 bg-white/5 text-[#00e3fd] h-4.5 w-4.5"
                        />
                        <span className="font-semibold text-white/70">Show Price publicly</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productForm.contactForPrice}
                          onChange={(e) => setProductForm({ ...productForm, contactForPrice: e.target.checked })}
                          className="rounded border-white/10 bg-white/5 text-[#00e3fd] h-4.5 w-4.5"
                        />
                        <span className="font-semibold text-white/70">Contact for pricing</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productForm.featured}
                          onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                          className="rounded border-white/10 bg-white/5 text-[#00e3fd] h-4.5 w-4.5"
                        />
                        <span className="font-semibold text-white/70">Featured on homepage</span>
                      </label>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProductFormOpen(false);
                          setEditingProduct(null);
                        }}
                        className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 font-semibold text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold shadow"
                      >
                        {editingProduct ? "Save Changes" : "Create Product"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Products listing table */}
              <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/25 text-white/50 font-geist uppercase tracking-wider text-[9px]">
                      <th className="p-4 font-bold">Product Details</th>
                      <th className="p-4 font-bold">SKU / Model</th>
                      <th className="p-4 font-bold">Category / Brand</th>
                      <th className="p-4 font-bold">Price Status</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-white/2 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">{prod.name}</div>
                          <div className="text-[10px] text-white/40 line-clamp-1 max-w-sm mt-0.5">{prod.description}</div>
                        </td>
                        <td className="p-4 font-mono text-white/70">{prod.sku || "N/A"} <br/> <span className="text-[10px] text-white/40">{prod.modelNumber || "N/A"}</span></td>
                        <td className="p-4">
                          <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-white/75">{prod.category?.name}</span>
                          {prod.brand?.name && <span className="block text-[10px] text-white/40 mt-1">Brand: {prod.brand.name}</span>}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white">
                            {prod.showPrice ? `₹${prod.price?.toLocaleString("en-IN") || "0"}` : "Hidden"}
                          </div>
                          <span className="text-[10px] text-white/40">{prod.contactForPrice ? "Contact For Pricing" : "Direct Order"}</span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleEditProductClick(prod)}
                            className="p-1.5 rounded bg-[#00e3fd]/10 border border-[#00e3fd]/20 hover:bg-[#00e3fd] hover:text-[#101415] text-[#00e3fd] transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            /* --- CATEGORIES BOARD --- */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white/50">{categoriesState.length} Categories loaded</span>
                <button
                  onClick={() => setIsCategoryFormOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-xs shadow transition-all"
                >
                  <Plus className="h-4.5 w-4.5" />
                  Add Category
                </button>
              </div>

              {isCategoryFormOpen && (
                <form onSubmit={handleCategorySubmit} className="glass-card rounded-xl border border-[#00e3fd]/20 bg-[#191c1e] p-6 shadow-xl flex gap-4 items-end text-xs">
                  <div className="flex-1 space-y-1">
                    <label className="text-white/60 block">Category Name *</label>
                    <input
                      type="text"
                      required
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="e.g. Gaming PC"
                      className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                    />
                  </div>
                  <button type="submit" className="px-5 py-2.5 rounded bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold">Create</button>
                  <button type="button" onClick={() => setIsCategoryFormOpen(false)} className="px-4 py-2.5 rounded border border-white/10 font-bold text-white">Cancel</button>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {categoriesState.map((cat) => (
                  <div key={cat.id} className="glass-card rounded-xl border border-white/5 p-5 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                      <span className="text-[10px] text-white/40 block mt-1 font-mono">Slug: {cat.slug}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "services" && (
            /* --- SERVICES BOARD --- */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white/50">{totalServices} Services</span>
                <button
                  onClick={() => setIsServiceFormOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-xs shadow transition-all"
                >
                  <Plus className="h-4.5 w-4.5" />
                  Add Service
                </button>
              </div>

              {isServiceFormOpen && (
                <div className="glass-card rounded-xl border border-[#00e3fd]/20 bg-[#191c1e] p-6 shadow-xl space-y-6">
                  <h3 className="text-sm font-bold font-display text-white border-b border-white/5 pb-2">Create New Service Offering</h3>
                  <form onSubmit={handleServiceSubmit} className="space-y-4 text-xs font-sans">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-white/60 block">Service Name *</label>
                        <input
                          type="text"
                          required
                          value={serviceForm.name}
                          onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                          placeholder="e.g. Printer Repair"
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block">Icon *</label>
                        <select
                          value={serviceForm.icon}
                          onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs bg-[#191c1e]"
                        >
                          <option value="Monitor">Monitor</option>
                          <option value="Laptop">Laptop</option>
                          <option value="Cpu">Cpu</option>
                          <option value="Wrench">Wrench</option>
                          <option value="Wifi">Wifi</option>
                          <option value="Video">Video</option>
                          <option value="Printer">Printer</option>
                          <option value="Keyboard">Keyboard</option>
                          <option value="ShieldCheck">ShieldCheck</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block">Display Order</label>
                        <input
                          type="number"
                          value={serviceForm.displayOrder}
                          onChange={(e) => setServiceForm({ ...serviceForm, displayOrder: Number(e.target.value) })}
                          placeholder="e.g. 1"
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-white/60 block">Banner Cover Image URL (Optional)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={serviceForm.bannerUrl}
                            onChange={(e) => setServiceForm({ ...serviceForm, bannerUrl: e.target.value })}
                            placeholder="https://example.com/banner.jpg"
                            className="flex-1 rounded-lg glass-input px-3 py-2 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => triggerMediaSelector("service", "bannerUrl")}
                            className="px-3 py-2 rounded bg-white/5 border border-white/10 font-bold"
                          >
                            Library
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block">Button CTA Text (Default: "Request Service")</label>
                        <input
                          type="text"
                          value={serviceForm.buttonText}
                          onChange={(e) => setServiceForm({ ...serviceForm, buttonText: e.target.value })}
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-white/60 block">Service Description *</label>
                      <textarea
                        required
                        rows={3}
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        placeholder="Detailed customer support specs..."
                        className="w-full rounded-lg glass-input px-3 py-2 text-xs resize-none"
                      />
                    </div>

                    <div className="flex gap-6 items-center pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={serviceForm.active}
                          onChange={(e) => setServiceForm({ ...serviceForm, active: e.target.checked })}
                          className="rounded border-white/10 bg-white/5 text-[#00e3fd] h-4.5 w-4.5"
                        />
                        <span className="font-semibold text-white/70">Active Listing</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={serviceForm.featured}
                          onChange={(e) => setServiceForm({ ...serviceForm, featured: e.target.checked })}
                          className="rounded border-white/10 bg-white/5 text-[#00e3fd] h-4.5 w-4.5"
                        />
                        <span className="font-semibold text-white/70">Featured on homepage</span>
                      </label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                      <button type="button" onClick={() => setIsServiceFormOpen(false)} className="px-4 py-2 rounded-lg border border-white/10 font-bold">Cancel</button>
                      <button type="submit" className="px-6 py-2 rounded-lg bg-[#00e3fd] text-[#101415] font-bold">Create Service</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Services listing table */}
              <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/25 text-white/50 font-geist uppercase tracking-wider text-[9px]">
                      <th className="p-4 font-bold">Service Details</th>
                      <th className="p-4 font-bold">Order / Icon</th>
                      <th className="p-4 font-bold">Visibility</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {servicesState.map((srv) => (
                      <tr key={srv.id} className="hover:bg-white/2 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">{srv.name}</div>
                          <p className="text-[10px] text-white/40 mt-1 line-clamp-1">{srv.description}</p>
                        </td>
                        <td className="p-4 font-mono">Order: {srv.displayOrder} <br/> <span className="text-[10px] text-[#00e3fd]">Icon: {srv.icon}</span></td>
                        <td className="p-4">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider font-geist ${srv.active ? "bg-[#00e3fd]/15 text-[#00e3fd]" : "bg-white/5 text-white/40"}`}>{srv.active ? "Active" : "Inactive"}</span>
                          {srv.featured && <span className="ml-1.5 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-bold">Featured</span>}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            className="p-1.5 rounded bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "gallery" && (
            /* --- PROJECTS GALLERY BOARD --- */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white/50">{totalGallery} Projects loaded</span>
                <button
                  onClick={() => setIsGalleryFormOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-xs shadow transition-all"
                >
                  <Plus className="h-4.5 w-4.5" />
                  Add Project Item
                </button>
              </div>

              {isGalleryFormOpen && (
                <div className="glass-card rounded-xl border border-[#00e3fd]/20 bg-[#191c1e] p-6 shadow-xl space-y-6">
                  <h3 className="text-sm font-bold font-display text-white border-b border-white/5 pb-2">Publish Project Work</h3>
                  <form onSubmit={handleGallerySubmit} className="space-y-4 text-xs font-sans">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-white/60 block">Project Title *</label>
                        <input
                          type="text"
                          required
                          value={galleryForm.title}
                          onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                          placeholder="e.g. 32 IP CCTV Setup at Vortex"
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block">Project Slug (For URL) *</label>
                        <input
                          type="text"
                          required
                          value={galleryForm.slug}
                          onChange={(e) => setGalleryForm({ ...galleryForm, slug: e.target.value })}
                          placeholder="e.g. surveillance-deployment-vortex"
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block">Service Relationship *</label>
                        <select
                          value={galleryForm.serviceId}
                          onChange={(e) => setGalleryForm({ ...galleryForm, serviceId: e.target.value })}
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs bg-[#191c1e]"
                        >
                          <option value="">Select service classification</option>
                          {servicesState.map((srv) => (
                            <option key={srv.id} value={srv.id}>{srv.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-white/60 block">Location *</label>
                        <input
                          type="text"
                          required
                          value={galleryForm.location}
                          onChange={(e) => setGalleryForm({ ...galleryForm, location: e.target.value })}
                          placeholder="e.g. Bhavnagar, Gujarat"
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block">Client Name (Optional)</label>
                        <input
                          type="text"
                          value={galleryForm.clientName}
                          onChange={(e) => setGalleryForm({ ...galleryForm, clientName: e.target.value })}
                          placeholder="e.g. Vortex Inc."
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block">Project Duration (Optional)</label>
                        <input
                          type="text"
                          value={galleryForm.duration}
                          onChange={(e) => setGalleryForm({ ...galleryForm, duration: e.target.value })}
                          placeholder="e.g. 5 Days"
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-white/60 block">Project Image URL *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={galleryForm.imageUrls[0] || ""}
                            onChange={(e) => setGalleryForm({ ...galleryForm, imageUrls: [e.target.value] })}
                            placeholder="https://example.com/project.jpg"
                            className="flex-1 rounded-lg glass-input px-3 py-2 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => triggerMediaSelector("gallery", "imageUrls")}
                            className="px-3 py-2 rounded bg-white/5 border border-white/10 font-bold"
                          >
                            Library
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block">Before Image URL (Optional)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={galleryForm.beforeImageUrl}
                            onChange={(e) => setGalleryForm({ ...galleryForm, beforeImageUrl: e.target.value })}
                            placeholder="https://example.com/before.jpg"
                            className="flex-1 rounded-lg glass-input px-3 py-2 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => triggerMediaSelector("gallery", "before")}
                            className="px-3 py-2 rounded bg-white/5 border border-white/10 font-bold"
                          >
                            Library
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block">After Image URL (Optional)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={galleryForm.afterImageUrl}
                            onChange={(e) => setGalleryForm({ ...galleryForm, afterImageUrl: e.target.value })}
                            placeholder="https://example.com/after.jpg"
                            className="flex-1 rounded-lg glass-input px-3 py-2 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => triggerMediaSelector("gallery", "after")}
                            className="px-3 py-2 rounded bg-white/5 border border-white/10 font-bold"
                          >
                            Library
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-white/60 block">Completion Date</label>
                        <input
                          type="date"
                          value={galleryForm.completionDate}
                          onChange={(e) => setGalleryForm({ ...galleryForm, completionDate: e.target.value })}
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs bg-[#191c1e]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-white/60 block">Display Order</label>
                        <input
                          type="number"
                          value={galleryForm.order}
                          onChange={(e) => setGalleryForm({ ...galleryForm, order: Number(e.target.value) })}
                          className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-white/60 block">Project Description *</label>
                      <textarea
                        required
                        rows={3}
                        value={galleryForm.description}
                        onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                        placeholder="Explain the client requirement and resolution..."
                        className="w-full rounded-lg glass-input px-3 py-2 text-xs resize-none"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input
                          type="checkbox"
                          checked={galleryForm.featured}
                          onChange={(e) => setGalleryForm({ ...galleryForm, featured: e.target.checked })}
                          className="rounded border-white/10 bg-white/5 text-[#00e3fd] h-4.5 w-4.5"
                        />
                        <span className="font-semibold text-white/70">Featured Project</span>
                      </label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                      <button type="button" onClick={() => setIsGalleryFormOpen(false)} className="px-4 py-2 rounded-lg border border-white/10 font-bold">Cancel</button>
                      <button type="submit" className="px-6 py-2 rounded-lg bg-[#00e3fd] text-[#101415] font-bold">Publish Item</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Gallery list cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {gallery.map((item) => (
                  <div key={item.id} className="glass-card rounded-xl border border-white/5 overflow-hidden flex flex-col justify-between">
                    <div className="relative aspect-video bg-black/40">
                      {item.images && item.images.length > 0 && (
                        <NextImage src={item.images[0].url} alt={item.title} fill className="object-cover opacity-60" />
                      )}
                      <span className="absolute top-2 left-2 rounded bg-white/15 px-2 py-0.5 text-[8px] font-bold font-geist text-white uppercase">{item.service?.name}</span>
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-white text-sm leading-tight">{item.title}</h4>
                      <p className="text-[11px] text-white/50 font-sans line-clamp-2">{item.description}</p>
                    </div>
                    <div className="p-4 pt-0 flex justify-between items-center text-[10px] border-t border-white/5 mt-2">
                      <span className="text-white/40">{item.location}</span>
                      <button
                        onClick={() => handleDeleteGallery(item.id)}
                        className="p-1 text-red-400 hover:text-white transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "brands" && (
            /* --- BRANDS MANAGER BOARD --- */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/50">{brandsState.length} Brands managed</span>
                <button
                  onClick={() => setIsBrandFormOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-xs shadow transition-all"
                >
                  <Plus className="h-4.5 w-4.5" />
                  Add Brand
                </button>
              </div>

              {isBrandFormOpen && (
                <form onSubmit={handleBrandSubmit} className="glass-card rounded-xl border border-[#00e3fd]/20 bg-[#191c1e] p-6 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs font-sans">
                  <div className="space-y-1">
                    <label className="text-white/60 block">Brand Name *</label>
                    <input
                      type="text"
                      required
                      value={brandForm.name}
                      onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                      placeholder="e.g. Dell"
                      className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/60 block">Logo URL *</label>
                    <input
                      type="text"
                      required
                      value={brandForm.logoUrl}
                      onChange={(e) => setBrandForm({ ...brandForm, logoUrl: e.target.value })}
                      placeholder="https://example.com/logo.svg"
                      className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-2.5 rounded bg-[#00e3fd] text-[#101415] font-bold shadow">Create</button>
                    <button type="button" onClick={() => setIsBrandFormOpen(false)} className="px-4 py-2.5 rounded border border-white/10 text-white">Cancel</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {brandsState.map((br) => (
                  <div key={br.id} className="glass-card rounded-xl border border-white/5 p-6 flex flex-col justify-between items-center text-center relative group">
                    <button
                      onClick={() => handleDeleteBrand(br.id)}
                      className="absolute top-2 right-2 p-1 text-red-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-sm font-bold text-white font-display uppercase mt-2">{br.name}</span>
                    <span className="text-[9px] text-white/35 font-mono mt-1 truncate max-w-full">{br.logoUrl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "testimonials" && (
            /* --- TESTIMONIALS (REVIEWS) BOARD --- */
            <div className="space-y-6">
              <span className="text-xs font-bold text-white/50">{testimonialsState.length} Customer Reviews listed</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonialsState.map((test) => (
                  <div key={test.id} className={`glass-card rounded-xl border p-6 flex flex-col justify-between shadow-lg relative ${test.approved ? "border-white/5" : "border-amber-500/20 bg-amber-500/3"}`}>
                    
                    {/* Delete button */}
                    <button
                      onClick={() => handleReviewDelete(test.id)}
                      className="absolute top-4 right-4 p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-red-400 transition-all"
                      title="Delete Review"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="space-y-4">
                      {/* Approved & Featured Badging */}
                      <div className="flex gap-2">
                        <span className={`text-[8px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 ${test.approved ? "bg-[#00e3fd]/15 text-[#00e3fd]" : "bg-amber-500/10 text-amber-400"}`}>
                          {test.approved ? "Approved" : "Pending Verification"}
                        </span>
                        {test.featured && (
                          <span className="text-[8px] font-bold uppercase tracking-wider rounded bg-white/5 border border-white/10 px-1.5 py-0.5">
                            Featured on Hero
                          </span>
                        )}
                        {test.verified && (
                          <span className="text-[8px] font-bold uppercase tracking-wider rounded bg-green-500/10 text-green-400 px-1.5 py-0.5">
                            Verified Customer
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(test.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>

                      <p className="text-white/80 text-xs italic font-sans">"{test.content}"</p>

                      {/* Reply section */}
                      <div className="pt-2 border-t border-white/5 space-y-2">
                        <span className="text-[9px] uppercase tracking-wider text-white/40 block font-bold">Business Response Reply:</span>
                        {test.replyFromBusiness ? (
                          <p className="text-white/60 text-[11px] leading-relaxed italic">"{test.replyFromBusiness}"</p>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Write a response reply..."
                              value={reviewReplyText[test.id] || ""}
                              onChange={(e) => setReviewReplyText({ ...reviewReplyText, [test.id]: e.target.value })}
                              className="flex-1 rounded glass-input px-2 py-1 text-xs"
                            />
                            <button
                              onClick={() => handleReviewReplySubmit(test.id)}
                              className="px-3 py-1 rounded bg-[#00e3fd] text-[#101415] font-bold text-xs"
                            >
                              Post
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 text-xs font-sans">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 font-bold text-white text-xs">
                          {test.customerName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white leading-none">{test.customerName}</div>
                          <div className="text-[10px] text-white/40 mt-1">{test.city || "Verified Client"}</div>
                        </div>
                      </div>

                      {/* Approval CTAs */}
                      <div className="flex gap-2">
                        {!test.approved && (
                          <button
                            onClick={() => handleReviewUpdate(test.id, { approved: true })}
                            className="px-3 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 font-bold hover:bg-green-500 hover:text-white transition-all text-[10px]"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleReviewUpdate(test.id, { featured: !test.featured })}
                          className="px-3 py-1 rounded bg-[#00e3fd]/10 border border-[#00e3fd]/20 text-[#00e3fd] font-bold text-[10px]"
                        >
                          {test.featured ? "Unfeature" : "Feature"}
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "cms" && (
            /* --- HOMEPAGE CMS BOARD --- */
            <div className="space-y-6">
              {/* Tabs for sections */}
              <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto">
                {["Hero", "About", "Why Choose Us", "Contact", "Footer", "Statistics", "General"].map((group) => (
                  <button
                    key={group}
                    onClick={() => setCmsActiveGroup(group)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all border ${
                      cmsActiveGroup === group
                        ? "bg-[#00e3fd]/10 border-[#00e3fd]/30 text-[#00e3fd]"
                        : "border-transparent text-white/50 hover:text-white"
                    }`}
                  >
                    {group} Settings
                  </button>
                ))}
              </div>

              {/* List of keys in active group */}
              <div className="space-y-4 max-w-3xl">
                {cmsGroupSettings.map((setting) => (
                  <div key={setting.id} className="glass-card rounded-xl border border-white/5 p-5 space-y-2.5 font-sans text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-white block text-sm">{setting.key}</span>
                        {setting.description && <p className="text-[10px] text-white/40 mt-0.5">{setting.description}</p>}
                      </div>
                      <span className="text-[8px] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider text-white/40">{setting.type}</span>
                    </div>

                    <div className="flex gap-2 pt-1 items-end">
                      {setting.type === "image" ? (
                        <div className="flex-1 space-y-1">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={setting.value}
                              onChange={(e) => handleCmsSettingSave(setting.key, e.target.value)}
                              className="flex-1 rounded-lg glass-input px-3 py-2 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => triggerMediaSelector("service", setting.key)} // matches direct callback
                              className="px-3 py-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 font-bold"
                            >
                              Library
                            </button>
                          </div>
                        </div>
                      ) : (
                        <textarea
                          rows={setting.value.length > 80 ? 4 : 1}
                          defaultValue={setting.value}
                          onBlur={(e) => handleCmsSettingSave(setting.key, e.target.value)}
                          placeholder="Configuration value..."
                          className="flex-1 rounded-lg glass-input px-3 py-2 text-xs resize-none"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "media" && (
            /* --- MEDIA LIBRARY MANAGER BOARD --- */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/35" />
                  <input
                    type="text"
                    placeholder="Search media files by name..."
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg glass-input text-xs w-48"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => document.getElementById("central-media-upload")?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-xs shadow transition-all disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload File
                  </button>
                  <input
                    id="central-media-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Grid representation */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {filteredMedia.length === 0 ? (
                  <div className="col-span-2 sm:col-span-4 text-center py-12 border border-dashed border-white/10 rounded-xl text-white/30 text-xs">
                    No files found in the media catalog.
                  </div>
                ) : (
                  filteredMedia.map((asset) => (
                    <div key={asset.id} className="glass-card rounded-xl border border-white/5 overflow-hidden flex flex-col justify-between group relative">
                      <div className="relative aspect-square bg-black/40 overflow-hidden">
                        <NextImage src={asset.url} alt={asset.filename} fill className="object-cover" />
                        
                        {/* Overlay option actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(asset.url);
                              alert("Media URL copied to clipboard!");
                            }}
                            className="w-full py-1.5 rounded bg-[#00e3fd] text-[#101415] font-bold text-[10px]"
                          >
                            Copy Link URL
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(asset.id)}
                            className="w-full py-1.5 rounded bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 text-[10px] font-bold transition-all"
                          >
                            Delete File
                          </button>
                        </div>
                      </div>

                      <div className="p-3 space-y-1 font-sans text-xs">
                        <span className="font-bold text-white block truncate leading-none">{asset.filename}</span>
                        <span className="text-[9px] text-white/35 block uppercase font-mono tracking-wider">{(asset.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            /* --- SECURITY AUDIT TRAILS BOARD --- */
            <div className="space-y-6">
              <span className="text-xs font-bold text-white/50">Last {activityLogs.length} audit logs loaded</span>
              <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/25 text-white/50 font-geist uppercase tracking-wider text-[9px]">
                        <th className="p-4 font-bold">Action / Trigger</th>
                        <th className="p-4 font-bold">Admin Operator</th>
                        <th className="p-4 font-bold">IP Address / User Agent</th>
                        <th className="p-4 font-bold text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                      {activityLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/2 transition-colors">
                          <td className="p-4 font-bold text-white font-mono">{log.action}</td>
                          <td className="p-4 text-white/70">{log.admin?.username || "System"}</td>
                          <td className="p-4 text-white/50 text-[10px]">
                            {log.ipAddress || "Unknown IP"} <br/>
                            <span className="text-white/30 truncate max-w-xs block mt-0.5">{log.userAgent || "Unknown UA"}</span>
                          </td>
                          <td className="p-4 text-right text-white/40">{new Date(log.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            /* --- ADMIN SETTINGS BOARD --- */
            <div className="max-w-md space-y-6">
              <div className="glass-card rounded-xl border border-white/5 p-6 space-y-4">
                <h3 className="text-sm font-bold font-display text-white tracking-wide">Change Security Password</h3>
                
                {passwordMessage && (
                  <div className={`p-3 rounded-lg border text-xs font-semibold leading-relaxed ${passwordSuccess ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                    {passwordMessage}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="text-white/60 block">Current Password *</label>
                    <input
                      type="password"
                      required
                      value={passwordOld}
                      onChange={(e) => setPasswordOld(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/60 block">New Password *</label>
                    <input
                      type="password"
                      required
                      value={passwordNew}
                      onChange={(e) => setPasswordNew(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg glass-input px-3 py-2 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-xs shadow"
                  >
                    Change Administrator Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Media Selector Overlay modal */}
      {isMediaSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-3xl rounded-xl border border-white/10 bg-[#101415] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold font-display text-white">Choose Asset from Media Library</h3>
              <button
                onClick={() => {
                  setIsMediaSelectorOpen(false);
                  setMediaSelectorTarget(null);
                }}
                className="text-white/40 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/35" />
              <input
                type="text"
                placeholder="Search library assets..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg glass-input text-xs w-full"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {filteredMedia.length === 0 ? (
                <div className="col-span-2 sm:col-span-4 text-center py-12 text-white/30 text-xs">
                  No assets cataloged. Upload files in the Media Library tab first.
                </div>
              ) : (
                filteredMedia.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => selectMediaUrl(asset.url)}
                    className="group border border-white/5 rounded-lg overflow-hidden bg-black/40 hover:border-[#00e3fd]/30 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-square">
                      <NextImage src={asset.url} alt={asset.filename} fill className="object-cover" />
                    </div>
                    <div className="p-2 truncate font-bold text-white text-[10px] bg-black/20">
                      {asset.filename}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
