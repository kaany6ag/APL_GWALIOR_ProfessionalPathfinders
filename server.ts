/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Cricketer, LiveMetrics, AIPrediction, AIInsight, LiveMatchData, FanPoll } from "./src/types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for JSON payload parsing
app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log("Gemini API Client initialized successfully.");
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI:", err);
      }
    } else {
      console.warn("GEMINI_API_KEY is not configured or uses placeholder. Running in heuristic analytics fallback mode.");
    }
  }
  return aiClient;
}

// ------------------------------------------------------------------
// In-Memory Database (Cricket IQ Seed Data)
// ------------------------------------------------------------------

let cricketers: Cricketer[] = [
  {
    id: "1",
    name: "Virat Kohli",
    team: "Royal Challengers Bengaluru",
    role: "Batsman",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Virat_Kohli_2023.jpg/480px-Virat_Kohli_2023.jpg",
    isTrending: true,
    matchPhase: "Middle",
    pressureSituation: "High",
    stats: {
      runs: 82,
      balls: 53,
      strikeRate: 154.7,
      wickets: 0,
      oversCount: 0,
      economy: 0,
      fours: 6,
      sixes: 4,
      catches: 1
    },
    liveMetrics: {
      performanceMeter: 94,
      matchImpact: 92,
      pressureHandling: 96,
      momentumContribution: 38,
      confidenceIndicator: "Peak"
    },
    wagonWheel: [
      { angle: 30, distance: 80, value: 4 },
      { angle: 65, distance: 95, value: 6 },
      { angle: 120, distance: 75, value: 4 },
      { angle: 180, distance: 40, value: 1 },
      { angle: 220, distance: 60, value: 2 },
      { angle: 290, distance: 85, value: 4 },
      { angle: 320, distance: 90, value: 6 },
      { angle: 350, distance: 50, value: 2 }
    ],
    momentumTimeline: [
      { over: 5, momentum: 10, description: "Cautious entry as top-order crumbles" },
      { over: 8, momentum: 25, description: "Rotation active, building boundary rhythm" },
      { over: 12, momentum: 45, description: "Accelerates off spin, 4s over cover" },
      { over: 15, momentum: 75, description: "Superb pressure absorb, hits critical six" },
      { over: 18, momentum: 95, description: "Full velocity control, dominant strike rate" }
    ]
  },
  {
    id: "2",
    name: "Jasprit Bumrah",
    team: "Mumbai Indians",
    role: "Bowler",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/Jasprit_Bumrah_Jan_2020.jpg",
    isTrending: true,
    matchPhase: "Death",
    pressureSituation: "High",
    stats: {
      runs: 4,
      balls: 2,
      strikeRate: 200.0,
      wickets: 3,
      oversCount: 3.4,
      economy: 4.6,
      fours: 0,
      sixes: 0,
      catches: 0
    },
    liveMetrics: {
      performanceMeter: 96,
      matchImpact: 94,
      pressureHandling: 98,
      momentumContribution: 45,
      confidenceIndicator: "Peak"
    },
    wagonWheel: [
      { angle: 45, distance: 30, value: 1 },
      { angle: 180, distance: 85, value: 4 }
    ],
    momentumTimeline: [
      { over: 2, momentum: 15, description: "Powerplay maiden over, high intimidation" },
      { over: 6, momentum: 35, description: "Draws mistake, claims critical opener wicket" },
      { over: 13, momentum: 65, description: "Deceptive slower balls choke middle overs run rate" },
      { over: 17, momentum: 90, description: "Double wicket spell, toes crushing yorkers" },
      { over: 19, momentum: 98, description: "Flawless death bowling defends target smoothly" }
    ]
  },
  {
    id: "3",
    name: "MS Dhoni",
    team: "Chennai Super Kings",
    role: "Wicketkeeper",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/70/M._S._Dhoni_July_2019.jpg",
    isTrending: true,
    matchPhase: "Death",
    pressureSituation: "High",
    stats: {
      runs: 28,
      balls: 11,
      strikeRate: 254.5,
      wickets: 0,
      oversCount: 0,
      economy: 0,
      fours: 2,
      sixes: 3,
      catches: 2
    },
    liveMetrics: {
      performanceMeter: 91,
      matchImpact: 89,
      pressureHandling: 97,
      momentumContribution: 44,
      confidenceIndicator: "Peak"
    },
    wagonWheel: [
      { angle: 40, distance: 98, value: 6 },
      { angle: 70, distance: 92, value: 6 },
      { angle: 110, distance: 88, value: 4 },
      { angle: 155, distance: 94, value: 6 },
      { angle: 250, distance: 65, value: 2 },
      { angle: 310, distance: 80, value: 4 }
    ],
    momentumTimeline: [
      { over: 15, momentum: 5, description: "Tough match entry in death overs against premium bowling" },
      { over: 17, momentum: 60, description: "Explosive spin over, shifts momentum timeline upward with crucial 6s" },
      { over: 19, momentum: 92, description: "Dominant sixes in the death over phase, clinical finishing" }
    ]
  },
  {
    id: "4",
    name: "Rohit Sharma",
    team: "Mumbai Indians",
    role: "Batsman",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Rohit_Sharma_November_2023.jpg",
    isTrending: false,
    matchPhase: "Powerplay",
    pressureSituation: "Medium",
    stats: {
      runs: 54,
      balls: 31,
      strikeRate: 174.2,
      wickets: 0,
      oversCount: 0,
      economy: 0,
      fours: 7,
      sixes: 3,
      catches: 0
    },
    liveMetrics: {
      performanceMeter: 86,
      matchImpact: 85,
      pressureHandling: 82,
      momentumContribution: 35,
      confidenceIndicator: "Strong"
    },
    wagonWheel: [
      { angle: 45, distance: 95, value: 6 },
      { angle: 90, distance: 85, value: 4 },
      { angle: 135, distance: 90, value: 6 },
      { angle: 210, distance: 60, value: 4 },
      { angle: 270, distance: 40, value: 1 },
      { angle: 315, distance: 95, value: 6 }
    ],
    momentumTimeline: [
      { over: 1, momentum: 15, description: "Calm entry, matching ball speed efficiently" },
      { over: 3, momentum: 45, description: "Powerplay acceleration, pulling over deep midwicket" },
      { over: 5, momentum: 75, description: "Superb coverage, pulling up high strike rate" },
      { over: 6, momentum: 86, description: "Secures a polished half-century in the powerplay" }
    ]
  },
  {
    id: "5",
    name: "Suryakumar Yadav",
    team: "Mumbai Indians",
    role: "Batsman",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Suryakumar_Yadav_in_2023.jpg",
    isTrending: true,
    matchPhase: "Middle",
    pressureSituation: "High",
    stats: {
      runs: 61,
      balls: 28,
      strikeRate: 217.9,
      wickets: 0,
      oversCount: 0,
      economy: 0,
      fours: 5,
      sixes: 4,
      catches: 1
    },
    liveMetrics: {
      performanceMeter: 93,
      matchImpact: 91,
      pressureHandling: 94,
      momentumContribution: 46,
      confidenceIndicator: "Peak"
    },
    wagonWheel: [
      { angle: 30, distance: 85, value: 4 },
      { angle: 90, distance: 90, value: 6 },
      { angle: 150, distance: 75, value: 4 },
      { angle: 220, distance: 95, value: 6 },
      { angle: 280, distance: 80, value: 4 },
      { angle: 340, distance: 92, value: 6 }
    ],
    momentumTimeline: [
      { over: 7, momentum: 10, description: "Enters after wicket fall, settles in immediately" },
      { over: 9, momentum: 40, description: "Launches sweep shots behind square option" },
      { over: 12, momentum: 70, description: "360-degree shots unlock dense field positions" },
      { over: 14, momentum: 93, description: "Full throttle pacing, dominant boundary run-rate contribution" }
    ]
  },
  {
    id: "6",
    name: "Andre Russell",
    team: "Kolkata Knight Riders",
    role: "All-rounder",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Andre_Russell_at_a_press_conference.jpg",
    isTrending: false,
    matchPhase: "Death",
    pressureSituation: "Medium",
    stats: {
      runs: 45,
      balls: 19,
      strikeRate: 236.8,
      wickets: 1,
      oversCount: 2.0,
      economy: 8.5,
      fours: 4,
      sixes: 3,
      catches: 1
    },
    liveMetrics: {
      performanceMeter: 84,
      matchImpact: 87,
      pressureHandling: 78,
      momentumContribution: 41,
      confidenceIndicator: "Strong"
    },
    wagonWheel: [
      { angle: 45, distance: 95, value: 6 },
      { angle: 90, distance: 85, value: 4 },
      { angle: 135, distance: 90, value: 6 },
      { angle: 210, distance: 60, value: 4 },
      { angle: 270, distance: 40, value: 1 },
      { angle: 315, distance: 95, value: 6 }
    ],
    momentumTimeline: [
      { over: 10, momentum: 15, description: "Introduced as backup option, gets crucial wicket" },
      { over: 16, momentum: 55, description: "Batting entry, hits a brutal straight six first ball" },
      { over: 18, momentum: 84, description: "Massive pull-shots over cow corner boost team total" }
    ]
  },
  {
    id: "7",
    name: "Shubman Gill",
    team: "Gujarat Titans",
    role: "Batsman",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Shubman_Gill_during_a_training_session_in_2023.jpg",
    isTrending: false,
    matchPhase: "Powerplay",
    pressureSituation: "Medium",
    stats: {
      runs: 42,
      balls: 27,
      strikeRate: 155.6,
      wickets: 0,
      oversCount: 0,
      economy: 0,
      fours: 5,
      sixes: 1,
      catches: 1
    },
    liveMetrics: {
      performanceMeter: 78,
      matchImpact: 76,
      pressureHandling: 75,
      momentumContribution: 22,
      confidenceIndicator: "Strong"
    },
    wagonWheel: [
      { angle: 50, distance: 85, value: 4 },
      { angle: 110, distance: 60, value: 2 },
      { angle: 170, distance: 90, value: 4 },
      { angle: 230, distance: 45, value: 1 },
      { angle: 290, distance: 75, value: 4 },
      { angle: 330, distance: 95, value: 6 }
    ],
    momentumTimeline: [
      { over: 1, momentum: 10, description: "Elite cover drive opens his scoring account" },
      { over: 3, momentum: 35, description: "Matches spin rotation, hits boundaries cleanly" },
      { over: 5, momentum: 65, description: "Short-arm jab lands safely over square-leg boundary" },
      { over: 7, momentum: 78, description: "Consistent strike rotation controls match flow smoothly" }
    ]
  },
  {
    id: "8",
    name: "Rashid Khan",
    team: "Gujarat Titans",
    role: "Bowler",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Rashid_Khan_at_the_2019_Cricket_World_Cup.jpg",
    isTrending: true,
    matchPhase: "Middle",
    pressureSituation: "High",
    stats: {
      runs: 12,
      balls: 6,
      strikeRate: 200.0,
      wickets: 2,
      oversCount: 4.0,
      economy: 5.5,
      fours: 1,
      sixes: 1,
      catches: 1
    },
    liveMetrics: {
      performanceMeter: 90,
      matchImpact: 88,
      pressureHandling: 92,
      momentumContribution: 40,
      confidenceIndicator: "Peak"
    },
    wagonWheel: [
      { angle: 90, distance: 95, value: 6 },
      { angle: 270, distance: 80, value: 4 }
    ],
    momentumTimeline: [
      { over: 8, momentum: 15, description: "Enters bowl matrix, delivers highly compressed dot balls" },
      { over: 10, momentum: 45, description: "Baffling googly rattles stump, claims wicket" },
      { over: 12, momentum: 70, description: "Double play options limit middle overs strike flow" },
      { over: 14, momentum: 90, description: "Chokes runs rate, claims second wicket with slider" }
    ]
  }
];

