"use client";

import React from "react";

interface DiamondLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  animated?: boolean;
}

export default function DiamondLogo({
  size = "md",
  showText = true,
  animated = true,
}: DiamondLogoProps) {
  const sizeMap = {
    sm: { box: "w-8 h-8", svg: 26, text: "text-sm", sub: "text-[9px]" },
    md: { box: "w-10 h-10", svg: 32, text: "text-base", sub: "text-[10px]" },
    lg: { box: "w-14 h-14", svg: 46, text: "text-xl", sub: "text-xs" },
    xl: { box: "w-20 h-20", svg: 68, text: "text-3xl", sub: "text-sm" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className="flex items-center gap-3 group select-none">
      {/* Faceted Prismatic Diamond Emblem */}
      <div
        className={`relative ${currentSize.box} rounded-2xl flex items-center justify-center p-0.5 transition-all duration-500`}
      >
        {/* Prismatic Outer Glow Orb */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 rounded-2xl blur-md opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 animate-pulse" />

        {/* Crystalline Glass Container */}
        <div className="relative w-full h-full bg-[#040810]/90 backdrop-blur-xl rounded-[14px] border border-cyan-400/50 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:border-cyan-300">
          {/* Holographic Diamond Sheen Sweep */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
          )}

          {/* Precision 3D Faceted Diamond SVG */}
          <svg
            width={currentSize.svg}
            height={currentSize.svg}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.6)] transform group-hover:rotate-3 group-hover:scale-105 transition-transform duration-300"
          >
            <defs>
              {/* Linear Gradients for 3D Diamond Facets */}
              <linearGradient id="facetTable" x1="20" y1="12" x2="44" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#cffafe" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="facetTopLeft" x1="8" y1="24" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              <linearGradient id="facetTopRight" x1="42" y1="12" x2="56" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>

              <linearGradient id="facetCenterCrown" x1="22" y1="24" x2="42" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a5f3fc" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              <linearGradient id="facetPavilionLeft" x1="8" y1="24" x2="32" y2="54" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="70%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>

              <linearGradient id="facetPavilionCenter" x1="22" y1="24" x2="32" y2="54" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              <linearGradient id="facetPavilionRight" x1="56" y1="24" x2="32" y2="54" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="70%" stopColor="#4338ca" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>

              {/* Sparkle Glow Filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Facet 1: Table (Top Flat Octagon/Trapezoid) */}
            <polygon points="22,12 42,12 36,22 28,22" fill="url(#facetTable)" />

            {/* Facet 2: Upper Left Crown */}
            <polygon points="8,24 22,12 28,22" fill="url(#facetTopLeft)" />

            {/* Facet 3: Upper Right Crown */}
            <polygon points="42,12 56,24 36,22" fill="url(#facetTopRight)" />

            {/* Facet 4: Center Upper Triangle */}
            <polygon points="28,22 36,22 32,24" fill="url(#facetCenterCrown)" />

            {/* Facet 5: Center Crown Trapezoid */}
            <polygon points="8,24 28,22 32,24 22,24" fill="#67e8f9" fillOpacity="0.85" />
            <polygon points="56,24 36,22 32,24 42,24" fill="#a78bfa" fillOpacity="0.85" />

            {/* Facet 6: Lower Pavilion Left */}
            <polygon points="8,24 22,24 32,54" fill="url(#facetPavilionLeft)" />

            {/* Facet 7: Lower Pavilion Center Main */}
            <polygon points="22,24 42,24 32,54" fill="url(#facetPavilionCenter)" />

            {/* Facet 8: Lower Pavilion Right */}
            <polygon points="42,24 56,24 32,54" fill="url(#facetPavilionRight)" />

            {/* Crystalline Light Reflection Edges */}
            <line x1="22" y1="12" x2="42" y2="12" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="22" y1="12" x2="8" y2="24" stroke="#ffffff" strokeWidth="0.9" />
            <line x1="42" y1="12" x2="56" y2="24" stroke="#e0e7ff" strokeWidth="0.9" />
            <line x1="8" y1="24" x2="32" y2="54" stroke="#67e8f9" strokeWidth="0.8" />
            <line x1="56" y1="24" x2="32" y2="54" stroke="#c084fc" strokeWidth="0.8" />
            <line x1="22" y1="24" x2="32" y2="54" stroke="#a5f3fc" strokeWidth="0.7" opacity="0.9" />
            <line x1="42" y1="24" x2="32" y2="54" stroke="#a5f3fc" strokeWidth="0.7" opacity="0.9" />

            {/* Micro Flare Star at Crown Tip */}
            <circle cx="22" cy="12" r="1.5" fill="#ffffff" filter="url(#glow)" />
            <circle cx="42" cy="12" r="1.2" fill="#ffffff" filter="url(#glow)" />
            <circle cx="32" cy="54" r="1.2" fill="#67e8f9" filter="url(#glow)" />
          </svg>
        </div>
      </div>

      {/* Typography with Prismatic Gradient */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-black ${currentSize.text} tracking-tight font-mono text-white flex items-center gap-1.5`}
            >
              <span>DEMANDED</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-violet-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
                DIAMOND
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-bold tracking-wider">
                AI
              </span>
            </span>
          </div>
          <span
            className={`font-mono ${currentSize.sub} tracking-wider text-cyan-400/80 flex items-center gap-1.5 font-medium`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span>CRYSTALLINE AUTONOMOUS SWARM</span>
          </span>
        </div>
      )}
    </div>
  );
}
