/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { LiveMatchData } from "../types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Activity, Shield, Users, Target, Zap, Clock } from "lucide-react";

interface LiveMatchUIProps {
  liveData: LiveMatchData;
}

export default function LiveMatchUI({ liveData }: LiveMatchUIProps) {
  // Parsing batsman 1 strike rate
  const bt1sr = liveData.partnership.batsman1Runs && liveData.partnership.batsman1Balls
    ? Math.round((liveData.partnership.batsman1Runs / liveData.partnership.batsman1Balls) * 1000) / 10
    : 0;

  // Parsing batsman 2 strike rate
  const bt2sr = liveData.partnership.batsman2Runs && liveData.partnership.batsman2Balls
    ? Math.round((liveData.partnership.batsman2Runs / liveData.partnership.batsman2Balls) * 1000) / 10
    : 0;

  // momentum history for charts
  const momentumChartData = liveData.momentumHistory.map((item, idx) => ({
    name: `Ball ${item.ball}`,
    pacing: item.score
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-lg">
      
      {/* 1. TITLE BAR */}
      <div className="border-b border-white/5 pb-3">
        <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          LIVE SCOREBOARD INTEGRATOR
        </h3>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
          LIVE MATCH STATE TRACER • TOURNAMENT SYSTEM
        </p>
      </div>

      {/* 2. MAINFRAME TICKER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* TEAM SCORE & STATUS BLOCK */}
        <div className="md:col-span-4 bg-slate-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">CHASING TARGET</span>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-extrabold text-white">{liveData.battingTeam}</span>
              <span className="text-sm font-mono text-slate-400">vs {liveData.bowlingTeam}</span>
            </div>
          </div>

          <div className="my-4">
            <div className="text-5xl font-display font-black text-cyan-400 tracking-tight flex items-baseline gap-1">
              {liveData.score}
              <span className="text-lg font-mono text-slate-400 font-normal">({liveData.overs} ov)</span>
            </div>
            <p className="text-xs font-mono text-emerald-400 mt-1">CRR: {liveData.currentRunRate} • RRR: {liveData.requiredRunRate}</p>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <strong>Target: 209 Runs</strong> Needed: 24 Runs in 8 balls.
          </div>
        </div>

        {/* ACTIVE CREASE PARTNERSHIP TRACKER */}
        <div className="md:col-span-8 bg-slate-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-2">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase">
              <Users className="h-4 w-4 text-cyan-400" />
              Crease Batsmen Status
            </span>
            <span className="text-slate-500">Active Partnership: <strong className="text-cyan-300 font-bold">{liveData.partnership.totalRuns} Runs ({liveData.partnership.totalBalls}b)</strong></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Batsman 1 Info Card */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
                <span className="text-[8px] font-mono text-cyan-400">STRIKER</span>
              </div>
              <p className="text-xs font-display font-bold text-slate-100">{liveData.partnership.batsman1}</p>
              
              <div className="flex justify-between items-end mt-2">
                <div>
                  <span className="text-2xl font-display font-black text-cyan-300">{liveData.partnership.batsman1Runs}</span>
                  <span className="text-xs text-slate-400 font-mono font-medium"> runs ({liveData.partnership.batsman1Balls}b)</span>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-500">
                  <p>SR: {bt1sr}%</p>
                </div>
              </div>
            </div>

            {/* Batsman 2 Info Card */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 relative overflow-hidden">
              <p className="text-xs font-display font-bold text-slate-300">{liveData.partnership.batsman2}</p>
              
              <div className="flex justify-between items-end mt-2">
                <div>
                  <span className="text-2xl font-display font-black text-slate-300">{liveData.partnership.batsman2Runs}</span>
                  <span className="text-xs text-slate-400 font-mono font-medium"> runs ({liveData.partnership.batsman2Balls}b)</span>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-500">
                  <p>SR: {bt2sr}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden w-full relative flex">
            {/* Split bar showing runs percentage share */}
            <div className="bg-cyan-400 h-full" style={{ width: `${(liveData.partnership.batsman1Runs / (liveData.partnership.totalRuns || 1)) * 100}%` }}></div>
            <div className="bg-indigo-400 h-full flex-1"></div>
          </div>
        </div>

      </div>

      {/* 3. GLOBAL MATCH MOMENTUM GRAPH OVER TIME */}
      <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-indigo-500/10">
          <div>
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-cyan-400" />
              Live Over-by-Over Battle Momentum Index
            </h4>
            <p className="text-[10px] font-mono text-slate-500">Real-time pressure swings between batting acceleration and bowling choking overs</p>
          </div>
          <span className="text-xs font-mono text-slate-400">OVERS: <strong className="text-cyan-400">{liveData.overs}</strong></span>
        </div>

        {/* Dynamic Line chart for game flow */}
        <div className="h-44 w-full text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={momentumChartData} margin={{ top: 5, right: 10, left: -30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={9} />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.2)" fontSize={9} />
              <Tooltip
                contentStyle={{ backgroundColor: "#020617", borderColor: "rgba(255,255,255,0.08)", borderRadius: "8px" }}
              />
              <Line
                type="monotone"
                dataKey="pacing"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={{ stroke: '#22c55e', strokeWidth: 2, r: 3, fill: '#0a1128' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-2">
          <span>📉 BOWLING DOMINANCING STRETCHES</span>
          <span>📈 BATTING ACCELERATION BURSTS</span>
        </div>
      </div>

    </div>
  );
}
