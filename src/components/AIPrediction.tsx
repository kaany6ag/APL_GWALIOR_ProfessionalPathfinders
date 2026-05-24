/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AIPrediction as AIPredictionType, AIInsight } from "../types";
import { Cpu, ShieldCheck, Flame, Compass, HelpCircle, RefreshCw, BarChart2, Star } from "lucide-react";

interface AIPredictionProps {
  prediction: AIPredictionType | null;
  insight: AIInsight | null;
  playerName: string;
  isGenerating: boolean;
  onRefreshAI: () => void;
}

export default function AIPrediction({
  prediction,
  insight,
  playerName,
  isGenerating,
  onRefreshAI
}: AIPredictionProps) {

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden space-y-6 shadow-lg">
      {/* Decorative neon trace */}
      <div className="bg-neon-glow w-[200px] h-[200px] bg-orange-500/5 -top-16 -right-16"></div>

      {/* Title block with refresh trigger */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-orange-400 animate-pulse" />
            AI PREDICTION ENGINE
          </h3>
          <p className="text-[10px] text-slate-500 font-mono">QUANTUM GAME STATE FORECASTER & COMM-LINK ANALYZER</p>
        </div>

        <button
          id="btn-re-analyze"
          onClick={onRefreshAI}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-500/30 bg-orange-950/20 hover:bg-orange-950/40 text-orange-400 font-mono text-xs cursor-pointer transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
          {isGenerating ? "Simulating..." : "Generate AI Insights"}
        </button>
      </div>

      {isGenerating ? (
        /* LOADING SKELETON WITH CYBER SHIMMER */
        <div className="space-y-6 animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-slate-800 rounded w-1/4"></div>
            <div className="h-20 bg-slate-900 rounded-lg"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-900 rounded-xl border border-white/5"></div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="h-4 bg-slate-800 rounded w-1/3"></div>
            <div className="h-16 bg-slate-900 rounded-lg"></div>
          </div>
        </div>
      ) : prediction && insight ? (
        <div className="space-y-6">
          
          {/* AI RE-INTERNED COMMENTATOR ROLE BOX */}
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-3xl p-5 relative">
            <span className="absolute top-3 right-3 text-[9px] font-mono font-bold tracking-widest text-orange-400 bg-orange-950 border border-orange-500/20 rounded px-1.5 py-0.5 uppercase">
              {prediction.aiSuggestedRole}
            </span>

            <h4 className="font-display font-medium text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-orange-400" />
              Live AI Insighter Stream
            </h4>

            {/* Commentary text */}
            <p className="text-sm text-slate-200 leading-relaxed italic">
              “{insight.generalCommentary}”
            </p>

            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <span className="text-amber-400 text-[10px] font-bold block uppercase tracking-wide">
                  ⚡ OPPOSITION CAPTAIN DECREE (TACTIC):
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {insight.tacticalRecommendation}
                </p>
              </div>

              <div className="space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-emerald-400 text-[10px] font-bold block uppercase tracking-wide">
                    📈 GAME MOMENTUM VECTOR QUOTE:
                  </span>
                  <p className="text-slate-300 text-[11px] italic leading-normal">
                    “{insight.momentumShiftQuote}”
                  </p>
                </div>
                <span className="text-[10px] text-slate-500 text-right block self-end">
                  Processed at {insight.timestamp || "Active Frame"}
                </span>
              </div>
            </div>
          </div>

          {/* PREDICTION CARDS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Expected Runs Card */}
            <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-2xl hover:border-orange-500/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                <span>Runs Potential</span>
                <BarChart2 className="h-3.5 w-3.5 text-orange-450" />
              </div>
              <div className="mt-2.5">
                <span className="text-3xl font-display font-extrabold text-white">
                  ~{prediction.expectedRuns}
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">EXPECTED END SCORE</p>
              </div>
            </div>

            {/* Chances 50/100 */}
            <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-2xl hover:border-orange-500/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                <span>Milestone Prob.</span>
                <Flame className="h-3.5 w-3.5 text-red-500 animate-pulse" />
              </div>
              <div className="mt-2.5">
                <span className="text-xl sm:text-2xl font-display font-extrabold text-white block truncate">
                  {prediction.chancesOfFiftyHundred}
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-2">HALF / CENTURY ODDS</p>
              </div>
            </div>

            {/* Wicket / Danger Risk Gauge */}
            <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-2xl hover:border-orange-500/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                <span>Wicket Risk</span>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="mt-2.5">
                <span className="text-3xl font-display font-extrabold text-red-400">
                  {prediction.wicketProbability}
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">PROBABILITY OF OUT</p>
              </div>
            </div>

            {/* Fantasy Points Prediction */}
            <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-2xl hover:border-orange-500/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                <span>Fantasy Value</span>
                <Compass className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="mt-2.5">
                <span className="text-3xl font-display font-extrabold text-amber-400">
                  {prediction.fantasyPointsPrediction}
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">ESTIMATED FANTASY PTS</p>
              </div>
            </div>

          </div>

          <div className="rounded-2xl bg-orange-950/20 border border-orange-855/30 p-4 flex items-start gap-2 text-xs font-mono text-slate-400">
            <span className="p-1.5 rounded-full bg-blue-600/10 text-blue-400 font-bold">INFO</span>
            <p>
              Predictions calculated dynamically based on player momentum trends, pitch humidity ratios, and active opposition bowlers' swing indexes simulated on the server.
            </p>
          </div>

        </div>
      ) : (
        /* DISENGAGED STATE */
        <div className="text-center py-10 space-y-4">
          <Cpu className="h-12 w-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h4 className="font-display text-white font-bold text-base">Prediction engine ready</h4>
            <p className="text-slate-500 font-mono text-xs max-w-sm mx-auto">
              Simulate cricket analytics and commentaries using the server-side analysis core.
            </p>
          </div>
          <button
            type="button"
            onClick={onRefreshAI}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-orange-500 rounded text-xs font-mono font-bold text-white shadow shadow-orange-500/20 cursor-pointer"
          >
            Launch Commentary Simulation
          </button>
        </div>
      )}

    </div>
  );
}
