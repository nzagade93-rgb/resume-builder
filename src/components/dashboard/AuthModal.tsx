"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasLocalResume?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  hasLocalResume = true,
}) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast("Please enter a valid email address.", "error");
      return;
    }

    setLoading(true);
    try {
      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
      }
      setMagicLinkSent(true);
      toast("Magic link sent! Please check your inbox.", "success");
    } catch (err: any) {
      toast(err.message || "Failed to send magic link.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
      } else {
        toast("Guest mode: running locally without cloud credentials.", "info");
        onClose();
      }
    } catch (err: any) {
      toast(err.message || "Failed to initiate Google sign-in.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🔐 Save & Sync Across Devices"
      description="Sign in with your email or Google account to access your resumes from anywhere."
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Local Resume Notice */}
        {hasLocalResume && (
          <div className="p-3 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 rounded-xl text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
            <span className="text-base leading-none">💾</span>
            <div>
              <p className="font-bold text-[11.5px]">Local Resume Detected</p>
              <p className="text-[11px] text-teal-800 dark:text-teal-300 leading-relaxed mt-0.5">
                Your current resume on this device will automatically be backed up to your cloud account upon signing in.
              </p>
            </div>
          </div>
        )}

        {magicLinkSent ? (
          <div className="p-5 text-center space-y-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-2xl">✉️</span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Check your inbox!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              We sent a password-free sign-in link to <strong>{email}</strong>. Click the link to access your resumes.
            </p>
            <div className="pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setMagicLinkSent(false)}>
                Use another email
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] text-slate-900 dark:text-slate-100 placeholder:italic placeholder:text-[#94A3B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#090D16] transition"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Sending link..." : "✨ Send Magic Link"}
            </Button>

            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative bg-white dark:bg-[#0F172A] px-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Or Continue With
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </form>
        )}

        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-[10.5px] text-slate-500 dark:text-slate-400 text-center">
          <p>
            Guest Mode is always available. You can continue editing without an account anytime.
          </p>
        </div>
      </div>
    </Modal>
  );
};