let liveMatchData: LiveMatchData = {
  battingTeam: "Royal Challengers Bengaluru",
  bowlingTeam: "Mumbai Indians",
  score: "185/5",
  overs: "18.4",
  requiredRunRate: 11.2,
  currentRunRate: 9.9,
  partnership: {
    batsman1: "Virat Kohli",
    batsman1Runs: 82,
    batsman1Balls: 53,
    batsman2: "Glenn Maxwell",
    batsman2Runs: 16,
    batsman2Balls: 9,
    totalRuns: 42,
    totalBalls: 23
  },
  momentumHistory: [
    { ball: "15.1", score: 45 },
    { ball: "15.3", score: 55 },
    { ball: "16.2", score: 40 },
    { ball: "16.6", score: 65 },
    { ball: "17.2", score: 70 },
    { ball: "18.0", score: 85 },
    { ball: "18.4", score: 95 }
  ]
};

let fanPoll: FanPoll = {
  question: "Who will claim the MVP award for today's high-octane IPL 2026 matchup?",
  options: [
    { id: "opt1", text: "Virat Kohli (with match-winning chase potential)", votes: 342 },
    { id: "opt2", text: "Jasprit Bumrah (defending with pinpoint yorkers)", votes: 295 },
    { id: "opt3", text: "MS Dhoni (lethal late-overs explosive finishing)", votes: 212 },
    { id: "opt4", text: "Rashid Khan (magical spin bowling to turn the tide)", votes: 118 }
  ],
  totalVotes: 967
};

