
import React from 'react';

export enum GamePhase {
  IDLE = 'IDLE',
  BETTING = 'BETTING',
  FLYING = 'FLYING',
  CRASHED = 'CRASHED',
}

export type GameMode = 'ORANGE' | 'FOOTBALL' | 'GOLF' | 'SANTA' | 'BEE' | 'SPACE' | 'CARPET' | 'CANCER' | 'AFCON' | 'USA' | 'MEXICO' | 'CANADA' | 'CUSTOM';

export interface CustomTheme {
    id: string;
    name: string;
    backgroundImage: string; // Data URL
    slogan?: string;
    createdAt: number;
}

export interface Bet {
  amount: number;
  cashedOut: boolean;
  cashOutMultiplier: number | null;
  autoCashOutAt?: number;
}

export interface HistoryItem {
  multiplier: number;
  id: number;
}

export interface UserBetHistoryItem {
  id: number;
  amount: number;
  cashedOut: boolean;
  cashOutMultiplier: number | null;
  crashMultiplier: number;
  timestamp: number;
  mode?: GameMode;
}

export interface BabaTip {
  text: string;
  timestamp: number;
}

export interface BotPlayer {
  id: string;
  name: string;
  betAmount: number;
  cashedOut: boolean;
  targetMultiplier: number;
  cashOutMultiplier?: number;
}

export interface ChatMessage {
  id: number;
  user: string;
  text: string;
  timestamp: number;
}

export interface BoozItem {
    id: string;
    name: string;
    price: number;
    description: string;
}

export interface MarketItem {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: React.ReactNode;
    category: 'BOOZ' | 'LUCK' | 'FLEX' | 'WEATHER';
    weatherPairing?: WeatherType;
}

export type WeatherType = 'SUNNY' | 'RAINY' | 'WINDY' | 'SNOW';

// Auto Betting Types
export type AutoAction = 'RESET' | 'INCREASE';

export interface AutoBetSettings {
  baseBet: number;
  autoCashOut: number;
  rounds: number;
  onWin: AutoAction;
  onWinPercent: number;
  onLoss: AutoAction;
  onLossPercent: number;
}

export interface AutoBetState {
    isActive: boolean;
    roundsRemaining: number;
    currentBetAmount: number;
    config: AutoBetSettings;
}

// Farm & Politics Types
export interface FarmStats {
  cows: number;
  land: number;
  tractors: number;
  chickens: number;
  burgers: number;
  pizza: number;
}

export interface PoliticalFigure {
  id: string;
  name: string;
  role: string;
  mood: 'Happy' | 'Neutral' | 'Angry' | 'Hungry' | 'Loyal' | 'Greedy' | 'Worried';
  avatar: string;
}

export interface PoliticalEvent {
  id: string;
  title: string;
  description: string;
  type: 'TAX' | 'SUBSIDY' | 'STRIKE' | 'BOOST' | 'CORRUPTION' | 'NONE' | 'SUPERNATURAL' | 'BETRAYAL' | 'HUSTLER';
  duration: number; // rounds remaining
  cost?: number; // Cost to resolve (bribery)
  expiryTime?: number; // timestamp when event auto-fails/expires
}

// Football Sim Types
export interface FootballPlayer {
  id: string;
  name: string;
  position: 'FW' | 'MF' | 'DF' | 'GK';
  attack: number;
  defense: number;
  stamina: number;
  isInternational: boolean;
  value: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export type Tactic = 'ATTACK' | 'DEFENSE' | 'BALANCED';

export type Formation = '1-2-1' | '2-2' | '1-1-2' | '3-1';

export interface MatchEvent {
  id: number;
  minute: number;
  type: 'GOAL' | 'MISS' | 'CORNER' | 'CARD' | 'WHISTLE';
  description: string;
  team: 'HOME' | 'AWAY';
}
