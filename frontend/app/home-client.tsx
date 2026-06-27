"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Monitor,
  Laptop,
  Wifi,
  Video,
  ShieldCheck,
  Keyboard,
  Cpu,
  Gamepad2,
  Wrench,
  Server,
  Globe,
  Network,
  Router,
  Printer,
  Flame,
  Database,
  Star,
  ExternalLink,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  MapPin,
  Clock,
  Mail,
  Phone,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TechBackground from "@/components/TechBackground";
import InquiryModal from "@/components/InquiryModal";
import Link from "next/link";
import Image from "next/image";

interface HomeClientProps {
  cms: any;
  galleryItems: any[];
  testimonials: any[];
  brands: any[];
  services: any[];
}

const getServiceIcon = (iconName: string) => {
  switch (iconName) {
    case "Monitor":
      return Monitor;
    case "Laptop":
      return Laptop;
    case "Cpu":
      return Cpu;
    case "Gamepad2":
      return Gamepad2;
    case "Keyboard":
      return Keyboard;
    case "Wifi":
      return Wifi;
    case "Network":
      return Network;
    case "Globe":
      return Globe;
    case "Router":
      return Router;
    case "Video":
      return Video;
    case "Printer":
      return Printer;
    case "Wrench":
      return Wrench;
    case "ShieldCheck":
      return ShieldCheck;
    case "Flame":
      return Flame;
    case "Database":
      return Database;
    case "Server":
      return Server;
    default:
      return Monitor;
  }
};

