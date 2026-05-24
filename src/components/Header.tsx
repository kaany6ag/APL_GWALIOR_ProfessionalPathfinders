/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Activity, Clock, Award, ShieldAlert, Cpu } from "lucide-react";

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  activeMatchScore: string;
}

export default function Header({ isAdmin, setIsAdmin, activeMatchScore }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Keep synchronized with realistic UTC clock
    const updateTime = () => {
      const now = new Date();
      const utcString = now.toISOString().replace("T", " ").substring(0, 19) + " UTC";
      setCurrentTime(utcString);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-4 py-3 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand Logo and Slogan */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tighter text-white uppercase">
            CRICK<span className="text-orange-500">LYTE</span>
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Intelligence on Every Ball</p>
        </div>
      </div>

      {/* Dynamic Live Ticker & Info */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
        {/* Match Ticker */}
        <div className="flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 px-3.5 py-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="font-mono text-slate-300 text-[11px]">LIVE: <strong className="text-white">RCB vs MI</strong> • <span className="text-orange-400">{activeMatchScore || "185/5"}</span></span>
        </div>

        {/* Real-time UTC Clock */}
        <div className="flex items-center gap-1.5 text-slate-200 font-mono bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.2)] text-[11px]">
          <Clock className="h-3.5 w-3.5 text-orange-400" />
          <span>{currentTime || "2026-05-24 14:44:31 UTC"}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <button
          id="btn-toggle-dashboard"
          onClick={() => setIsAdmin(false)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ${
            !isAdmin
              ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:opacity-95"
              : "text-slate-400 hover:text-white hover:bg-slate-900/60"
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          Analytics Hub
        </button>

        <button
          id="btn-toggle-admin"
          onClick={() => setIsAdmin(true)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ${
            isAdmin
              ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:opacity-95"
              : "text-slate-400 hover:text-white hover:bg-slate-900/60"
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Admin Panel
        </button>
      </div>
    </header>
  );
}
