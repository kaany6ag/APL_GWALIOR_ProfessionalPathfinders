/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Cricketer } from "../types";
import { getPlayerBadges } from "../utils";
import {
  TrendingUp,
  Shield,
  Zap,
  Activity,
  Target,
  Globe,
  Dribbble,
  Calendar,
  AlertTriangle
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

interface PlayerDashboardProps {
  player: Cricketer;
}

export default function PlayerDashboard({ player }: PlayerDashboardProps) {
  const badges = getPlayerBadges(player);

  // Stats labels depends on role
  const isBowler = player.role === "Bowler";
  const { Math: m } = globalThis;

  // Custom SVG Wagon wheel points mapping
  const wagonWheelRadius = 90;
  const renderWagonWheelLines = () => {
    return player.wagonWheel.map((hit, idx) => {
      // Calculate x, y representation
      const radians = (hit.angle * Math.PI) / 180;
      // SVG center at 100, 100
      const distanceScale = hit.distance / 100;
      const x2 = 100 + wagonWheelRadius * distanceScale * Math.sin(radians);
      const y2 = 100 - wagonWheelRadius * distanceScale * Math.cos(radians);

      let strokeColor = "#3b82f6"; // default single/double - blue
      let strokeWidth = 1.5;
      if (hit.value === 4) {
        strokeColor = "#10b981"; // 4s - green
        strokeWidth = 2.5;
      } else if (hit.value === 6) {
        strokeColor = "#f43f5e"; // 6s - pink/red
        strokeWidth = 3;
      }

      return (
        <g key={idx}>
          <line
            x1="100"
            y1="100"
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            className="transition-all duration-500 hover:scale-105"
            strokeDasharray="200"
            strokeDashoffset="0"
          />
          <circle cx={x2} cy={y2} r={hit.value >= 4 ? 3 : 2} fill={strokeColor} />
        </g>
      );
    });
  };

  // Recharts momentum chart formatting data
  const momentumData = player.momentumTimeline.map(item => ({
    name: `Over ${item.over}`,
    momentum: item.momentum,
    description: item.description
  }));

  // Recharts radar statistics mapping
  const radarData = [
    { subject: 'Strike Rate', A: isBowler ? 30 : Math.min(100, player.stats.strikeRate / 2.2), fullMark: 100 },
    { subject: 'Economy Control', A: isBowler ? Math.max(10, 100 - player.stats.economy * 10) : 60, fullMark: 100 },
    { subject: 'Pressure Absorb', A: player.liveMetrics.pressureHandling, fullMark: 100 },
    { subject: 'Match Impact', A: player.liveMetrics.matchImpact, fullMark: 100 },
    { subject: 'Momentum Boost', A: Math.max(10, 50 + player.liveMetrics.momentumContribution), fullMark: 100 },
    { subject: 'Fielding / Aggression', A: Math.min(100, 30 + (player.stats.catches * 15) + (player.stats.sixes * 10)), fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HERO BADGES ROW - GLOSSY INTRO HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 justify-between shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-orange-500 p-0.5 shadow-lg shadow-orange-500/20">
            <img
              src={player.imageUrl}
              alt={player.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
            {/* Confidence indicator dot */}
            <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-slate-900 ${
              player.liveMetrics.confidenceIndicator === "Peak" ? "bg-emerald-400" :
              player.liveMetrics.confidenceIndicator === "Strong" ? "bg-blue-500" :
              player.liveMetrics.confidenceIndicator === "Moderate" ? "bg-yellow-400" : "bg-red-400"
            }`} title={`Confidence: ${player.liveMetrics.confidenceIndicator}`} />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{player.name}</h2>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-xs font-mono text-slate-400">
                {player.team}
              </span>
            </div>
            
            <p className="text-xs text-orange-400 font-mono flex items-center justify-center sm:justify-start gap-1.5 uppercase tracking-wider">
              <Zap className="h-3.5 w-3.5" />
              {player.role} • PHASE: {player.matchPhase} • SITUATION: {player.pressureSituation}
            </p>

            {/* Displaying badging row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-2">
              {badges.map((bdg, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold rounded-md border ${bdg.colorClass} ${bdg.bgClass}`}
                  title={bdg.description}
                >
                  {bdg.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Global Live metrics overview card */}
        <div className="grid grid-cols-2 gap-4 divide-x divide-slate-850 bg-slate-950/40 p-4 rounded-2xl border border-slate-800 w-full md:w-auto">
          <div className="px-3 text-center md:text-left">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Confidence Index</p>
            <p className="text-xl font-display font-extrabold text-white mt-1 uppercase flex items-center justify-center md:justify-start gap-1">
              <Shield className="h-4 w-4 text-orange-400" />
              {player.liveMetrics.confidenceIndicator}
            </p>
          </div>
          <div className="px-4 text-center md:text-left">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Match Impact Value</p>
            <p className="text-xl font-display font-extrabold text-emerald-400 mt-1">
              {player.liveMetrics.matchImpact}<span className="text-xs font-mono text-slate-500"> MIV</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. THE THREE CYBER METERS SPEEDOMETERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Performance Speedometer Dial */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-between text-center min-h-[220px]">
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-orange-400" />
            Performance Index Meter
          </h4>
          
          <div className="relative mt-3 flex items-center justify-center">
            {/* Dial SVG */}
            <svg className="w-36 h-20" viewBox="0 0 100 50">
              {/* Background Arch */}
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
              {/* Active Progress */}
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#orangeEmeraldGrad)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray="126"
                strokeDashoffset={126 - (126 * player.liveMetrics.performanceMeter) / 100}
              />
              <defs>
                <linearGradient id="orangeEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="absolute bottom-1 text-center">
              <span className="text-3xl font-display font-black text-white">{player.liveMetrics.performanceMeter}</span>
              <p className="text-[9px] font-mono text-slate-500 tracking-wider">WEIGHTED SCORE</p>
            </div>
          </div>
          
          <p className="text-[11px] text-slate-400 font-mono mt-2">
            Weighted metrics computed based on runs, boundaries, strike index and match phase gravity.
          </p>
        </div>

        {/* Pressure Handling Dial */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-between text-center min-h-[220px]">
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Target className="h-4 w-4 text-indigo-400" />
            Pressure Handler Ratio
          </h4>

          <div className="relative mt-3 flex items-center justify-center">
            {/* Concentric Gauge */}
            <svg className="w-32 h-32" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#818cf8" strokeWidth="8" strokeLinecap="round"
                strokeDasharray="251"
                strokeDashoffset={251 - (251 * player.liveMetrics.pressureHandling) / 100}
                className="rotate-[-90deg] origin-center"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-display font-black text-indigo-300">{player.liveMetrics.pressureHandling}%</span>
              <p className="text-[9px] font-mono text-slate-500 tracking-wider">ABSORPTION</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-mono mt-2">
            Evaluating performance volatility under critical situations and stadium noise peaks.
          </p>
        </div>

        {/* Momentum Vector Meter */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-between text-center min-h-[220px]">
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Momentum Delta Swing
          </h4>

          <div className="mt-4 w-full px-4 space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>BAT SQUEEZE</span>
              <span>BOWLING LOCK</span>
            </div>
            
            {/* Bipolar Slider */}
            <div className="relative h-2 bg-slate-950 border border-slate-800 rounded-full w-full">
              {/* Central anchor */}
              <div className="absolute left-1/2 -top-1 w-0.5 h-4 bg-slate-700"></div>
              {/* Momentum point indicator */}
              <div
                style={{ left: `${50 + (player.liveMetrics.momentumContribution || 0)}%` }}
                className={`absolute -top-1.5 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 font-mono transition-all duration-500 shadow-lg ${
                  player.liveMetrics.momentumContribution > 0 ? "bg-emerald-400" :
                  player.liveMetrics.momentumContribution < 0 ? "bg-red-400" : "bg-slate-300"
                }`}
              >
                {player.liveMetrics.momentumContribution > 0 ? "+" : ""}
              </div>
            </div>

            <div className="text-center">
              <span className="text-2xl font-display font-bold text-slate-200">
                {player.liveMetrics.momentumContribution > 0 ? "+" : ""}
                {player.liveMetrics.momentumContribution} pts
              </span>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">MOMENTUM SWING RADIAL</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-mono mt-2">
            Negative values yield match grip slipping; positive scores dictate active velocity lead.
          </p>
        </div>

      </div>

      {/* 3. TRADITIONAL STATS CARDS GRAPH */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active Runs Secured</p>
          <p className="text-2xl font-display font-bold mt-1 text-white">{player.stats.runs}</p>
          <span className="text-[10px] font-mono text-slate-400">{player.stats.balls} balls faced</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Strike Momentum</p>
          <p className="text-2xl font-display font-bold mt-1 text-orange-400">{player.stats.strikeRate}%</p>
          <span className="text-[10px] font-mono text-slate-400 font-mono">runs per 100 deliveries</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Wickets Secured</p>
          <p className="text-2xl font-display font-bold mt-1 text-emerald-400">{player.stats.wickets}</p>
          <span className="text-[10px] font-mono text-slate-400">{player.stats.oversCount} overs active</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Economy Index</p>
          <p className="text-2xl font-display font-bold mt-1 text-amber-400">{player.stats.economy || "0.0"}</p>
          <span className="text-[10px] font-mono text-slate-400">runs conceded per over</span>
        </div>

      </div>

      {/* 4. LOWER ADVANCED GRAPHICS COCKPIT: WAGON WHEEL & CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* WAGON WHEEL MAP BLOCK */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-between shadow-lg">
          <div className="w-full text-left pb-2 border-b border-white/5">
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-emerald-400" />
              Directional Wagon Wheel
            </h3>
            <p className="text-[10px] font-mono text-slate-500">Angle directions of runs scored inside boundary cords</p>
          </div>

          {/* Interactive Concentric pitch Map */}
          <div className="relative my-4 flex items-center justify-center">
            <svg className="w-48 h-48" viewBox="0 0 200 200">
              {/* Outer Boundary line */}
              <circle cx="100" cy="100" r={wagonWheelRadius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              {/* Nested rings */}
              <circle cx="100" cy="100" r={wagonWheelRadius - 30} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r={wagonWheelRadius - 60} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
              {/* Pitch in heart center */}
              <rect x="94" y="85" width="12" height="30" fill="rgba(255,255,255,0.08)" rx="1" />
              
              {/* Axes lines representing field sectors */}
              <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              <line x1="36" y1="36" x2="164" y2="164" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              <line x1="36" y1="164" x2="164" y2="36" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

              {/* Batting Labels */}
              <text x="100" y="25" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">OFF SIDE</text>
              <text x="100" y="185" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">ON SIDE</text>

              {/* Lines rendering */}
              {renderWagonWheelLines()}
            </svg>

            {/* Custom Wagon wheel side labels info legend */}
            <div className="absolute right-[-10px] top-[40%] flex flex-col gap-1 text-[8px] font-mono text-slate-500 scale-90">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> 4s Boundaries</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> 6s Boundaries</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Singles/Doubles</span>
            </div>
          </div>

          <div className="w-full flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-white/5 text-[10px] font-mono text-slate-400">
            <span>Fours: <strong className="text-emerald-400">{player.stats.fours}</strong></span>
            <span>Sixes: <strong className="text-red-400">{player.stats.sixes}</strong></span>
            <span>Fielding: <strong className="text-orange-400">{player.stats.catches} ct</strong></span>
          </div>
        </div>

        {/* MOMENTUM OVER TIME AREA PLOT */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-lg">
          <div className="w-full text-left pb-2 border-b border-white/5 flex justify-between items-center">
            <div>
              <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-orange-400" />
                Player Velocity Timeline
              </h3>
              <p className="text-[10px] font-mono text-slate-500">Live pacing and execution level indexed across active match overs</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[10px] font-mono text-emerald-400">
              STABLE DELTA
            </span>
          </div>

          {/* Recharts Area Chart container */}
          <div className="h-52 w-full mt-4 text-[10px] sm:text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={momentumData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs>
                   <linearGradient id="colorMomentum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} fontClass="font-mono" />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" fontSize={10} fontClass="font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#020617", borderColor: "rgba(255,255,255,0.08)", borderRadius: "8px" }}
                  labelClassName="font-display text-xs font-bold text-slate-300"
                />
                <Area type="monotone" dataKey="momentum" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorMomentum)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] font-mono text-slate-500 bg-slate-900/60 p-2 rounded border border-white/5 mt-2">
            <strong>Active Phase Log:</strong> {momentumData[momentumData.length - 1]?.description || "Stable anchoring session."}
          </div>
        </div>

        {/* RADAR CHART PANEL (SHOEBOX SUMMARY COMPONENT) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-lg">
          <div className="w-full text-left pb-2 border-b border-white/5">
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-indigo-400" />
              Dimensions Radar
            </h3>
            <p className="text-[10px] font-mono text-slate-500">Multidimensional metric profile mapping</p>
          </div>

          <div className="h-52 w-full mt-4 flex items-center justify-center font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" fontSize={8} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="none" />
                <Radar name={player.name} dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[9px] font-mono text-slate-500 text-center uppercase tracking-wide">
            HEXAGON MULTI-DIMENSIONAL PROFILE CONTRACT
          </div>
        </div>

      </div>

    </div>
  );
}