// ------------------------------------------------------------------
// Weighted Multi-Factor Performance & Pressure Formulation Logic
// ------------------------------------------------------------------

function calculateMetrics(stats: any, role: string, phase: string, pressure: string): LiveMetrics {
  let score = 50; // default anchor
  const isBowler = role === 'Bowler';
  const isBatsman = role === 'Batsman' || role === 'Wicketkeeper';
  const isAllRounder = role === 'All-rounder';

  if (isBatsman || isAllRounder) {
    // runs scale (capped at 45 metrics point max)
    score += Math.min(stats.runs * 0.5, 45);
    // strike rate booster / penalty
    const sr = stats.strikeRate;
    if (sr > 170) score += 18;
    else if (sr > 140) score += 12;
    else if (sr > 110) score += 5;
    else if (sr > 0) score -= 8;

    // boundaries trigger
    score += (stats.fours * 0.8) + (stats.sixes * 1.8);
  }

  if (isBowler || isAllRounder) {
    // wickets are worth massive weight
    score += stats.wickets * 15;
    // economy impact
    const econ = stats.economy;
    if (econ > 0) {
      if (econ < 6.0) score += 18;
      else if (econ < 8.0) score += 8;
      else if (econ > 10.0) score -= 12;
    }
  }

  // fielding impact
  score += stats.catches * 3.5;

  // phase and pressure boosts
  if (pressure === 'High') {
    score += 8;
  } else if (pressure === 'Low' && stats.runs < 10) {
    score -= 4; // complacency factor
  }

  // normalize strictly to [10, 99]
  const performanceMeter = Math.max(10, Math.min(99, Math.round(score)));

  // Impact Score (Overall Match Gravity)
  const battingImpact = (stats.runs * 1.25) + (stats.sixes * 4);
  const bowlingImpact = (stats.wickets * 22) + Math.max(0, (8 - stats.economy) * 5);
  let matchImpact = (isBowler ? bowlingImpact * 1.6 : battingImpact) + (stats.catches * 6);
  if (isAllRounder) {
    matchImpact = (battingImpact + bowlingImpact) * 0.85;
  }
  matchImpact = Math.max(12, Math.min(100, Math.round(matchImpact)));

  // Pressure Handling Index
  let pressureHandling = 50;
  if (pressure === 'High') {
    if (isBatsman || isAllRounder) {
      pressureHandling = stats.runs > 30 ? Math.min(98, 45 + (stats.runs / (stats.balls || 1)) * 35) : 55;
    }
    if (isBowler) {
      pressureHandling = stats.economy < 8.0 ? Math.min(98, 40 + (8.5 - stats.economy) * 10) : 35;
    }
  } else if (pressure === 'Medium') {
    pressureHandling = 72;
  } else {
    pressureHandling = 80;
  }
  pressureHandling = Math.max(15, Math.min(98, Math.round(pressureHandling)));

  // Momentum Contribution
  let momentumContribution = 0;
  if (isBatsman || isAllRounder) {
    momentumContribution += (stats.strikeRate - 125) * 0.25;
  }
  if (isBowler || isAllRounder) {
    momentumContribution += (7.5 - stats.economy) * 6;
  }
  momentumContribution = Math.max(-45, Math.min(48, Math.round(momentumContribution)));

  // Confidence Rating
  let confidenceIndicator: 'Peak' | 'Strong' | 'Moderate' | 'Shaky' | 'Critical' = 'Moderate';
  if (performanceMeter > 88) confidenceIndicator = 'Peak';
  else if (performanceMeter > 72) confidenceIndicator = 'Strong';
  else if (performanceMeter > 44) confidenceIndicator = 'Moderate';
  else if (performanceMeter > 24) confidenceIndicator = 'Shaky';
  else confidenceIndicator = 'Critical';

  return {
    performanceMeter,
    matchImpact,
    pressureHandling,
    momentumContribution,
    confidenceIndicator
  };
}

