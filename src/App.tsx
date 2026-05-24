/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import PlayerDashboard from "./components/PlayerDashboard";
import AIPrediction from "./components/AIPrediction";
import LiveMatchUI from "./components/LiveMatchUI";
import AdminPanel from "./components/AdminPanel";
import ExtraFeatures from "./components/ExtraFeatures";
import { Cricketer, LiveMatchData, AIInsight, AIPrediction as AIPredictionType } from "./types";
import { Cpu, RotateCw, AlertCircle, RefreshCw } from "lucide-react";

export default function App() {
  // Layout states
  const [isAdmin, setIsAdmin] = useState(false);
  const [players, setPlayers] = useState<Cricketer[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [liveMatchData, setLiveMatchData] = useState<LiveMatchData | null>(null);

  // loading / Error states
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // AI analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeInsight, setActiveInsight] = useState<AIInsight | null>(null);
  const [activePrediction, setActivePrediction] = useState<AIPredictionType | null>(null);

  // Cache maps to avoid redundant API transfers
  const [aiCache, setAiCache] = useState<Record<string, { insight: AIInsight; prediction: AIPredictionType }>>({});

  // 1. Initial Feed Fetchers
  const fetchPlayers = async () => {
    try {
      const res = await fetch("/api/players");
      if (res.ok) {
        const data = await res.json();
        setPlayers(data);
        // Default to first player if none is chosen
        if (data.length > 0 && !selectedPlayerId) {
          setSelectedPlayerId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed fetching players feed:", err);
      setErrorText("Database connection interrupted. Restoring heuristic arrays.");
    }
  };

  const fetchMatchStats = async () => {
    try {
      const res = await fetch("/api/match/stats");
      if (res.ok) {
        const data = await res.json();
        setLiveMatchData(data);
      }
    } catch (err) {
      console.error("Match stats fetch failed:", err);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      await Promise.all([fetchPlayers(), fetchMatchStats()]);
      setLoading(false);
    };
    initializeApp();
  }, []);

  // 2. Fetch or Pull Cached AI Prediction for selected Cricketer
  const triggerAIAnalysis = async (playerId: string) => {
    if (!playerId) return;
    
    // Check local session store cache first
    if (aiCache[playerId]) {
      setActiveInsight(aiCache[playerId].insight);
      setActivePrediction(aiCache[playerId].prediction);
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch(`/api/analyze/${playerId}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setActiveInsight(data.insight);
        setActivePrediction(data.prediction);
        
        // Save to cache maps
        setAiCache(prev => ({
          ...prev,
          [playerId]: { insight: data.insight, prediction: data.prediction }
        }));
      }
    } catch (err) {
      console.error("Failed executing Live AI analyze call:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Re-trigger analysis on selector change
  useEffect(() => {
    if (selectedPlayerId) {
      triggerAIAnalysis(selectedPlayerId);
    }
  }, [selectedPlayerId]);

  // Callback when admin adds or modifies cricketers
  const handleUpdatePlayersCb = async () => {
    await fetchPlayers();
  };

  // Callback once the uploaded contestant comes in
  const handleUploadPlayerCb = (uploadedPlyr: Cricketer) => {
    setPlayers(prev => [uploadedPlyr, ...prev]);
    setSelectedPlayerId(uploadedPlyr.id);
  };

  // Callback once live match scorecard is manipulated
  const handleUpdateMatchCb = (newMatchStats: LiveMatchData) => {
    setLiveMatchData(newMatchStats);
  };

  const activePlayer = players.find(p => p.id === selectedPlayerId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      
      {/* 1. SPORTS NAVIGATION HEADER */}
      <Header
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        activeMatchScore={liveMatchData?.score || "185/5"}
      />

      {loading ? (
        /* GLOSSY FULL SCREEN LOADING FEEDBACK */
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 font-mono">
          <div className="relative h-14 w-14 flex items-center justify-center">
            <RefreshCw className="h-10 w-10 text-orange-400 animate-spin" />
            <div className="absolute inset-0 bg-orange-400/10 blur-md rounded-full -z-10 animate-pulse"></div>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-300">CALIBRATING NEURAL CRICKET COEFFICIENTS...</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Acquiring Active Feed</p>
          </div>
        </div>
      ) : (
        <main className="flex-1 text-slate-200">
          
          {errorText && (
            <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-8">
              <div className="bg-red-950/40 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{errorText}</span>
              </div>
            </div>
          )}

          {isAdmin ? (
            /* ADMIN VIEW cockpit */
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
              <AdminPanel
                players={players}
                activeMatchData={liveMatchData || { score: "185/5", overs: "18.4", partnership: { batsman1: "V. Kohli", batsman2: "R. Jadeja", batsman1Runs: 82, batsman2Runs: 16 } }}
                onUpdatePlayers={handleUpdatePlayersCb}
                onUpdateMatch={handleUpdateMatchCb}
              />
            </div>
          ) : (
            /* ANALYTICS HUD */
            <div className="space-y-8">
              
              {/* HERO INTRO & CAROUSEL */}
              <Hero
                players={players}
                selectedPlayerId={selectedPlayerId}
                onSelectPlayer={setSelectedPlayerId}
                onUploadPlayer={handleUploadPlayerCb}
                liveMatchData={liveMatchData || { score: "185/5", overs: "18.4" }}
              />

              {activePlayer ? (
                /* MAIN INTERACTIVE MATCH LAYOUT */
                <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT DETAILED STATS (Player Dashboard) */}
                  <div className="lg:col-span-8 space-y-8">
                    
                    <PlayerDashboard player={activePlayer} />

                    {/* EXTRA BENTO FEATURES - COMPARISON etc */}
                    <ExtraFeatures players={players} />

                  </div>

                  {/* RIGHT COGNITIVE BAR (AI Engine insights and live match) */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* 1. Active Scoreboard Info Block */}
                    {liveMatchData && <LiveMatchUI liveData={liveMatchData} />}

                    {/* 2. Quantum Predictor Widget */}
                    <AIPrediction
                      prediction={activePrediction}
                      insight={activeInsight}
                      playerName={activePlayer.name}
                      isGenerating={isAnalyzing}
                      onRefreshAI={() => {
                        // Invalidate cache first to force a genuine refetch
                        setAiCache(prev => {
                          const newer = { ...prev };
                          delete newer[selectedPlayerId];
                          return newer;
                        });
                        triggerAIAnalysis(selectedPlayerId);
                      }}
                    />

                  </div>

                </div>
              ) : (
                <div className="text-center py-20 font-mono text-slate-500">
                  Select a cricketer image card above to launch statistics matrix models.
                </div>
              )}

            </div>
          )}

        </main>
      )}

      {/* FOOTER METRICS COPYRIGHT */}
      <footer className="border-t border-white/5 py-4 px-8 text-center text-[10px] font-mono text-slate-600 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 CRICKLYTE INC. DEEP ANALYSIS MULTI-STAGE PLATFORM.</p>
        <p className="flex items-center gap-1">
          <Cpu className="h-3.5 w-3.5 text-orange-400" />
          Heuristics normalized at [0.75 - 0.95] efficiency
        </p>
      </footer>

    </div>
  );
}
