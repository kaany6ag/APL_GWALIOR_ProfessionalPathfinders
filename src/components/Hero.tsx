/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Cricketer } from "../types";
import { Upload, ChevronRight, TrendingUp, Sparkles, Image as ImageIcon, Flame } from "lucide-react";
import { compressImage } from "../utils";

interface HeroProps {
  players: Cricketer[];
  selectedPlayerId: string;
  onSelectPlayer: (id: string) => void;
  onUploadPlayer: (uploadedPlayer: Cricketer) => void;
  liveMatchData: any;
}

export default function Hero({
  players,
  selectedPlayerId,
  onSelectPlayer,
  onUploadPlayer,
  liveMatchData
}: HeroProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadTeam, setUploadTeam] = useState("");
  const [uploadRole, setUploadRole] = useState<"Batsman" | "Bowler" | "All-rounder" | "Wicketkeeper">("Batsman");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter trending players
  const trendingPlayers = players.filter(p => p.isTrending);
  const regularPlayers = players.filter(p => !p.isTrending);

  // File selection triggers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  // Drag over triggers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  // Compress and generate preview
  const processSelectedFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG/JPEG) only.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      try {
        const compressed = await compressImage(base64Data, 400, 400);
        setUploadPreview(compressed);
        // Autofill name from file
        const cleanName = file.name.split(".")[0].replace(/[-_]/g, " ");
        setUploadName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      } catch (err) {
        console.error("Compression failed:", err);
        setUploadPreview(base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit base64 to server API
  const handleUploadSubmit = async () => {
    if (!uploadPreview) return;
    setIsUploading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: uploadPreview,
          fileName: "player_photo.jpg",
          name: uploadName || "Custom Player",
          team: uploadTeam || "IPL All-Stars",
          role: uploadRole
        })
      });

      if (response.ok) {
        const data = await response.json();
        onUploadPlayer(data);
        // Reset upload panel
        setUploadPreview(null);
        setUploadName("");
        setUploadTeam("");
        setUploadRole("Batsman");
      } else {
        console.error("Upload route rejected the request");
      }
    } catch (err) {
      console.error("Failed uploading cricketer:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-12 px-4 sm:px-8 bg-slate-950">
      {/* Background Neon Glowing Atoms */}
      <div className="bg-neon-glow w-[350px] h-[350px] bg-orange-500/10 top-1/4 -left-32"></div>
      <div className="bg-neon-glow w-[400px] h-[400px] bg-blue-600/10 bottom-0 -right-32"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: Hero content & Live match banner */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-950/40 text-orange-400 text-xs font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              <span>TRANSFORMING CRICKET INGESTION WITH AGENTIC ML</span>
            </div>
            
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Predict Player Impact in Real-Time 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-orange-500 to-amber-400">
                With Deep AI Insight Mechanics
              </span>
            </h2>
            
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
              Upload custom cricketer photos or pick popular playing cards during active tournaments. 
              Our multi-layered neural engine calculates match gravity, momentum swing timelines, 
              and predicts optimal batting orientations instantly.
            </p>
          </div>

          {/* Epic Live Match Banner */}
          <div className="bg-slate-900 border border-slate-800 border-l-4 border-l-orange-500 rounded-3xl p-6 relative overflow-hidden shadow-lg">
            <div className="absolute top-2 right-3 flex items-center gap-1 px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[10px] font-mono tracking-widest font-bold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
              </span>
              LIVE TOURNAMENT
            </div>
            
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">IPL 2026 • ELITE LEAGUE CHAMPIONSHIPS</h4>
            
            <div className="flex items-center justify-between gap-4 mt-3">
              <div className="text-center sm:text-left">
                <p className="font-display text-lg font-bold text-white">{liveMatchData.battingTeam || "Royal Challengers Bengaluru"}</p>
                <p className="font-mono text-2xl font-bold text-orange-500 mt-1">{liveMatchData.score || "185/5"}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{liveMatchData.overs || "18.4"} Overs</p>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-900 border border-white/5 h-8 w-8 rounded-full flex items-center justify-center">VS</span>
                <p className="text-xs font-mono text-amber-500 font-bold mt-1.5">CRR: {liveMatchData.currentRunRate || "9.9"}</p>
              </div>

              <div className="text-center sm:text-right">
                <p className="font-display text-lg font-bold text-slate-300">{liveMatchData.bowlingTeam || "Mumbai Indians"}</p>
                <p className="font-mono text-2xl font-bold text-slate-400 mt-1">208/6</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Target: 209</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
              <p>Req. Run Rate: <span className="text-orange-500 font-bold">{liveMatchData.requiredRunRate || "11.2"}</span></p>
              <p>Active Partnership: <span className="text-slate-200">{liveMatchData.partnership.totalRuns} Runs ({liveMatchData.partnership.totalBalls}b)</span></p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Image Upload panel */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-orange-400" />
                Player Image Ingestion
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Upload match profile to map a new contestant into our real-time tracking array.
              </p>
              
              {/* Dropzone container */}
              {!uploadPreview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? "border-orange-400 bg-orange-950/20 shadow-inner"
                      : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-3">
                    <Upload className="h-6 w-6 text-orange-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-200">Drag cricketer image here, or click to browse</p>
                  <p className="text-xs text-slate-500 font-mono mt-1.5">Supports PNG, JPEG under 8MB</p>
                </div>
              ) : (
                /* Photo Ingestion Configurator details Form */
                <div className="space-y-4 bg-slate-900/80 p-4 rounded-xl border border-white/5">
                  <div className="flex gap-4 items-center">
                    <img
                      src={uploadPreview}
                      alt="Upload Preview"
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 object-cover rounded-lg border border-orange-500/30"
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-mono text-orange-400">IMAGE INGESTION COMPLETE</p>
                      <p className="text-xs text-slate-400">Specify details beneath to trigger quantum analysis</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Player Name</label>
                      <input
                        type="text"
                        value={uploadName}
                        onChange={(e) => setUploadName(e.target.value)}
                        placeholder="e.g. Hardik Pandya"
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white focus:outline-none focus:border-orange-500 font-display"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Team Name</label>
                      <input
                        type="text"
                        value={uploadTeam}
                        onChange={(e) => setUploadTeam(e.target.value)}
                        placeholder="e.g. Mumbai Indians"
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white focus:outline-none focus:border-orange-500 font-display"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Core Match Role</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(["Batsman", "Bowler", "All-rounder", "Wicketkeeper"] as const).map((rl) => (
                        <button
                          key={rl}
                          type="button"
                          onClick={() => setUploadRole(rl)}
                          className={`py-1 text-[10px] uppercase font-mono tracking-wider font-bold rounded border cursor-pointer ${
                            uploadRole === rl
                              ? "bg-orange-500/20 border-orange-400 text-orange-400"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {rl.split("-")[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setUploadPreview(null)}
                      className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs py-1.5 rounded cursor-pointer transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={handleUploadSubmit}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:opacity-95 font-display font-medium text-xs py-1.5 rounded cursor-pointer transition-opacity flex items-center justify-center gap-1"
                    >
                      {isUploading ? "Uploading..." : "Trigger AI Intake"}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="pt-3 border-t border-white/5 text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
              <span className="p-0.5 rounded bg-orange-950 text-orange-400">TIP</span>
              <span>For extreme metrics fidelity, prefer uploading action photos.</span>
            </div>
          </div>
        </div>

      </div>

      {/* TRENDING PLAYERS CAROUSEL ROW */}
      <div className="max-w-7xl mx-auto mt-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-1.5">
            <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
            Pick Player Card for Deep Analysis
          </h3>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            {players.length} Total Players Compiled
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {players.map((plyr) => (
            <div
              key={plyr.id}
              onClick={() => onSelectPlayer(plyr.id)}
              className={`group bg-slate-900 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 border ${
                selectedPlayerId === plyr.id
                  ? "border-orange-500 bg-slate-900 shadow-lg shadow-orange-500/10 scale-[1.02]"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={plyr.imageUrl}
                  alt={plyr.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {plyr.isTrending && (
                    <span className="bg-amber-500 text-slate-950 text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded shadow">
                      TRENDING
                    </span>
                  )}
                  <span className="bg-slate-950/80 backdrop-blur-sm text-orange-400 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-orange-500/20">
                    {plyr.role}
                  </span>
                </div>

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-2.5">
                  <p className="text-xs font-mono text-slate-400">{plyr.team}</p>
                  <h4 className="font-display text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                    {plyr.name}
                  </h4>
                </div>
              </div>

              {/* Stats Preview Bar */}
              <div className="p-2.5 bg-slate-950/60 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5">
                {plyr.role === "Bowler" ? (
                  <>
                    <span>WKTS: <strong className="text-orange-400">{plyr.stats.wickets}</strong></span>
                    <span>ECON: <strong className="text-slate-200">{plyr.stats.economy}</strong></span>
                  </>
                ) : (
                  <>
                    <span>RUNS: <strong className="text-orange-400">{plyr.stats.runs}</strong></span>
                    <span>SR: <strong className="text-slate-200">{plyr.stats.strikeRate}</strong></span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