// Helper to calculate fantasy points prediction
function calculateFantasyPoints(stats: any, role: string): number {
  let pts = 0;
  pts += stats.runs;
  pts += stats.fours * 1;
  pts += stats.sixes * 2;
  if (stats.runs >= 100) pts += 16;
  else if (stats.runs >= 50) pts += 8;

  pts += stats.wickets * 25;
  if (stats.wickets >= 5) pts += 16;
  else if (stats.wickets >= 3) pts += 8;

  pts += stats.catches * 8;
  return pts;
}

// ------------------------------------------------------------------
// API Rotations & Services Setup
// ------------------------------------------------------------------

// 1. Get All Players
app.get("/api/players", (req, res) => {
  res.json(cricketers);
});

// 2. Add / Edit Player (Admin Mode)
app.post("/api/players", (req, res) => {
  const { id, name, team, role, stats, matchPhase, pressureSituation, imageUrl } = req.body;
  
  if (!name || !team || !role) {
    return res.status(400).json({ error: "Missing identity attributes: name, team, and role are mandatory." });
  }

  const defaultStats = {
    runs: stats?.runs ?? 0,
    balls: stats?.balls ?? 0,
    strikeRate: stats?.strikeRate ?? 100,
    wickets: stats?.wickets ?? 0,
    oversCount: stats?.oversCount ?? 0,
    economy: stats?.economy ?? 0,
    fours: stats?.fours ?? 0,
    sixes: stats?.sixes ?? 0,
    catches: stats?.catches ?? 0,
  };

  const calculatedLiveMetrics = calculateMetrics(defaultStats, role, matchPhase || "Middle", pressureSituation || "Medium");

  if (id) {
    // Edit existing player index
    const index = cricketers.findIndex(c => c.id === id);
    if (index !== -1) {
      cricketers[index] = {
        ...cricketers[index],
        name,
        team,
        role,
        matchPhase: matchPhase || cricketers[index].matchPhase,
        pressureSituation: pressureSituation || cricketers[index].pressureSituation,
        imageUrl: imageUrl || cricketers[index].imageUrl,
        stats: defaultStats,
        liveMetrics: calculatedLiveMetrics
      };
      return res.json(cricketers[index]);
    }
  }

  // Create new player entry
  const newPlayer: Cricketer = {
    id: Date.now().toString(),
    name,
    team,
    role,
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1540747737956-378724044453?w=400&auto=format&fit=crop&q=60",
    matchPhase: matchPhase || "Middle",
    pressureSituation: pressureSituation || "Medium",
    stats: defaultStats,
    liveMetrics: calculatedLiveMetrics,
    wagonWheel: [
      { angle: 45, distance: 70, value: 4 },
      { angle: 180, distance: 30, value: 1 },
      { angle: 280, distance: 90, value: 6 }
    ],
    momentumTimeline: [
      { over: 1, momentum: 10, description: "Match entry initiated" },
      { over: 5, momentum: calculatedLiveMetrics.performanceMeter, description: "Active state calibration complete" }
    ]
  };

  cricketers.push(newPlayer);
  res.json(newPlayer);
});