function AnimatedCounter({ value, suffix = "", duration = 1.5 }: { value: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const isNumeric = !isNaN(numericValue);

  useEffect(() => {
    if (isInView && isNumeric) {
      let start = 0;
      const end = numericValue;
      if (start === end) return;

      const totalMiliseconds = duration * 1000;
      const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 20);
      
      const timer = setInterval(() => {
        start += Math.ceil(end / (totalMiliseconds / incrementTime));
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        } else {
          setCount(start);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [isInView, numericValue, isNumeric, duration]);

  if (!isNumeric) {
    return <span ref={ref}>{value}</span>;
  }

  return <span ref={ref}>{count}{suffix || value.replace(/[0-9]/g, "")}</span>;
}

export default function HomeClient({ cms, galleryItems, testimonials, brands, services = [] }: HomeClientProps) {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("Computer");

  // Review submission state hooks
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewCity, setReviewCity] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewService, setReviewService] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewAvatar, setReviewAvatar] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const openInquiryForService = (service: string) => {
    setSelectedService(service);
    setIsInquiryOpen(true);
  };

  const activeServices = (services || []).filter((s) => s.active);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewContent) {
      setReviewMessage("Please fill in your name and review details.");
      return;
    }
    setReviewSubmitting(true);
    setReviewMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/testimonials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: reviewName,
          city: reviewCity,
          rating: reviewRating,
          serviceUsed: reviewService,
          content: reviewContent,
          avatarUrl: reviewAvatar,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewMessage("Thank you! Your review has been submitted and is pending administrator approval.");
        setTimeout(() => {
          setIsReviewOpen(false);
          setReviewName("");
          setReviewCity("");
          setReviewRating(5);
          setReviewService("");
          setReviewContent("");
          setReviewAvatar("");
          setReviewMessage("");
        }, 3000);
      } else {
        setReviewMessage(data.message || "Failed to submit review. Please try again.");
      }
    } catch (err) {
      setReviewMessage("Failed to connect to the backend server. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <>
      <TechBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden px-6 md:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#101415]/80 pointer-events-none" />
        
        {/* Animated Radial Glows */}
        <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-[#b1c7f2]/3 pulse-glow blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-[#00e3fd]/3 pulse-glow blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#00e3fd]/10 border border-[#00e3fd]/20 px-4 py-1.5 text-[#00e3fd]">
              <span className="h-2 w-2 rounded-full bg-[#00e3fd] animate-pulse" />
              <span className="text-[10px] font-bold font-geist uppercase tracking-widest">
                Premium Hardware & Security Solutions
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white font-display leading-[1.1] tracking-tight">
              {cms.hero_title || "Smart Technology. Better Solutions."}
            </h1>

            <p className="text-white/60 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-sans leading-relaxed">
              {cms.hero_subtitle || "One Stop Solution For All Your IT Needs."}
            </p>

            <div className="pt-6 flex flex-wrap justify-center items-center gap-4">
              <button
                onClick={() => openInquiryForService("Computer")}
                className="px-8 py-3.5 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-sm shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Request Service
              </button>
              <Link
                href="/products"
                className="px-8 py-3.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all duration-200"
              >
                Explore Products
              </Link>
              <Link
                href="#contact"
                className="px-8 py-3.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all duration-200"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-24 px-6 md:px-8 border-t border-white/5 bg-[#101415]/90">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-block text-[#00e3fd] font-geist text-[10px] uppercase font-bold tracking-widest">
                Core Identity
              </div>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight">
                {cms.about_title || "Expert Tech Infrastructure & Services"}
              </h2>
              <p className="text-white/60 text-sm font-sans leading-relaxed">
                {cms.about_text || "At HD Tech Solutions, we specialize in high-quality computer sales, laptop sales, networking solutions, CCTV installation, computer repair, laptop repair, accessories, AMC services, and complete office IT setups. With over 2 years of active industry experience and a firm customer-first approach, we aim to provide reliable, top-tier technology support and maintenance services tailored to the needs of both local homes and businesses."}
              </p>
              
              {/* Highlight Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00e3fd] shrink-0" />
                  <span className="text-xs font-semibold text-white/80">Certified Technicians</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00e3fd] shrink-0" />
                  <span className="text-xs font-semibold text-white/80">High-Performance Parts</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00e3fd] shrink-0" />
                  <span className="text-xs font-semibold text-white/80">SLA Business Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00e3fd] shrink-0" />
                  <span className="text-xs font-semibold text-white/80">24/7 Security Architecture</span>
                </div>
              </div>
            </motion.div>

            {/* Glass Statistics Block */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card rounded-xl p-8 border border-white/10 shadow-xl space-y-6"
            >
              <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider">Company Achievements</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="block text-3xl font-extrabold text-[#00e3fd] font-display">
                    <AnimatedCounter value={cms.Experience || "2+"} />
                  </span>
                  <span className="block text-[10px] uppercase tracking-wider text-white/40 font-geist font-bold">
                    Years Experience
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="block text-3xl font-extrabold text-white font-display">
                    <AnimatedCounter value={cms.SystemsInstalled || "350+"} />
                  </span>
                  <span className="block text-[10px] uppercase tracking-wider text-white/40 font-geist font-bold">
                    Systems Assembled
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="block text-3xl font-extrabold text-[#00e3fd] font-display">
                    <AnimatedCounter value={cms.CCTVNodes || "40+"} />
                  </span>
                  <span className="block text-[10px] uppercase tracking-wider text-white/40 font-geist font-bold">
                    CCTV Nodes Deployed
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="block text-3xl font-extrabold text-white font-display">
                    <AnimatedCounter value={cms.HappyClients || "100%"} />
                  </span>
                  <span className="block text-[10px] uppercase tracking-wider text-white/40 font-geist font-bold">
                    Happy Clients
                  </span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative py-24 px-6 md:px-8 border-t border-white/5 bg-[#0b0f10]/80">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-4 max-w-xl mx-auto mb-16">
            <div className="text-[#00e3fd] font-geist text-[10px] uppercase font-bold tracking-widest">Our Capabilities</div>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight">Structured IT Services</h2>
            <p className="text-white/50 text-xs font-sans">
              Expert planning, implementation, and long-term support for corporate offices, commercial centers, and smart residences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeServices.map((srv, index) => {
              const Icon = getServiceIcon(srv.icon);
              const features = srv.category ? [srv.category, "Custom Configuration", "Full Support"] : ["Custom Configuration", "Full Support"];
              return (
                <motion.div
                  key={srv.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="glass-card rounded-xl border border-white/5 p-6 md:p-8 flex flex-col justify-between group hover:border-[#00e3fd]/30 shadow-lg relative overflow-hidden"
                >
                  <div className="space-y-5">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-[#00e3fd]/10 text-[#00e3fd] group-hover:bg-[#00e3fd] group-hover:text-[#101415] transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold font-display text-white group-hover:text-[#00e3fd] transition-colors">
                        {srv.name}
                      </h3>
                      <p className="text-white/60 text-xs font-sans leading-relaxed">
                        {srv.description}
                      </p>
                    </div>
                    <ul className="space-y-1.5 pt-2">
                      {features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-white/50 text-[11px] font-sans">
                          <span className="h-1 w-1 rounded-full bg-[#00e3fd]" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-6">
                    <button
                      onClick={() => openInquiryForService(srv.name)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00e3fd] hover:text-[#bdf4ff] group/btn transition-colors"
                    >
                      Request Support
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative py-24 px-6 md:px-8 border-t border-white/5 bg-[#101415]/90">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#00e3fd]/3 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative">
          <div className="text-center space-y-4 max-w-xl mx-auto mb-16">
            <div className="text-[#00e3fd] font-geist text-[10px] uppercase font-bold tracking-widest">Our Value Proposition</div>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight">Why Choose Us</h2>
            <p className="text-white/50 text-xs font-sans">
              We combine enterprise-level engineering standards with personalized local support to deliver unmatched technological reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Genuine Products", desc: "100% authentic hardware, sourced directly from authorized distributors with full manufacturer warranties." },
              { title: "Certified Technicians", desc: "Certified and highly trained engineering staff to ensure precise diagnosis and installation." },
              { title: "Affordable Pricing", desc: "Transparent, upfront project estimates with competitive rates and zero hidden charges." },
              { title: "Fast Support", desc: "Rapid-response remote assistance and on-site repair visits to minimize your business downtime." },
              { title: "Professional Installation", desc: "Impeccably neat cable management, optimized setups, and structured rack cabling." },
              { title: "Warranty Assistance", desc: "We fully manage the warranty support loop for any hardware purchased through us, stress-free." },
              { title: "After-Sales Support", desc: "Continuous firmware updates, troubleshooting, and dedicated maintenance follow-ups." },
              { title: "Customer Satisfaction", desc: "A client-first ethos, backed by outstanding long-term reviews from local homes and offices." }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="glass-card rounded-xl border border-white/5 p-6 hover:border-[#00e3fd]/20 transition-all duration-300 shadow-md flex flex-col gap-3 group bg-black/20"
              >
                <div className="h-2 w-12 rounded-full bg-gradient-to-r from-[#00e3fd] to-[#2380ff] group-hover:w-20 transition-all duration-300" />
                <h3 className="text-sm font-bold font-display text-white mt-1 group-hover:text-[#00e3fd] transition-colors">{item.title}</h3>
                <p className="text-white/50 text-[11px] font-sans leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Highlight Section */}
      <section className="relative py-24 px-6 md:px-8 border-t border-white/5 bg-[#101415]/95">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4 max-w-xl">
              <div className="text-[#00e3fd] font-geist text-[10px] uppercase font-bold tracking-widest">Our Work</div>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight">Recent Installations</h2>
              <p className="text-white/50 text-xs font-sans">
                Browse our completed custom builds, corporate networking architectures, and enterprise security configurations.
              </p>
            </div>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-xs text-white font-bold transition-all duration-200 shrink-0"
            >
              View Full Gallery
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {galleryItems.slice(0, 3).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-xl overflow-hidden border border-white/5 bg-[#191c1e] shadow-xl hover:border-[#00e3fd]/20 transition-all duration-300"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20">
                  <Image
                    src={item.imageUrls[0]}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101415] via-[#101415]/20 to-transparent opacity-80" />
                  
                  {/* Service tag */}
                  <span className="absolute top-4 left-4 rounded-full bg-[#00e3fd]/10 border border-[#00e3fd]/20 px-3 py-1 text-[9px] font-bold font-geist text-[#00e3fd] uppercase tracking-wider">
                    {item.service}
                  </span>
                </div>
                <div className="p-6 space-y-3 relative">
                  <div className="flex items-center gap-1 text-[10px] font-bold font-geist text-white/40 uppercase tracking-wider">
                    <MapPin className="h-3 w-3 text-[#00e3fd]" />
                    <span>{item.location}</span>
                  </div>
                  <h3 className="text-base font-bold font-display text-white leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-white/60 text-xs font-sans leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Carousel Section */}
      <section className="relative py-16 border-t border-white/5 bg-[#0b0f10]/90 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 md:px-8 mb-8 text-center">
          <div className="text-[10px] font-bold font-geist text-white/35 uppercase tracking-widest">
            Authorized Distributor & Partner Brands
          </div>
        </div>

        {/* Marquee Banner */}
        <div className="flex select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
          <div className="flex gap-16 animate-marquee py-2 shrink-0 min-w-full justify-around">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center justify-center h-12 grayscale opacity-45 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                <span className="text-sm font-bold tracking-tight text-white font-display uppercase">{brand.name}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-16 animate-marquee py-2 shrink-0 min-w-full justify-around" aria-hidden="true">
            {brands.map((brand) => (
              <div key={`${brand.id}-dup`} className="flex items-center justify-center h-12 grayscale opacity-45 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                <span className="text-sm font-bold tracking-tight text-white font-display uppercase">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>

        <style jsx global>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee {
            animation: marquee 25s linear infinite;
          }
        `}</style>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24 px-6 md:px-8 border-t border-white/5 bg-[#101415]/95">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-4 max-w-xl mx-auto mb-16">
            <div className="text-[#00e3fd] font-geist text-[10px] uppercase font-bold tracking-widest">Client Feedback</div>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight">
              {cms.review_heading || "Trust & Performance"}
            </h2>
            <p className="text-white/50 text-xs font-sans">
              See what business operational heads and private clients say about our service SLAs and system integration skills.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsReviewOpen(true)}
                className="px-5 py-2.5 rounded-lg border border-[#00e3fd]/30 hover:border-[#00e3fd] bg-[#00e3fd]/5 hover:bg-[#00e3fd]/10 text-[#00e3fd] font-bold text-xs transition-all duration-200"
              >
                Leave a Review
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.length === 0 ? (
              <div className="col-span-1 md:col-span-3 text-center py-12 glass-card rounded-xl border border-white/5 bg-black/10">
                <p className="text-white/40 text-xs font-sans">No customer reviews available yet. Be the first to share your experience!</p>
              </div>
            ) : (
              testimonials.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card rounded-xl border border-white/5 p-6 md:p-8 flex flex-col justify-between shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-1 text-[#00e3fd]">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-white/70 text-xs font-sans leading-relaxed italic">
                      "{test.content}"
                    </p>
                    {test.replyFromBusiness && (
                      <div className="mt-4 p-3 rounded bg-white/5 border-l-2 border-[#00e3fd] text-[11px] font-sans">
                        <span className="font-bold text-white block mb-0.5">Response from HD Tech Solutions:</span>
                        <p className="text-white/60 leading-relaxed italic">"{test.replyFromBusiness}"</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 pt-6 border-t border-white/5 mt-6">
                    {test.avatarUrl ? (
                      <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                        <Image
                          src={test.avatarUrl}
                          alt={test.customerName}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 font-bold text-xs text-white">
                        {test.customerName.charAt(0)}
                      </div>
                    )}
                    <div className="font-sans">
                      <div className="text-xs font-bold text-white leading-none">
                        {test.customerName}
                        {test.verified && <span className="ml-1.5 text-[8px] bg-[#00e3fd]/10 text-[#00e3fd] border border-[#00e3fd]/20 rounded-full px-1.5 py-0.5 font-bold uppercase tracking-wider">Verified</span>}
                      </div>
                      <div className="text-[10px] text-white/40 mt-1">{test.city || "Verified Client"}</div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-24 px-6 md:px-8 border-t border-white/5 bg-[#0b0f10]/95">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            
            {/* Contact Details */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="text-[#00e3fd] font-geist text-[10px] uppercase font-bold tracking-widest">Connect With Us</div>
                <h2 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight">Let's Secure & Connect</h2>
                <p className="text-white/60 text-xs font-sans leading-relaxed">
                  Have an upcoming office expansion or need a custom CCTV camera consultation? Contact us using the details below or request service online for priority SLA routing.
                </p>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-[#00e3fd] shrink-0 mt-0.5">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold font-display uppercase tracking-widest text-[9px] text-white/40 mb-1">Office Location</h4>
                    <p className="text-white/70">{cms.contact_address || "Q4JX+M5Q, Mama Kotha Road, Near Khara Kuva, Hira Street, Karchaliya Para, Bhavnagar, Gujarat 364001"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-[#00e3fd] shrink-0 mt-0.5">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold font-display uppercase tracking-widest text-[9px] text-white/40 mb-1">Direct Call</h4>
                    <p className="text-white/70 hover:text-[#00e3fd] transition-colors">
                      <a href={`tel:${cms.contact_phone}`}>{cms.contact_phone}</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-[#00e3fd] shrink-0 mt-0.5">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold font-display uppercase tracking-widest text-[9px] text-white/40 mb-1">Email Address</h4>
                    <p className="text-white/70 hover:text-[#00e3fd] transition-colors">
                      <a href={`mailto:${cms.contact_email}`}>{cms.contact_email}</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-[#00e3fd] shrink-0 mt-0.5">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold font-display uppercase tracking-widest text-[9px] text-white/40 mb-1">Working Hours</h4>
                    <p className="text-white/70">{cms.business_hours}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-4">
                <a
                  href={`https://wa.me/${cms.contact_whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp Direct Chat
                </a>
                <button
                  onClick={() => openInquiryForService("Computer")}
                  className="px-6 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors"
                >
                  Request Service
                </button>
              </div>
            </div>

            {/* Custom Interactive Styled Map */}
            <div className="w-full relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-[#191c1e] shadow-xl group">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(cms.contact_address || "Q4JX+M5Q, Mama Kotha Road, Near Khara Kuva, Hira Street, Karchaliya Para, Bhavnagar, Gujarat 364001")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)" }}
                allowFullScreen={false}
                loading="lazy"
                title="Google Maps"
                className="absolute inset-0 w-full h-full"
              ></iframe>
              <div className="absolute top-4 right-4 z-10">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(cms.contact_address || "Q4JX+M5Q, Mama Kotha Road, Near Khara Kuva, Hira Street, Karchaliya Para, Bhavnagar, Gujarat 364001")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#0b0f10]/80 backdrop-blur-sm border border-white/10 hover:border-[#00e3fd]/30 hover:bg-[#00e3fd]/10 text-white font-semibold text-[10px] tracking-wide transition-all flex items-center gap-1.5"
                >
                  <span>Get Directions</span>
                  <ExternalLink className="h-3 w-3 text-[#00e3fd]" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />

      {/* Inquiry Form Modal */}
      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        defaultService={selectedService}
      />

      {/* Review Submission Modal */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-xl border border-white/10 bg-[#101415] p-6 shadow-2xl space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00e3fd] to-[#2380ff]" />
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold font-display text-white">Share Your Feedback</h3>
              <button
                onClick={() => setIsReviewOpen(false)}
                className="text-white/40 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
              {reviewMessage && (
                <div className="p-3 rounded-lg bg-[#00e3fd]/10 border border-[#00e3fd]/20 text-[#00e3fd] font-medium leading-relaxed">
                  {reviewMessage}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-white/60 font-semibold block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full rounded bg-white/5 border border-white/10 p-2 text-white outline-none focus:border-[#00e3fd] transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-white/60 font-semibold block">Your City (Optional)</label>
                  <input
                    type="text"
                    value={reviewCity}
                    onChange={(e) => setReviewCity(e.target.value)}
                    placeholder="e.g. Bhavnagar"
                    className="w-full rounded bg-white/5 border border-white/10 p-2 text-white outline-none focus:border-[#00e3fd] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-white/60 font-semibold block">Service Used (Optional)</label>
                  <input
                    type="text"
                    value={reviewService}
                    onChange={(e) => setReviewService(e.target.value)}
                    placeholder="e.g. Laptop Repair"
                    className="w-full rounded bg-white/5 border border-white/10 p-2 text-white outline-none focus:border-[#00e3fd] transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-white/60 font-semibold block">Rating *</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full rounded bg-white/5 border border-white/10 p-2 text-white outline-none focus:border-[#00e3fd] transition-colors bg-[#101415]"
                  >
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Poor</option>
                    <option value={1}>1 Star - Terrible</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold block">Avatar URL (Optional)</label>
                <input
                  type="url"
                  value={reviewAvatar}
                  onChange={(e) => setReviewAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full rounded bg-white/5 border border-white/10 p-2 text-white outline-none focus:border-[#00e3fd] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60 font-semibold block">Your Review *</label>
                <textarea
                  required
                  rows={4}
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Share details of your experience..."
                  className="w-full rounded bg-white/5 border border-white/10 p-2 text-white outline-none focus:border-[#00e3fd] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full py-2.5 rounded bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] disabled:opacity-50"
              >
                {reviewSubmitting ? "Submitting feedback..." : "Submit Review for Verification"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
