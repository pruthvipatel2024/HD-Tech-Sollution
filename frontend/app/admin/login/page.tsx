"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Lock, User, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { login } from "@/services/auth";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await login(username, password);

      // Hard redirect to dashboard so middleware triggers and reloads active sessions
      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#101415] text-[#e0e3e5] px-6 py-12 overflow-hidden font-sans">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-[#00e3fd]/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-[#b1c7f2]/5 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-[#00e3fd] hover:text-[#bdf4ff] mb-8 font-geist transition-colors">
          <ArrowLeft className="h-3 w-3" />
          Back to public site
        </Link>

        {/* Card */}
        <div className="glass-card rounded-xl border border-white/10 p-8 shadow-2xl relative">
          
          {/* Logo Title */}
          <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
            <div className="relative flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-[#00e3fd] to-[#2380ff] shadow-[0_0_15px_rgba(0,229,255,0.35)]">
              <Cpu className="h-6 w-6 text-[#101415]" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold font-display text-white">Admin Control Center</h1>
              <p className="text-white/40 text-xs">Access the HD Tech Solutions management dashboard</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 text-sm">
            {errorMsg && (
              <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs text-center font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-white/60 font-geist uppercase text-[9px] tracking-wider font-bold">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/45" />
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg glass-input text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-white/60 font-geist uppercase text-[9px] tracking-wider font-bold">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/45" />
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg glass-input text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#00e3fd] hover:bg-[#bdf4ff] text-[#101415] font-bold text-xs shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] disabled:opacity-50 transition-all duration-300"
              >
                {isSubmitting && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                Sign In
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