// 3. Delete Player Route (Admin helper)
app.delete("/api/players/:id", (req, res) => {
  const { id } = req.params;
  cricketers = cricketers.filter(c => c.id !== id);
  res.json({ success: true, message: "Player removed successfully." });
});

// 4. Custom Player Image Upload (Base64 wrapper with low overhead compression)
app.post("/api/upload", (req, res) => {
  const { imageData, fileName, name, team, role } = req.body;
  if (!imageData) {
    return res.status(400).json({ error: "No image payload found in request." });
  }

  // Create a brand new active player based on the image
  const calculatedLiveMetrics = calculateMetrics({ runs: 28, balls: 14, strikeRate: 200, wickets: 0, oversCount: 0, economy: 0, fours: 3, sixes: 2, catches: 0 }, role || "Batsman", "Middle", "Medium");

  const uploadedCricketer: Cricketer = {
    id: `upload-${Date.now()}`,
    name: name || fileName?.split('.')[0] || "Custom Cricketer",
    team: team || "Individual Independent Team",
    role: role || "Batsman",
    imageUrl: imageData, // base64 encoded compressed data
    matchPhase: "Middle",
    pressureSituation: "Medium",
    stats: {
      runs: 28,
      balls: 14,
      strikeRate: 200.0,
      wickets: 0,
      oversCount: 0,
      economy: 0,
      fours: 3,
      sixes: 2,
      catches: 0
    },
    liveMetrics: calculatedLiveMetrics,
    wagonWheel: [
      { angle: 60, distance: 80, value: 4 },
      { angle: 120, distance: 50, value: 2 },
      { angle: 240, distance: 95, value: 6 }
    ],
    momentumTimeline: [
      { over: 1, momentum: 20, description: "Opening session" },
      { over: 3, momentum: 50, description: "Counter attack phase launched with sixes" }
    ]
  };

  cricketers.unshift(uploadedCricketer); // Put it first
  res.json(uploadedCricketer);
});

