import React, { useState } from "react";
import {
  Mail,
  Github,
  Linkedin,
  Copy,
  Check,
  ShieldCheck,
  Send,
  ExternalLink,
} from "lucide-react";

export const ContactSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const email = "yashwanth.reddy.eng@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <section id="contact" className="py-20 md:py-32 border-t border-white/[0.06] scroll-mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-4 backdrop-blur-md">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>04 // SECURE COMMUNICATION CHANNELS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-headings">
            Initiate Contact
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-body mt-3 leading-relaxed">
            Directly connect with Yashwanth Reddy G for autonomous AI systems architecture, applied ML swarms, or strategic technical leadership.
          </p>
        </div>

        {/* Contact Glass Bento Card */}
        <div className="max-w-2xl mx-auto rounded-3xl p-6 sm:p-10 bg-[#080d1a]/90 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Email Interaction Row */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-white/[0.08] mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 text-cyan-400 border border-blue-500/20 shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono font-bold text-cyan-400/80 uppercase tracking-widest block">
                  PRIMARY ENCRYPTED INBOX
                </span>
                <span className="text-sm sm:text-base font-mono font-bold text-white">
                  {email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/15 text-slate-200 text-xs font-mono font-semibold hover:bg-white/10 transition-colors shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${email}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-white text-xs font-tech font-bold hover:opacity-95 transition-opacity shadow-liquid-glow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Mail</span>
              </a>
            </div>
          </div>

          {/* Social Profiles Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <a
              href="https://github.com/yashwanth4545"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl bg-slate-950/70 border border-white/[0.08] hover:border-cyan-400/60 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white">
                  <Github className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white font-tech">GitHub Profile</div>
                  <div className="text-[10px] font-mono text-cyan-400/80">@yashwanth4545</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </a>

            <a
              href="https://linkedin.com/in/yashwanthreddy-g"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl bg-slate-950/70 border border-white/[0.08] hover:border-blue-400/60 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-blue-400">
                  <Linkedin className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white font-tech">LinkedIn Network</div>
                  <div className="text-[10px] font-mono text-blue-400/80">yashwanthreddy-g</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </a>
          </div>

          {/* Sovereign Security Guarantee */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              All inquiries received under cryptographic confidentiality. Zero spam, zero third-party telemetry leakage.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
