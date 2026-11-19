import React, { useState } from "react";
import {
  Mail,
  Github,
  Linkedin,
  Copy,
  Check,
  ShieldCheck,
  Send,
  MapPin,
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
    <section id="contact" className="py-16 md:py-24 border-t border-white/10 scroll-mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-tech font-bold mb-3 shadow-liquid-card">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            DIRECT VERIFIED COMMUNICATION
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-headings">
            Connect & Collaborate
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-body mt-2 leading-relaxed">
            Interested in autonomous AI multi-agent orchestration, calibrated applied ML pipelines, or resilient full-stack systems engineering? Reach out directly.
          </p>
        </div>

        {/* Contact Glass Card */}
        <div className="max-w-2xl mx-auto glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl">
          {/* Email Interaction Row */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-white/10 shadow-inner mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 rounded-2xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono font-bold text-cyan-400/80 uppercase tracking-wider block">
                  PRIMARY EMAIL
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
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/15 text-slate-200 text-xs font-tech font-semibold hover:bg-white/10 transition-colors shadow-xs"
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
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-tech font-bold hover:from-blue-500 hover:to-cyan-400 transition-colors shadow-liquid-glow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Mail</span>
              </a>
            </div>
          </div>

          {/* Social Profiles & Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <a
              href="https://github.com/yashwanth4545"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-cyan-400/60 transition-all shadow-xs flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white">
                  <Github className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white font-tech">GitHub Profile</div>
                  <div className="text-[11px] font-mono text-cyan-400">@yashwanth4545</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition-colors" />
            </a>

            <a
              href="https://linkedin.com/in/yashwanthreddy-g"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-blue-400 transition-all shadow-xs flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                  <Linkedin className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white font-tech">LinkedIn Network</div>
                  <div className="text-[11px] font-mono text-blue-300">/in/yashwanthreddy-g</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition-colors" />
            </a>
          </div>

          {/* Location & Cryptographic Provenance Indicator */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-tech">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bengaluru, India / Remote</span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified System Hash: 0x7F4A992C</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