// 5. Get Match Live Data
app.get("/api/match/stats", (req, res) => {
  res.json(liveMatchData);
});

// 6. Update Match Live Data (Admin Mode)
app.post("/api/match/update", (req, res) => {
  const { score, overs, requiredRunRate, currentRunRate, batsman1Runs, batsman2Runs, batsman1Name, batsman2Name } = req.body;
  if (score) liveMatchData.score = score;
  if (overs) liveMatchData.overs = overs;
  if (requiredRunRate !== undefined) liveMatchData.requiredRunRate = Number(requiredRunRate);
  if (currentRunRate !== undefined) liveMatchData.currentRunRate = Number(currentRunRate);
  if (batsman1Runs !== undefined) liveMatchData.partnership.batsman1Runs = Number(batsman1Runs);
  if (batsman2Runs !== undefined) liveMatchData.partnership.batsman2Runs = Number(batsman2Runs);
  if (batsman1Name) liveMatchData.partnership.batsman1 = batsman1Name;
  if (batsman2Name) liveMatchData.partnership.batsman2 = batsman2Name;

  // Add random point to momentum history to keep graph dynamic
  liveMatchData.momentumHistory.push({
    ball: overs || "19.0",
    score: Math.round(40 + Math.random() * 55)
  });
  if (liveMatchData.momentumHistory.length > 10) {
    liveMatchData.momentumHistory.shift();
  }

  res.json(liveMatchData);
});

// 7. Get Fan Poll Questions/State
app.get("/api/fan-survey/feed", (req, res) => {
  res.json(fanPoll);
});

// 8. Handle Fan Poll Vote
app.post("/api/fan-survey/submit", (req, res) => {
  const { optionId } = req.body;
  const option = fanPoll.options.find(opt => opt.id === optionId);
  if (option) {
    option.votes += 1;
    fanPoll.totalVotes += 1;
    res.json({ success: true, poll: fanPoll });
  } else {
    res.status(404).json({ error: "Vote option not found." });
  }
});

// ------------------------------------------------------------------
// AI prediction & smart commentary analysis route (Gemini Integration)
// ------------------------------------------------------------------

