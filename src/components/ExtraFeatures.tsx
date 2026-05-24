/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Cricketer, FanPoll } from "../types";
import { Users, Flame, Percent, Vote, HelpCircle, LayoutGrid, CheckCircle } from "lucide-react";

interface ExtraFeaturesProps {
  players: Cricketer[];
}

export default function ExtraFeatures({ players }: ExtraFeaturesProps) {
  // Mode tabs: comparison vs pitch vs poll
  const [activeTab, setActiveTab] = useState<"leaderboard" | "compare" | "heatmap" | "poll">("leaderboard");

  // Comparison selection
  const [p1Id, setP1Id] = useState(players[0]?.id || "");
  const [p2Id, setP2Id] = useState(players[1]?.id || "");

  // Fetch match poll state
  const [poll, setPoll] = useState<FanPoll | null>(null);
  const [userVotedId, setUserVotedId] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    fetch("/api/fan-survey/feed")
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setPoll(data))
      .catch(err => console.error("Poll fetch failed", err));
  }, []);

  const handleVote = async (optId: string) => {
    if (userVotedId || isVoting) return;
    setIsVoting(true);

    try {
      const res = await fetch("/api/fan-survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: optId })
      });
      if (res.ok) {
        const data = await res.json();
        setPoll(data.poll);
        setUserVotedId(optId);
      }
    } catch (err) {
      console.error("Failed submitting vote:", err);
    } finally {
      setIsVoting(false);
    }
  };

  const p1 = players.find(p => p.id === p1Id);
  const p2 = players.find(p => p.id === p2Id);

  return (
    <div className="space-y-6">
      
      {/* SELECTION TAB MODULE */}
      <div className="flex flex-wrap border-b border-slate-800 pb-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("leaderboard")}
          className={`px-4 py-2 font-display text-xs uppercase tracking-wider font-extrabold cursor-pointer transition-colors ${
            activeTab === "leaderboard"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          IPL Live Leaderboard
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("compare")}
          className={`px-4 py-2 font-display text-xs uppercase tracking-wider font-extrabold cursor-pointer transition-colors ${
            activeTab === "compare"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Player Comparison Mode
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("heatmap")}
          className={`px-4 py-2 font-display text-xs uppercase tracking-wider font-extrabold cursor-pointer transition-colors ${
            activeTab === "heatmap"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Cyber pitch Heatmaps
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("poll")}
          className={`px-4 py-2 font-display text-xs uppercase tracking-wider font-extrabold cursor-pointer transition-colors ${
            activeTab === "poll"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Match MVP Fan Poll
        </button>
      </div>

      {activeTab === "leaderboard" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="border-b border-white/5 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="font-display font-black text-white text-base flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse"></span>
                IPL 2026 PLAYER STANDINGS DIRECTORY
              </h3>
              <p className="text-[10px] text-slate-550 font-mono uppercase tracking-wider">
                Full dynamic details of playing contenders and live scores
              </p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded bg-blue-900/40 text-blue-300 border border-blue-500/20">
              IPL 2026 OFFICIAL LIVE STATS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] bg-blue-950/20">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Runs scored (S/R)</th>
                  <th className="py-3 px-4 text-right">Wickets taken (Econ)</th>
                  <th className="py-3 px-4 text-right text-orange-400">Match Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {players
                  .sort((a, b) => b.liveMetrics.matchImpact - a.liveMetrics.matchImpact)
                  .map((p, index) => {
                    const isBowler = p.role === "Bowler";
                    return (
                      <tr key={p.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-500">#{index + 1}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <img src={p.imageUrl} alt={p.name} className="h-7 w-7 rounded-full object-cover border border-orange-500/30 shadow" />
                            <span className="font-display font-bold text-slate-100">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-blue-900/20 text-blue-300 border border-blue-500/15 text-[10px]">
                            {p.team}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{p.role}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                          {p.stats.runs > 0 ? (
                            <span>{p.stats.runs} <span className="text-[10px] text-slate-500 font-normal">({p.stats.strikeRate} SR)</span></span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                          {p.stats.wickets > 0 || isBowler ? (
                            <span>{p.stats.wickets} <span className="text-[10px] text-slate-500 font-normal">({p.stats.economy || "6.5"} Ec)</span></span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-orange-400">
                          {p.liveMetrics.matchImpact}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "compare" && p1 && p2 && (
        /* COMPARISON TAB MATRIX */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-lg">
          <div className="grid grid-cols-2 gap-4 divide-x divide-slate-800 pb-4 border-b border-slate-800">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Contestant Alpha</label>
              <select
                value={p1Id}
                onChange={e => setP1Id(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-display text-sm cursor-pointer"
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.team})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 pl-4">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Contestant Beta</label>
              <select
                value={p2Id}
                onChange={e => setP2Id(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-display text-sm cursor-pointer"
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.team})</option>
                ))}
              </select>
            </div>
          </div>

          {/* SPREADSHEET COMPARE MATRIX ROWS */}
          <div className="space-y-3 font-mono text-xs">
            
            {/* Header identity */}
            <div className="grid grid-cols-3 font-display font-black text-slate-500 text-center uppercase text-[10px] pb-1 tracking-wider">
              <span>{p1.name}</span>
              <span className="text-slate-600">Metric Type</span>
              <span>{p2.name}</span>
            </div>

            {/* Performance Meter */}
            <div className="grid grid-cols-3 text-center py-2 border-b border-slate-800 hover:bg-slate-950/40 rounded transition-all">
              <span className={`font-bold ${p1.liveMetrics.performanceMeter > p2.liveMetrics.performanceMeter ? "text-cyan-400 font-black" : "text-slate-400"}`}>
                {p1.liveMetrics.performanceMeter}
              </span>
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">Performance Score</span>
              <span className={`font-bold ${p2.liveMetrics.performanceMeter > p1.liveMetrics.performanceMeter ? "text-cyan-400 font-black" : "text-slate-400"}`}>
                {p2.liveMetrics.performanceMeter}
              </span>
            </div>

            {/* Match Impact */}
            <div className="grid grid-cols-3 text-center py-2 border-b border-slate-800 hover:bg-slate-950/40 rounded transition-all">
              <span className={`font-bold ${p1.liveMetrics.matchImpact > p2.liveMetrics.matchImpact ? "text-emerald-400 font-black" : "text-slate-400"}`}>
                {p1.liveMetrics.matchImpact}
              </span>
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">Match Impact Value</span>
              <span className={`font-bold ${p2.liveMetrics.matchImpact > p1.liveMetrics.matchImpact ? "text-emerald-400 font-black" : "text-slate-400"}`}>
                {p2.liveMetrics.matchImpact}
              </span>
            </div>

            {/* Pressure Handling */}
            <div className="grid grid-cols-3 text-center py-2 border-b border-slate-800 hover:bg-slate-950/40 rounded transition-all">
              <span className={`font-bold ${p1.liveMetrics.pressureHandling > p2.liveMetrics.pressureHandling ? "text-indigo-400 font-black" : "text-slate-400"}`}>
                {p1.liveMetrics.pressureHandling}%
              </span>
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">Pressure Absorber %</span>
              <span className={`font-bold ${p2.liveMetrics.pressureHandling > p1.liveMetrics.pressureHandling ? "text-indigo-400 font-black" : "text-slate-400"}`}>
                {p2.liveMetrics.pressureHandling}%
              </span>
            </div>

            {/* Match Runs */}
            <div className="grid grid-cols-3 text-center py-2 border-b border-slate-800 hover:bg-slate-950/40 rounded transition-all">
              <span className={`font-bold ${p1.stats.runs > p2.stats.runs ? "text-slate-100 font-black" : "text-slate-400"}`}>
                {p1.stats.runs} <span className="text-[10px] text-slate-500">({p1.stats.balls}b)</span>
              </span>
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">Runs Secured</span>
              <span className={`font-bold ${p2.stats.runs > p1.stats.runs ? "text-slate-100 font-black" : "text-slate-400"}`}>
                {p2.stats.runs} <span className="text-[10px] text-slate-500">({p2.stats.balls}b)</span>
              </span>
            </div>

            {/* Strike Rate */}
            <div className="grid grid-cols-3 text-center py-2 border-b border-slate-800 hover:bg-slate-950/40 rounded transition-all">
              <span className={`font-bold ${p1.stats.strikeRate > p2.stats.strikeRate ? "text-cyan-400 font-black" : "text-slate-400"}`}>
                {p1.stats.strikeRate}%
              </span>
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">Strike Rate</span>
              <span className={`font-bold ${p2.stats.strikeRate > p1.stats.strikeRate ? "text-cyan-400 font-black" : "text-slate-400"}`}>
                {p2.stats.strikeRate}%
              </span>
            </div>

            {/* Wickets */}
            <div className="grid grid-cols-3 text-center py-2 border-b border-slate-800 hover:bg-slate-950/40 rounded transition-all">
              <span className={`font-bold ${p1.stats.wickets > p2.stats.wickets ? "text-emerald-400 font-black" : "text-slate-400"}`}>
                {p1.stats.wickets} <span className="text-[9px] text-slate-500">({p1.stats.oversCount} ov)</span>
              </span>
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">Wickets Claimed</span>
              <span className={`font-bold ${p2.stats.wickets > p1.stats.wickets ? "text-emerald-400 font-black" : "text-slate-400"}`}>
                {p2.stats.wickets} <span className="text-[9px] text-slate-500">({p2.stats.oversCount} ov)</span>
              </span>
            </div>

            {/* Economy */}
            <div className="grid grid-cols-3 text-center py-2 border-b border-slate-800 hover:bg-slate-950/40 rounded transition-all">
              <span className={`font-bold ${p1.stats.economy < p2.stats.economy && p1.stats.economy > 0 ? "text-amber-400 font-black" : "text-slate-400"}`}>
                {p1.stats.economy || "N/A"}
              </span>
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">Bowling Economy</span>
              <span className={`font-bold ${p2.stats.economy < p1.stats.economy && p2.stats.economy > 0 ? "text-amber-400 font-black" : "text-slate-400"}`}>
                {p2.stats.economy || "N/A"}
              </span>
            </div>

          </div>
        </div>
      )}

      {activeTab === "heatmap" && (
        /* VIRTUAL CRICKET PITCH HEATMAP */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-lg">
          
          <div className="md:col-span-4 space-y-4">
            <h3 className="font-display font-black text-white text-base">Cyber Deliveries Pitch Matrix</h3>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Mapped density points highlighting ball-landing pitch trajectories. Green indicators map spinner dips; orange circles map deep pacers blockyorkers.
            </p>

            <div className="grid grid-cols-1 gap-2 pt-2 text-[11px] font-mono">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400 block" /> Good-Length (Concentration 45%)</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-400 block" /> Block Yorker / Full (Concentration 35%)</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-400 block animate-pulse" /> Off-Stump Corridor (Concentration 20%)</div>
            </div>
          </div>

          <div className="md:col-span-8 flex items-center justify-center bg-slate-950 p-6 rounded-2xl border border-slate-800">
            {/* Visual pitch layout */}
            <div className="relative w-full max-w-sm h-64 bg-slate-900 rounded border border-emerald-500/10 flex flex-col justify-between p-2">
              
              {/* Bowling end crease */}
              <div className="border-b-2 border-white/10 h-6 flex justify-center items-center font-mono text-[9px] text-slate-500">
                BOWLER END CREASE
              </div>

              {/* Heat areas overlay */}
              <div className="relative flex-1 flex flex-col justify-around items-center my-2">
                {/* 1. Full Length Zone */}
                <div className="absolute top-[20%] w-32 h-10 border border-white/5 flex items-center justify-center font-mono text-[8px] text-slate-600">
                  SHORTER LENGTH
                  {/* Glowing blobs inside */}
                  <div className="absolute h-5 w-5 bg-cyan-400/20 rounded-full filter blur-sm"></div>
                </div>

                {/* 2. Good Length Zone */}
                <div className="absolute top-[45%] w-32 h-12 border border-white/5 flex items-center justify-center font-mono text-[8px] text-slate-600">
                  GOOD LENGTH CORRIDOR
                  {/* Glowing blobs */}
                  <div className="absolute left-[35%] h-6 w-6 bg-emerald-400/25 rounded-full filter blur-md"></div>
                  <div className="absolute left-[45%] h-4 w-4 bg-emerald-400/40 rounded-full filter blur-sm"></div>
                </div>

                {/* 3. Yorker Zone */}
                <div className="absolute top-[75%] w-32 h-10 border border-white/5 flex items-center justify-center font-mono text-[8px] text-slate-600">
                  YORKER BLOCK DEPTH
                  {/* Yorker blobs */}
                  <div className="absolute right-[20%] h-5 w-5 bg-orange-500/30 rounded-full filter blur-sm animate-pulse"></div>
                </div>
              </div>

              {/* Batting stumps crease */}
              <div className="border-t-2 border-white/10 h-6 flex justify-center items-center font-mono text-[9px] text-slate-500">
                BATSMAN END CREASE
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === "poll" && poll && (
        /* INTERACTIVE MV PRO POLL CARD */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Vote className="h-5 w-5 text-indigo-400 animate-pulse" />
            <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Today's Match MVP Voter Base
            </h3>
          </div>

          <p className="text-xs text-slate-400 font-mono italic">
            “{poll.question}”
          </p>

          <div className="space-y-3 pt-2">
            {poll.options.map((opt) => {
              const share = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
              const votedForThis = userVotedId === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                    votedForThis
                      ? "border-emerald-500/40 bg-emerald-950/15"
                      : userVotedId
                      ? "border-slate-850 bg-slate-900/10 opacity-60 cursor-not-allowed"
                      : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60"
                  }`}
                >
                  <div className="flex justify-between text-xs font-mono mb-2 items-center">
                    <span className="text-slate-200 flex items-center gap-1.5 font-bold">
                      {votedForThis && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                      {opt.text}
                    </span>
                    <span className="text-cyan-400 font-bold">{share}% ({opt.votes} votes)</span>
                  </div>

                  {/* Horizontal gauge progress bar */}
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden w-full relative">
                    <div
                      className={`h-full transition-all duration-700 ${
                        votedForThis ? "bg-emerald-400" : "bg-cyan-500/70"
                      }`}
                      style={{ width: `${share}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-500 font-mono text-center pt-1.5 uppercase">
            Total Compiled Submissions: {poll.totalVotes} Votes • Verified by AI Hub
          </div>
        </div>
      )}

    </div>
  );
}
