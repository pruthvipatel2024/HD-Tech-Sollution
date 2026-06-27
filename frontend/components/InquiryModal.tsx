import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Loader2, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getServices } from "@/services/cms";
import { submitInquiry } from "@/services/inquiries";
import { uploadFile } from "@/services/upload";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export default function InquiryModal({ isOpen, onClose, defaultService = "Computer" }: InquiryModalProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    mobileNumber: "",
    email: "",
    message: "",
  });

  const [services, setServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      getServices()
        .then((res) => {
          setServices(res);
          if (res.length > 0) {
            const matched = res.find(
              (s: any) =>
                s.category.toLowerCase().includes(defaultService.toLowerCase()) ||
                s.name.toLowerCase().includes(defaultService.toLowerCase())
            );
            setSelectedServiceId(matched ? matched.id : res[0].id);
          }
        })
        .catch((err) => {
          console.error("Failed to load services in InquiryModal:", err);
        });
    }
  }, [isOpen, defaultService]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size must be less than 5MB");
      return;
    }

    setImageFile(file);
    setIsUploadingImage(true);
    setErrorMsg("");

    try {
      const secureUrl = await uploadFile(file);
      setImageUrl(secureUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.mobileNumber || !formData.message || !selectedServiceId) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const attachments = imageUrl ? [{ url: imageUrl, name: imageFile?.name || "screenshot" }] : [];

      await submitInquiry({
        customerName: formData.customerName,
        mobileNumber: formData.mobileNumber,
        email: formData.email || undefined,
        serviceId: selectedServiceId,
        message: formData.message,
        attachments,
      });

      setSubmitSuccess(true);
      // Reset form
      setFormData({
        customerName: "",
        mobileNumber: "",
        email: "",
        message: "",
      });
      setImageFile(null);
      setImageUrl("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#191c1e] p-6 shadow-2xl md:p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h2 className="text-xl font-bold font-display text-white">
                {submitSuccess ? "Request Submitted" : "Request IT & Security Service"}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/50 hover:bg-white/5 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitSuccess ? (
              /* Success State */
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 className="h-16 w-16 text-[#00e3fd] mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Inquiry Submitted Successfully</h3>
                <p className="text-white/60 text-sm max-w-sm mb-6 font-sans">
                  Thank you for contacting HD Tech Solutions. Our technical support team will reach out to your mobile number shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitSuccess(false);
                    onClose();
                  }}
                  className="px-6 py-2 rounded-lg bg-[#00e3fd] text-[#101415] hover:bg-[#bdf4ff] font-semibold text-sm transition-all"
                >
                  Close Window
                </button>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit} className="mt-6 space-y-4 font-sans text-sm">
                {errorMsg && (
                  <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-white/70 mb-1.5 font-geist uppercase text-[10px] tracking-wider font-semibold">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full rounded-lg glass-input px-4 py-2.5"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 mb-1.5 font-geist uppercase text-[10px] tracking-wider font-semibold">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      required
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="Enter mobile number"
                      className="w-full rounded-lg glass-input px-4 py-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1.5 font-geist uppercase text-[10px] tracking-wider font-semibold">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      className="w-full rounded-lg glass-input px-4 py-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-white/70 mb-1.5 font-geist uppercase text-[10px] tracking-wider font-semibold">
                      Select Service *
                    </label>
                    <select
                      name="serviceId"
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full rounded-lg glass-input px-4 py-2.5"
                    >
                      {services.map((srv) => (
                        <option key={srv.id} value={srv.id} className="bg-[#191c1e]">
                          {srv.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 mb-1.5 font-geist uppercase text-[10px] tracking-wider font-semibold">
                    Description of Requirement *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={3}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe your issue or what configuration you need..."
                    className="w-full rounded-lg glass-input px-4 py-2.5 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1.5 font-geist uppercase text-[10px] tracking-wider font-semibold">
                    Upload Photo/Screenshot (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-white transition-all duration-200"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#00e3fd]" />
                      ) : (
                        <Upload className="h-4 w-4 text-[#00e3fd]" />
                      )}
                      <span className="font-semibold text-xs">Choose File</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {imageUrl ? (
                      <div className="flex items-center gap-2 bg-[#00e3fd]/10 border border-[#00e3fd]/20 rounded-lg px-3 py-1.5 text-[#bdf4ff]">
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-[11px] font-semibold max-w-[150px] truncate">
                          {imageFile ? imageFile.name : "Image Ready"}
                        </span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#00e3fd]" />
                      </div>
                    ) : (
                      <span className="text-white/40 text-xs font-sans">No file selected (Max 5MB)</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 font-semibold text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingImage}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold shadow-[0_0_15px_rgba(0,229,255,0.25)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] disabled:opacity-50 transition-all duration-300"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Submit Inquiry
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