app.post("/api/analyze/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const player = cricketers.find(c => c.id === playerId);
  if (!player) {
    return res.status(404).json({ error: "Cricketer not found in database." });
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      console.log(`Sending live query to Gemini 3.5 for player: ${player.name}`);
      const prompt = `You are a legendary, elite cricket commentator and IPL sports AI analyst.
Analyze this cricketer's current IPL 2026 match situation:
Player Name: ${player.name}
Role: ${player.role}
Team: ${player.team}
Match Phase: ${player.matchPhase} (Powerplay / Middle / Death)
Pressure Level of Match: ${player.pressureSituation}
Current active innings stats:
- Runs scored: ${player.stats.runs} (from ${player.stats.balls} balls faced)
- Strike rate: ${player.stats.strikeRate}
- Wickets taken: ${player.stats.wickets} (from ${player.stats.oversCount} overs)
- Bowling Economy: ${player.stats.economy}
- Fours: ${player.stats.fours}, Sixes: ${player.stats.sixes}, Catches: ${player.stats.catches}

State indicators calculated:
- Performance meter index: ${player.liveMetrics.performanceMeter}/100
- Match Impact Index: ${player.liveMetrics.matchImpact}/100
- Pressure Handling ability: ${player.liveMetrics.pressureHandling}/100
- Shift in momentum contribution: ${player.liveMetrics.momentumContribution} (-50 to +50)
- Confidence stance: ${player.liveMetrics.confidenceIndicator}

Generate a beautiful, sports-grid appropriate JSON response containing:
1. "commentary": An engaging, professional, witty 3-sentence match-style expert AI insight explaining how this player operates in this match phase under ${player.pressureSituation} pressure.
2. "tactics": 1 actionable elite recommendation for the opposition captain on how to restrict this player right now.
3. "momentumShiftQuote": A punchy one-liner summarizing their game direction.
4. "expectedRuns": An integer prediction of their final runs score if batting (or 0 if pure bowler).
5. "chancesOfFiftyHundred": String prediction like "80% / 15%".
6. "wicketProbability": String percentage like "30%".
7. "predictedFinalImpact": 'High', 'Medium', or 'Low'.
8. "fantasyPointsPrediction": Calculated fantasy metric (integer).
9. "aiSuggestedRole": A premium title describing their active tactical mandate (e.g., "Deep Anchor Shield", "Explosive Middle Infiltrator", "Death Bowler Destroyer").

Strict Rule: Return ONLY raw, valid JSON matching the following schema structure. Do not surround with markdown block syntax.

{
  "generalCommentary": "string",
  "tacticalRecommendation": "string",
  "momentumShiftQuote": "string",
  "expectedRuns": number,
  "chancesOfFiftyHundred": "string",
  "wicketProbability": "string",
  "predictedFinalImpact": "High" | "Medium" | "Low",
  "fantasyPointsPrediction": number,
  "aiSuggestedRole": "string"
}`;

      // Query Gemini 3.5 in JSON mode
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              generalCommentary: { type: Type.STRING },
              tacticalRecommendation: { type: Type.STRING },
              momentumShiftQuote: { type: Type.STRING },
              expectedRuns: { type: Type.INTEGER },
              chancesOfFiftyHundred: { type: Type.STRING },
              wicketProbability: { type: Type.STRING },
              predictedFinalImpact: { type: Type.STRING },
              fantasyPointsPrediction: { type: Type.INTEGER },
              aiSuggestedRole: { type: Type.STRING }
            },
            required: [
              "generalCommentary",
              "tacticalRecommendation",
              "momentumShiftQuote",
              "expectedRuns",
              "chancesOfFiftyHundred",
              "wicketProbability",
              "predictedFinalImpact",
              "fantasyPointsPrediction",
              "aiSuggestedRole"
            ]
          }
        }
      });

      const responseText = response.text || "";
      const parsedAI = JSON.parse(responseText.trim());
      
      const insight: AIInsight = {
        playerId,
        timestamp: new Date().toLocaleTimeString(),
        generalCommentary: parsedAI.generalCommentary,
        tacticalRecommendation: parsedAI.tacticalRecommendation,
        momentumShiftQuote: parsedAI.momentumShiftQuote
      };

      const prediction: AIPrediction = {
        expectedRuns: parsedAI.expectedRuns,
        chancesOfFiftyHundred: parsedAI.chancesOfFiftyHundred,
        wicketProbability: parsedAI.wicketProbability,
        predictedFinalImpact: parsedAI.predictedFinalImpact as 'High' | 'Medium' | 'Low',
        fantasyPointsPrediction: parsedAI.fantasyPointsPrediction,
        aiSuggestedRole: parsedAI.aiSuggestedRole
      };

      return res.json({ insight, prediction });

    } catch (err) {
      console.error("Gemini content generation failed, resorting to fallback logic.", err);
    }
  }

  // ------------------------------------------------------------------
  // Heuristic Analytics Fallback Module
  // ------------------------------------------------------------------
  console.log("Leveraging Cricket IQ heuristic analysis formulation engine.");
  const runsSecured = player.stats.runs;
  const wicketsSecured = player.stats.wickets;
  const isBowlerRole = player.role === 'Bowler';
  
  let expectedRuns = 0;
  let chancesOfFiftyHundred = "0% / 0%";
  let wicketProbability = "20%";
  let predictedFinalImpact: 'High' | 'Medium' | 'Low' = "Medium";
  let aiSuggestedRole = "Dynamic Anchor Strategy";
  let commentary = "";
  let tactics = "";
  let quote = "";

  if (isBowlerRole) {
    expectedRuns = player.stats.runs + 4;
    chancesOfFiftyHundred = "2% / 0%";
    wicketProbability = `${Math.min(95, 30 + player.liveMetrics.performanceMeter * 0.6)}%`;
    predictedFinalImpact = player.liveMetrics.performanceMeter > 80 ? "High" : "Medium";
    aiSuggestedRole = player.matchPhase === 'Death' ? "Death Over Specialist" : "Opening Swing Strategist";
    commentary = `${player.name} is showcasing elegant line and length during the ${player.matchPhase} phase. Operating under ${player.pressureSituation} pressure, they have squeezed out critical batting space with a robust speed control loop.`;
    tactics = "Apply block defenses against their inswingers; try to take quick singles rather than clearing long fences.";
    quote = "Controlling the match trajectory with every delivery rotation.";
  } else {
    // Batsman
    expectedRuns = Math.round(runsSecured + (100 - player.liveMetrics.performanceMeter) * 0.4 + 15);
    const fiftyChance = Math.min(99, Math.round(runsSecured * 0.8 + 20));
    const hundredChance = Math.min(75, Math.round(runsSecured * 0.2 + 5));
    chancesOfFiftyHundred = `${fiftyChance}% / ${hundredChance}%`;
    wicketProbability = `${Math.max(10, Math.round(100 - player.liveMetrics.pressureHandling))}%`;
    predictedFinalImpact = player.liveMetrics.matchImpact > 85 ? "High" : "Medium";
    aiSuggestedRole = player.stats.strikeRate > 170 ? "Impact Powerplay Dominator" : "Innings Controller Shield";
    commentary = `${player.name} is picking gaps beautifully with a solid ${player.stats.strikeRate} strike rate. Their poise under ${player.pressureSituation}-pressure conditions keeps the fielders on maximum alert.`;
    tactics = "Over-pitch wide outside off-stump to force a lofty aerial slide; place a deep third-man cover fielder.";
    quote = "Shifting gears smoothly as the target begins to materialize.";
  }

  const calculatedPoints = calculateFantasyPoints(player.stats, player.role) + Math.round(player.liveMetrics.performanceMeter * 0.4);

  const insight: AIInsight = {
    playerId,
    timestamp: new Date().toLocaleTimeString(),
    generalCommentary: commentary,
    tacticalRecommendation: tactics,
    momentumShiftQuote: quote
  };

  const prediction: AIPrediction = {
    expectedRuns,
    chancesOfFiftyHundred,
    wicketProbability,
    predictedFinalImpact,
    fantasyPointsPrediction: calculatedPoints,
    aiSuggestedRole
  };

  res.json({ insight, prediction });
});

// ------------------------------------------------------------------
// Production/Development Mode Router Configurations
// ------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode mounting Vite dev middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production client bundle static serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cricket IQ Server powered by Google GenAI live on http://localhost:${PORT}`);
  });
}

startServer();
