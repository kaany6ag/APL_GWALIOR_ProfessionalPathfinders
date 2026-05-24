/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Cricketer } from "./types";

export interface BadgeConfig {
  name: string;
  description: string;
  colorClass: string; // Tailwind class
  bgClass: string;
}

/**
 * Resolves the system of dynamic badges based on live performance logic.
 */
export function getPlayerBadges(player: Cricketer): BadgeConfig[] {
  const badges: BadgeConfig[] = [];
  const { Math: m } = globalThis;

  const sr = player.stats.strikeRate;
  const runs = player.stats.runs;
  const wickets = player.stats.wickets;
  const econ = player.stats.economy;
  const pressure = player.pressureSituation;
  const phase = player.matchPhase;
  const role = player.role;

  // 1. Match Changer (3+ wickets OR 75+ runs)
  if (wickets >= 3 || runs >= 75) {
    badges.push({
      name: "Match Changer",
      description: "Capable of turning the game's momentum single-handedly.",
      colorClass: "text-amber-400 border-amber-500/30",
      bgClass: "bg-amber-500/10"
    });
  }

  // 2. Under Pressure (High match pressure)
  if (pressure === "High") {
    badges.push({
      name: "Under Pressure",
      description: "Thrives in situations of maximum tension.",
      colorClass: "text-red-400 border-red-500/30",
      bgClass: "bg-red-500/10"
    });
  }

  // 3. Finisher (Batsman in Death overs with SR > 150)
  if (role === "Batsman" && phase === "Death" && sr >= 150) {
    badges.push({
      name: "Finisher",
      description: "Deadly in closing batsman positions.",
      colorClass: "text-emerald-400 border-emerald-500/30",
      bgClass: "bg-emerald-500/10"
    });
  }

  // 4. Powerplay Dominator (Powerplay phase with SR > 140 or wickets in powerplay)
  if (phase === "Powerplay" && (sr >= 140 || wickets >= 1)) {
    badges.push({
      name: "Powerplay Dominator",
      description: "Controls the initial field restrictions effortlessly.",
      colorClass: "text-cyan-400 border-cyan-500/30",
      bgClass: "bg-cyan-500/10"
    });
  }

  // 5. Consistent Performer (average runs > 40 OR wickets index is secure)
  if (runs >= 50 || wickets >= 2) {
    badges.push({
      name: "Consistent Performer",
      description: "Guarantees reliable returns with high contribution stats.",
      colorClass: "text-purple-400 border-purple-500/30",
      bgClass: "bg-purple-500/10"
    });
  }

  // 6. Risky Player (SR > 185 with runs < 25)
  if (sr > 185 && runs < 25 && runs > 0) {
    badges.push({
      name: "Risky Player",
      description: "High-octane aggression with high volatility.",
      colorClass: "text-orange-400 border-orange-500/30",
      bgClass: "bg-orange-500/10"
    });
  }

  // 7. X-Factor (Impact score > 85)
  if (player.liveMetrics.matchImpact > 85) {
    badges.push({
      name: "X-Factor",
      description: "Unpredictable excellence that disrupts tactical structures.",
      colorClass: "text-fuchsia-400 border-fuchsia-500/30",
      bgClass: "bg-fuchsia-500/10"
    });
  }

  // Fallback: Default badge if none apply is Consistent Performer
  if (badges.length === 0) {
    badges.push({
      name: "Reliable Hand",
      description: "A stable pillar for the team build.",
      colorClass: "text-slate-400 border-slate-500/30",
      bgClass: "bg-slate-500/10"
    });
  }

  return badges;
}

/**
 * Client-Side image compression helper utilizing Canvas
 */
export function compressImage(base64Str: string, maxWidth = 400, maxHeight = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const { Math: m } = globalThis;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = m.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = m.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Compress as low-overhead jpeg for ultra compact transmission
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        resolve(compressedBase64);
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = (err) => reject(err);
  });
}
