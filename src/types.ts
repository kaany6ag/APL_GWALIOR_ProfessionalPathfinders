/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlayerStats {
  runs: number;
  balls: number;
  strikeRate: number;
  wickets: number;
  oversCount: number;
  economy: number;
  fours: number;
  sixes: number;
  catches: number;
}

export interface LiveMetrics {
  performanceMeter: number; // 0 - 100
  matchImpact: number; // 0 - 100
  pressureHandling: number; // 0 - 100
  momentumContribution: number; // -50 to +50
  confidenceIndicator: 'Peak' | 'Strong' | 'Moderate' | 'Shaky' | 'Critical';
}

export interface Cricketer {
  id: string;
  name: string;
  team: string;
  role: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';
  imageUrl: string;
  isTrending?: boolean;
  matchPhase: 'Powerplay' | 'Middle' | 'Death';
  pressureSituation: 'Low' | 'Medium' | 'High';
  stats: PlayerStats;
  liveMetrics: LiveMetrics;
  wagonWheel: { angle: number; distance: number; value: number }[]; // angle in degrees 0-360, distance 0-100%
  momentumTimeline: { over: number; momentum: number; description: string }[];
}

export interface AIPrediction {
  expectedRuns: number | string;
  chancesOfFiftyHundred: string; // e.g. "72% / 18%"
  wicketProbability: string; // e.g. "24%"
  predictedFinalImpact: 'High' | 'Medium' | 'Low';
  fantasyPointsPrediction: number;
  aiSuggestedRole: string;
}

export interface AIInsight {
  playerId: string;
  timestamp: string;
  generalCommentary: string;
  tacticalRecommendation: string;
  momentumShiftQuote: string;
}

export interface LiveMatchData {
  battingTeam: string;
  bowlingTeam: string;
  score: string; // e.g. "172/4"
  overs: string; // e.g. "18.2"
  requiredRunRate: number;
  currentRunRate: number;
  partnership: {
    batsman1: string;
    batsman1Runs: number;
    batsman1Balls: number;
    batsman2: string;
    batsman2Runs: number;
    batsman2Balls: number;
    totalRuns: number;
    totalBalls: number;
  };
  momentumHistory: { ball: string; score: number }[];
}

export interface FanPoll {
  question: string;
  options: { text: string; votes: number; id: string }[];
  totalVotes: number;
  userVotedOptionId?: string;
}

export interface MVPRanking {
  playerId: string;
  playerName: string;
  team: string;
  score: number;
  ranking: number;
}
