/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Cricketer } from "../types";
import { Edit, Trash2, PlusCircle, Save, Sliders, ShieldCheck, ToggleLeft, UserCheck, RefreshCw } from "lucide-react";

interface AdminPanelProps {
  players: Cricketer[];
  activeMatchData: any;
  onUpdatePlayers: () => void;
  onUpdateMatch: (stats: any) => void;
}

export default function AdminPanel({
  players,
  activeMatchData,
  onUpdatePlayers,
  onUpdateMatch
}: AdminPanelProps) {
  // Player edit states
  const [editingPlayer, setEditingPlayer] = useState<Cricketer | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form parameters
  const [frmName, setFrmName] = useState("");
  const [frmTeam, setFrmTeam] = useState("");
  const [frmRole, setFrmRole] = useState<"Batsman" | "Bowler" | "All-rounder" | "Wicketkeeper">("Batsman");
  const [frmPhase, setFrmPhase] = useState<"Powerplay" | "Middle" | "Death">("Middle");
  const [frmPressure, setFrmPressure] = useState<"Low" | "Medium" | "High">("Medium");
  const [frmRuns, setFrmRuns] = useState(0);
  const [frmBalls, setFrmBalls] = useState(0);
  const [frmSR, setFrmSR] = useState(100);
  const [frmWkts, setFrmWkts] = useState(0);
  const [frmOvers, setFrmOvers] = useState(0);
  const [frmEconomy, setFrmEconomy] = useState(0);
  const [frmFours, setFrmFours] = useState(0);
  const [frmSixes, setFrmSixes] = useState(0);
  const [frmCatches, setFrmCatches] = useState(0);
  const [frmImgUrl, setFrmImgUrl] = useState("");

  // Live scoreboard controller form states
  const [liveScore, setLiveScore] = useState(activeMatchData.score);
  const [liveOvers, setLiveOvers] = useState(activeMatchData.overs);
  const [liveCRR, setLiveCRR] = useState(activeMatchData.currentRunRate);
  const [liveRRR, setLiveRRR] = useState(activeMatchData.requiredRunRate);
  const [liveBt1, setLiveBt1] = useState(activeMatchData.partnership.batsman1);
  const [liveBt1R, setLiveBt1R] = useState(activeMatchData.partnership.batsman1Runs);
  const [liveBt2, setLiveBt2] = useState(activeMatchData.partnership.batsman2);
  const [liveBt2R, setLiveBt2R] = useState(activeMatchData.partnership.batsman2Runs);

  const [savingPlayer, setSavingPlayer] = useState(false);
  const [savingMatch, setSavingMatch] = useState(false);

  // Prefill editor
  const handleStartEdit = (p: Cricketer) => {
    setEditingPlayer(p);
    setIsCreatingNew(false);

    setFrmName(p.name);
    setFrmTeam(p.team);
    setFrmRole(p.role);
    setFrmPhase(p.matchPhase);
    setFrmPressure(p.pressureSituation);
    setFrmRuns(p.stats.runs);
    setFrmBalls(p.stats.balls);
    setFrmSR(p.stats.strikeRate);
    setFrmWkts(p.stats.wickets);
    setFrmOvers(p.stats.oversCount);
    setFrmEconomy(p.stats.economy);
    setFrmFours(p.stats.fours);
    setFrmSixes(p.stats.sixes);
    setFrmCatches(p.stats.catches);
    setFrmImgUrl(p.imageUrl);
  };

  // Prefill creator
  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setEditingPlayer(null);

    setFrmName("");
    setFrmTeam("");
    setFrmRole("Batsman");
    setFrmPhase("Middle");
    setFrmPressure("Medium");
    setFrmRuns(0);
    setFrmBalls(0);
    setFrmSR(100);
    setFrmWkts(0);
    setFrmOvers(0);
    setFrmEconomy(0);
    setFrmFours(0);
    setFrmSixes(0);
    setFrmCatches(0);
    setFrmImgUrl("https://images.unsplash.com/photo-1540747737956-378724044453?w=400&auto=format&fit=crop&q=60");
  };

  // Submit Cricketer
  const handleCricketerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPlayer(true);

    const payload = {
      id: editingPlayer?.id || undefined,
      name: frmName,
      team: frmTeam,
      role: frmRole,
      matchPhase: frmPhase,
      pressureSituation: frmPressure,
      imageUrl: frmImgUrl,
      stats: {
        runs: Number(frmRuns),
        balls: Number(frmBalls),
        strikeRate: Number(frmSR),
        wickets: Number(frmWkts),
        oversCount: Number(frmOvers),
        economy: Number(frmEconomy),
        fours: Number(frmFours),
        sixes: Number(frmSixes),
        catches: Number(frmCatches)
      }
    };

    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onUpdatePlayers();
        setEditingPlayer(null);
        setIsCreatingNew(false);
      }
    } catch (err) {
      console.error("Failed executing cricketer transaction:", err);
    } finally {
      setSavingPlayer(false);
    }
  };

  // Delete footballer card
  const handleDeletePlayer = async (id: string) => {
    if (!confirm("Are you sure you want to remove this cricketer card from DB?")) return;
    try {
      const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
      if (res.ok) {
        onUpdatePlayers();
      }
    } catch (err) {
      console.error("Failed removing player:", err);
    }
  };

  // Submit Match Live Update
  const handleMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMatch(true);

    const payload = {
      score: liveScore,
      overs: liveOvers,
      requiredRunRate: Number(liveRRR),
      currentRunRate: Number(liveCRR),
      batsman1Runs: Number(liveBt1R),
      batsman2Runs: Number(liveBt2R),
      batsman1Name: liveBt1,
      batsman2Name: liveBt2
    };

    try {
      const res = await fetch("/api/match/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updatedData = await res.json();
        onUpdateMatch(updatedData);
      }
    } catch (err) {
      console.error("Failed updating match live statistics:", err);
    } finally {
      setSavingMatch(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-lg">
        <div className="h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
          <Sliders className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-black text-white">ADMIN SIMULATION COCKPIT</h2>
          <p className="text-xs text-slate-400 font-mono">EDIT LIVE STATISTICS, MANAGE PARTICIPATING CRICKETERS, AND FORWARD TOURNAMENTS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CRICKETER LIST & SCOREBOARD EDITOR */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. TOURNAMENT TICKER ADMINISTRATOR */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
            <h3 className="font-display font-bold text-sm text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              1. TOURNAMENT FEED CONTROLLER
            </h3>

            <form onSubmit={handleMatchSubmit} className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase">MATCH SCORE</label>
                <input
                  type="text"
                  value={liveScore}
                  onChange={(e) => setLiveScore(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-display"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase">OVERS COMPLETED</label>
                <input
                  type="text"
                  value={liveOvers}
                  onChange={(e) => setLiveOvers(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase">CURRENT RR (CRR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={liveCRR}
                  onChange={(e) => setLiveCRR(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase">REQUIRED RR (RRR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={liveRRR}
                  onChange={(e) => setLiveRRR(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-500 text-[10px] uppercase">BATSMAN 1 (STRIKER)</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={liveBt1}
                    onChange={(e) => setLiveBt1(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                  />
                  <input
                    type="number"
                    value={liveBt1R}
                    onChange={(e) => setLiveBt1R(Number(e.target.value))}
                    className="w-16 bg-slate-950 border border-slate-800 rounded p-1.5 text-white text-center"
                    placeholder="Runs"
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-500 text-[10px] uppercase">BATSMAN 2</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={liveBt2}
                    onChange={(e) => setLiveBt2(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                  />
                  <input
                    type="number"
                    value={liveBt2R}
                    onChange={(e) => setLiveBt2R(Number(e.target.value))}
                    className="w-16 bg-slate-950 border border-slate-800 rounded p-1.5 text-white text-center"
                    placeholder="Runs"
                  />
                </div>
              </div>

              <div className="col-span-2 sm:col-span-4 pt-2">
                <button
                  type="submit"
                  disabled={savingMatch}
                  className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:opacity-95 font-display font-black tracking-wide rounded cursor-pointer transition-opacity"
                >
                  {savingMatch ? "Updating Simulation Ticker..." : "PUSH SCOREBOARD STATE UPDATE"}
                </button>
              </div>
            </form>
          </div>

          {/* 2. PLAYERS SPREADSHEET */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="font-display font-bold text-sm text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                2. ACTIVE CRICKETERS REGISTRY
              </h3>
              <button
                type="button"
                onClick={handleStartCreate}
                className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 font-mono text-[11px] font-bold py-1 px-2.5 rounded border border-amber-500/30 cursor-pointer"
              >
                + Create Cricketer
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs text-slate-300 divide-y divide-white/5">
                <thead>
                  <tr className="text-slate-500 text-[10px] uppercase">
                    <th className="py-2.5">Name</th>
                    <th>Team</th>
                    <th>Role</th>
                    <th>Performance</th>
                    <th className="text-right">Database Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {players.map((plyr) => (
                    <tr key={plyr.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-display font-medium text-white">{plyr.name}</td>
                      <td>{plyr.team}</td>
                      <td>
                        <span className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-cyan-400 rounded">
                          {plyr.role}
                        </span>
                      </td>
                      <td>
                        <span className="font-bold text-emerald-400">
                          {plyr.liveMetrics.performanceMeter}/100
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(plyr)}
                            className="p-1 text-slate-400 hover:text-amber-400 cursor-pointer transition-colors"
                            title="Edit metrics"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePlayer(plyr.id)}
                            className="p-1 text-slate-400 hover:text-red-400 cursor-pointer transition-colors"
                            title="Delete card"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CRICKETER CARD CREATOR/EDITOR FORM */}
        <div className="lg:col-span-5">
          {(editingPlayer || isCreatingNew) ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
              <h3 className="font-display font-black text-sm text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                {editingPlayer ? `EDITING: ${editingPlayer.name}` : "CREATE NEW CRICKETER"}
              </h3>

              <form onSubmit={handleCricketerSubmit} className="space-y-4 text-xs font-mono">
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-500 text-[10px]">FULL NAME</label>
                    <input
                      type="text"
                      required
                      value={frmName}
                      onChange={(e) => setFrmName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-display text-xs"
                      placeholder="e.g. MS Dhoni"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 text-[10px]">TEAM</label>
                    <input
                      type="text"
                      required
                      value={frmTeam}
                      onChange={(e) => setFrmTeam(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                      placeholder="e.g. India"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-500 text-[10px]">ROLE</label>
                    <select
                      value={frmRole}
                      onChange={(e) => setFrmRole(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                    >
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="All-rounder">All-rounder</option>
                      <option value="Wicketkeeper">Wicketkeeper</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 text-[10px]">MATCH PHASE</label>
                    <select
                      value={frmPhase}
                      onChange={(e) => setFrmPhase(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                    >
                      <option value="Powerplay">Powerplay</option>
                      <option value="Middle">Middle</option>
                      <option value="Death">Death</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 text-[10px]">PRESSURE TIER</label>
                    <select
                      value={frmPressure}
                      onChange={(e) => setFrmPressure(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 text-[10px]">IMAGE ASSET URL</label>
                  <input
                    type="text"
                    value={frmImgUrl}
                    onChange={(e) => setFrmImgUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-[11px]"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {/* CRICKETER STATISTICS COEFFICIENTS FOR FORMULA */}
                <div className="border-t border-white/5 pt-3 space-y-3">
                  <p className="text-[9px] text-amber-500/80 uppercase tracking-widest font-black">
                    Live Situation Score Coefficients
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 font-mono">
                      <label className="text-slate-500 text-[9px] uppercase">Runs scored</label>
                      <input
                        type="number"
                        value={frmRuns}
                        onChange={(e) => setFrmRuns(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                      />
                    </div>
                    <div className="space-y-1 font-mono">
                      <label className="text-slate-500 text-[9px] uppercase">Balls faced</label>
                      <input
                        type="number"
                        value={frmBalls}
                        onChange={(e) => setFrmBalls(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                      />
                    </div>
                    <div className="space-y-1 font-mono">
                      <label className="text-slate-500 text-[9px] uppercase">Strike Rate</label>
                      <input
                        type="number"
                        value={frmSR}
                        onChange={(e) => setFrmSR(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                      />
                    </div>

                    <div className="space-y-1 font-mono">
                      <label className="text-slate-500 text-[9px] uppercase">Wickets taken</label>
                      <input
                        type="number"
                        value={frmWkts}
                        onChange={(e) => setFrmWkts(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                      />
                    </div>
                    <div className="space-y-1 font-mono">
                      <label className="text-slate-500 text-[9px] uppercase">Overs Bowled</label>
                      <input
                        type="number"
                        step="0.1"
                        value={frmOvers}
                        onChange={(e) => setFrmOvers(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                      />
                    </div>
                    <div className="space-y-1 font-mono">
                      <label className="text-slate-500 text-[9px] uppercase">Economy Rate</label>
                      <input
                        type="number"
                        step="0.01"
                        value={frmEconomy}
                        onChange={(e) => setFrmEconomy(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                      />
                    </div>

                    <div className="space-y-1 font-mono">
                      <label className="text-slate-500 text-[9px] uppercase">Fours</label>
                      <input
                        type="number"
                        value={frmFours}
                        onChange={(e) => setFrmFours(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                      />
                    </div>
                    <div className="space-y-1 font-mono">
                      <label className="text-slate-500 text-[9px] uppercase">Sixes</label>
                      <input
                        type="number"
                        value={frmSixes}
                        onChange={(e) => setFrmSixes(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                      />
                    </div>
                    <div className="space-y-1 font-mono">
                      <label className="text-slate-500 text-[9px] uppercase">Catches</label>
                      <input
                        type="number"
                        value={frmCatches}
                        onChange={(e) => setFrmCatches(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlayer(null);
                      setIsCreatingNew(false);
                    }}
                    className="flex-1 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded text-slate-300 font-mono text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPlayer}
                    className="flex-1 py-2 bg-amber-500 text-slate-950 hover:bg-amber-400 font-display font-medium rounded text-center cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    {savingPlayer ? "Saving DB..." : "COMMIT TO DB"}
                  </button>
                </div>

              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4 shadow-lg relative overflow-hidden">
              <SlantedLinesBackground />
              <Sliders className="h-10 w-10 text-slate-600 mx-auto animate-pulse" />
              <div>
                <h4 className="font-display font-bold text-white text-base">Select or Create Cricketer Card</h4>
                <p className="text-xs text-slate-400 font-mono max-w-xs mx-auto mt-1">
                  Click on the "Edit" pencil icon on any registry player, or create a brand new player card to fill custom sports stats coefficients.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Visual layout helper background Lines
function SlantedLinesBackground() {
  return (
    <div className="absolute inset-0 opacity-[0.02] pointer-events-none overflow-hidden rounded-2xl">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="slanted-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M-10,10 l20,-20 M0,40 l40,-40 M30,50 l20,-20" stroke="#fff" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#slanted-pattern)" />
      </svg>
    </div>
  );
}
