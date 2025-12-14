
import React, { useState, useEffect, useRef } from 'react';
import { FootballPlayer, Tactic, MatchEvent, Formation } from '../types';
import { ArrowLeft, Play, Shield, Sword, Activity, Trophy, Clock, Users, Timer, AlertCircle, ListOrdered, Coins, Mic2, ShoppingBag, DollarSign, UserPlus, TrendingUp, Star, Pause, Repeat, MessageCircle, ThumbsUp, ThumbsDown, Megaphone, Ticket, ShieldHalf, LayoutGrid, Skull, Gavel, Handshake, EyeOff, GraduationCap, BookOpen, Triangle, ChevronDown, ChevronUp, Flag, MapPin, Calendar, CheckCircle2, Plane, MonitorPlay, ArrowUp, ArrowDown, Smile, Frown, Briefcase, Radio, HandCoins, Newspaper, Volume2, StopCircle, Rocket, Zap, Globe, Crown, Dumbbell, BarChart3, Lock, Target, MoveLeft, MoveRight, Circle, Banknote, Building2, X, Copy, Bitcoin, Smartphone, QrCode, PlusCircle, Armchair, Hammer, Shirt, Palette, Sun, Flame, Check } from 'lucide-react';
import { audioService } from '../services/audioService';

interface FootballSimProps {
  onBack: () => void;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  isLightMode?: boolean;
}

interface LeagueTeam {
    id: string;
    name: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    points: number;
    color: string;
    strength: number; // 0-100, determines AI simulation win chance
    fans: number;
}

interface TeamSkin {
    id: string;
    name: string;
    description: string;
    class: string;
    cost: number;
    textColor?: string;
}

const TEAM_SKINS: TeamSkin[] = [
    { id: 'default', name: 'Baba FC Original', description: 'The classic orange look.', class: 'bg-orange-500', cost: 0 },
    { id: 'inter', name: 'Milano Stripe', description: 'Blue & Black stripes.', class: 'bg-[repeating-linear-gradient(90deg,#1e3a8a,#1e3a8a_10px,#000000_10px,#000000_20px)]', cost: 500 },
    { id: 'arsenal', name: 'Gunners Red', description: 'Red body, white sleeves.', class: 'bg-red-600 border-x-4 border-white', cost: 500 },
    { id: 'tanzania', name: 'Taifa Stars', description: 'Flag of Tanzania.', class: 'bg-[linear-gradient(135deg,#1eb53a_30%,#fcd116_30%,#fcd116_35%,#000000_35%,#000000_65%,#fcd116_65%,#fcd116_70%,#00a3dd_70%)]', cost: 800 },
    { id: 'senegal', name: 'Lions of Teranga', description: 'Flag of Senegal.', class: 'bg-[linear-gradient(90deg,#00853f_33%,#fdef42_33%,#fdef42_66%,#e31b23_66%)]', cost: 800, textColor: 'text-black' },
    { id: 'tunisia', name: 'Carthage Eagles', description: 'Red with white emblem.', class: 'bg-red-700 ring-4 ring-inset ring-white', cost: 600 },
    { id: 'zebra', name: 'Juve Stripe', description: 'Black & White stripes.', class: 'bg-[repeating-linear-gradient(90deg,#ffffff,#ffffff_10px,#000000_10px,#000000_20px)]', cost: 700, textColor: 'text-black' },
    { id: 'mancity', name: 'Sky Blue', description: 'Dominant blue.', class: 'bg-sky-400', cost: 900, textColor: 'text-white' },
    { id: 'madrid', name: 'Royal White', description: 'Pure white class.', class: 'bg-white border-2 border-slate-200', cost: 1000, textColor: 'text-slate-900' },
    { id: 'brazil', name: 'Samba Gold', description: 'Yellow & Green.', class: 'bg-yellow-400 border-b-4 border-green-600', cost: 1200, textColor: 'text-green-900' },
    { id: 'argentina', name: 'Albiceleste', description: 'Sky Blue & White.', class: 'bg-[repeating-linear-gradient(90deg,#7dd3fc,#7dd3fc_10px,#ffffff_10px,#ffffff_20px)]', cost: 1200, textColor: 'text-slate-900' },
    { id: 'nigeria', name: 'Super Eagles', description: 'Patterned Green.', class: 'bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-green-600 via-green-400 to-white', cost: 800 },
];

interface SpecialEvent {
    type: 'FIGHT' | 'SCANDAL';
    title: string;
    description: string;
    financialImpact: number;
    fanImpact: number;
}

interface TransferOffer {
    id: string;
    playerId: string;
    playerName: string;
    offeringTeam: string;
    amount: number;
    timestamp: number;
}

interface Sponsor {
    id: string;
    name: string;
    incomePerMatch: number;
    requiredFans: number;
    description: string;
    color: string;
}

interface TvDeal {
    id: string;
    name: string;
    incomePerMatch: number;
    requiredFans: number;
}

interface TrainingDrill {
    id: string;
    name: string;
    category: 'PHYSICAL' | 'TECHNICAL' | 'TACTICAL';
    duration: number; // in ticks
    description: string;
    icon: React.ReactNode;
}

interface LiveBet {
    id: string;
    type: 'GOAL_HOME' | 'GOAL_AWAY' | 'CORNER' | 'CARD' | 'PENALTY';
    label: string;
    amount: number;
    odds: number;
    timestamp: number;
}

// STADIUM LEVELS - UPDATED WITH CHEAPER PRICES AND HIGHER CAP
const STADIUM_LEVELS = [
    { level: 1, name: "Muddy Field", capacity: 1000, cost: 0, seatColor: "transparent" },
    { level: 2, name: "Community Park", capacity: 5000, cost: 500, seatColor: "#9ca3af" }, // Cheap entry
    { level: 3, name: "District Stadium", capacity: 25000, cost: 2500, seatColor: "#ea580c" }, // Affordable mid-tier
    { level: 4, name: "Pro Arena", capacity: 60000, cost: 10000, seatColor: "#dc2626" }, // Pro level
    { level: 5, name: "National Dome", capacity: 120000, cost: 40000, seatColor: "#2563eb" }, // Big time
    { level: 6, name: "Mega Bowl", capacity: 300000, cost: 100000, seatColor: "#7c3aed" }, // Huge
    { level: 7, name: "Baba Colosseum", capacity: 600000, cost: 250000, seatColor: "#eab308" }, // Legendary
    { level: 8, name: "Galactic Citadel", capacity: 1000000, cost: 500000, seatColor: "#ec4899" }, // God Tier
];

type SimMode = 'LEAGUE' | 'WORLD_CUP' | 'AFCON' | 'EURO' | 'ASIAN' | 'COPA';
type WorldCupRound = 'RO32' | 'RO16' | 'QF' | 'SF' | 'FINAL' | 'CHAMPION';

interface WorldCupMatch {
    id: string;
    home: string;
    away: string;
    winner?: string;
    score?: { home: number, away: number };
    played: boolean;
    isUserMatch: boolean;
}

const COUNTRIES = [
    "Neo Brazil", "Mecha Germany", "Cyber France", "Argentina 3000", "Robo England", "Spain Prime", 
    "Italy X", "Nether-Bots", "Portugal UI", "Belgium v2", "Croatia OS", "Uruguay Star", 
    "Laser Japan", "Korea Nexus", "USA Force", "Mexico Sun", "Senegal Lion", "Morocco Atlas", 
    "Nigeria Eagle", "Egypt Pharaoh", "Iran Core", "Saudi Oil", "Aussie Roo", "Colombia Gold", 
    "Chile Fire", "Peru Inca", "Sweden Ice", "Poland Steel", "Ukraine Sky", "Turkey Moon", "Canada Leaf"
];

const AFCON_COUNTRIES = [
    "Egypt Pharaohs", "Senegal Lions", "Nigeria Super Eagles", "Morocco Atlas", "Algeria Fennecs", 
    "Cameroon Lions", "Ghana Black Stars", "Ivory Coast Elephants", "Tunisia Eagles", "Mali Eagles", 
    "Burkina Faso Stallions", "South Africa Bafana", "DR Congo Leopards", "Guinea Elephants", "Zambia Bullets",
    "Gabon Panthers", "Equatorial Guinea Thunder", "Cape Verde Sharks", "Angola Antelopes", "Tanzania Stars",
    "Uganda Cranes", "Kenya Harambee", "Zimbabwe Warriors", "Namibia Braves", "Mozambique Mambas",
    "Guinea-Bissau Djurtus", "Mauritania Mourabitounes", "Gambia Scorpions", "Sierra Leone Stars", "Sudan Falcons",
    "Ethiopia Walya"
];

const EURO_COUNTRIES = [
    "France Cyber", "Germany Mech", "England Prime", "Spain Solar", "Italy Nexus", "Portugal Star", 
    "Netherlands Flux", "Belgium Core", "Croatia Web", "Denmark Viking", "Sweden Frost", "Norway Thunder", 
    "Poland Steel", "Ukraine Sky", "Turkey Moon", "Greece Titan", "Serbia Iron", "Switzerland Bank", 
    "Austria Alps", "Scotland High", "Wales Dragon", "Ireland Clover", "Czech Crystal", "Hungary Magypunk", 
    "Romania Vamp", "Bulgaria Rose", "Slovakia Tatra", "Slovenia Lake", "Finland Ice", "Iceland Lava", 
    "Albania Eagle", "Georgia Knight"
];

const ASIAN_COUNTRIES = [
    "Japan Neon", "Korea Zenith", "Saudi Oil-Tech", "Iran Persia", "Australia Reef", "Qatar Pearl", 
    "UAE Sky", "Iraq Babylon", "Uzbekistan Silk", "China Dragon", "India Tiger", "Thailand Elephant", 
    "Vietnam Star", "Indonesia Garuda", "Malaysia Tiger", "Jordan Petra", "Bahrain Pearl", "Oman Dhow", 
    "Syria Eagle", "Lebanon Cedar", "Palestine Olive", "Kuwait Blue", "Tajik Crown", "Kyrgyz Hawk", 
    "Turkmen Horse", "Hong Kong Harbour", "Singapore Lion", "Philippines Sun", "Yemen Fort", "North Korea Wall", 
    "Myanmar Gem", "Afghanistan Peak"
];

const COPA_COUNTRIES = [
    "Brazil Samba", "Argentina Sol", "Uruguay Sun", "Colombia Coffee", "Chile Condor", "Peru Inca", 
    "Ecuador Equator", "Paraguay Guarani", "Venezuela Oil", "Bolivia High", "USA Liberty", "Mexico Aztec", 
    "Canada Leaf", "Costa Rica Pure", "Panama Canal", "Jamaica Bolt", "Honduras Maya", "El Salvador Volcano", 
    "Guatemala Quetzal", "Trinidad Steel", "Haiti Voodoo", "Suriname Forest", "Guyana Water", "Cuba Havana", 
    "Dominican Beach", "Puerto Rico Star", "Curacao Blue", "Martinique Flower", "Guadeloupe Lily", "French Guiana Rocket", 
    "Belize Reef", "Nicaragua Lake"
];

const AD_BANNERS = [
    { text: "BABA FERTILIZER - GROW BIG", color: "text-amber-400" },
    { text: "BETKING GLOBAL - 100% ODDS", color: "text-blue-400" },
    { text: "VISIT WAKANDA", color: "text-purple-400" },
    { text: "YOUR BRAND HERE - CALL BABA", color: "text-white bg-red-600 px-2 rounded animate-pulse" },
    { text: "FLY BABA AIRLINES", color: "text-sky-400" },
    { text: "EAT MORE CHICKEN", color: "text-yellow-200" },
    { text: "NO REFUNDS INC.", color: "text-red-500" },
    { text: "INVEST IN COWS TODAY", color: "text-green-400" },
    { text: "SPEEDY JOE LOGISTICS", color: "text-orange-400" },
    { text: "BUY PRO LAPTOP", color: "text-slate-300" }
];

function CrosshairIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="10" />
            <line x1="22" y1="12" x2="18" y2="12" />
            <line x1="6" y1="12" x2="2" y2="12" />
            <line x1="12" y1="6" x2="12" y2="2" />
            <line x1="12" y1="22" x2="12" y2="18" />
        </svg>
    )
}

const DRILLS: TrainingDrill[] = [
    { id: 'sprint', name: 'Hill Sprints', category: 'PHYSICAL', duration: 30, description: 'Boosts team stamina and pace.', icon: <Zap className="w-5 h-5 text-yellow-400" /> },
    { id: 'strength', name: 'Tractor Pull', category: 'PHYSICAL', duration: 40, description: 'Increases physical dominance.', icon: <Dumbbell className="w-5 h-5 text-red-400" /> },
    { id: 'rondo', name: 'Rondo', category: 'TECHNICAL', duration: 35, description: 'Improves passing accuracy.', icon: <Activity className="w-5 h-5 text-blue-400" /> },
    { id: 'shooting', name: 'Target Practice', category: 'TECHNICAL', duration: 30, description: 'Increases goal conversion rate.', icon: <CrosshairIcon className="w-5 h-5 text-green-400" /> },
    { id: 'press', name: 'Gegenpress', category: 'TACTICAL', duration: 50, description: 'Boosts ball recovery.', icon: <Shield className="w-5 h-5 text-purple-400" /> },
    { id: 'shape', name: 'Defensive Shape', category: 'TACTICAL', duration: 45, description: 'Reduces opponent chances.', icon: <LayoutGrid className="w-5 h-5 text-orange-400" /> },
];

const INITIAL_SQUAD: FootballPlayer[] = [
  { id: '1', name: 'Baba (C)', position: 'FW', attack: 95, defense: 30, stamina: 80, isInternational: false, value: 5000, rarity: 'LEGENDARY' },
  { id: '2', name: 'Speedy Joe', position: 'FW', attack: 85, defense: 20, stamina: 90, isInternational: false, value: 2000, rarity: 'RARE' },
  { id: '3', name: 'The Wall', position: 'DF', attack: 20, defense: 95, stamina: 70, isInternational: false, value: 2500, rarity: 'RARE' },
  { id: '4', name: 'Midfield Maestro', position: 'MF', attack: 70, defense: 70, stamina: 85, isInternational: false, value: 1800, rarity: 'RARE' },
  { id: '5', name: 'Safe Hands', position: 'GK', attack: 10, defense: 90, stamina: 60, isInternational: false, value: 1500, rarity: 'COMMON' },
  { id: '6', name: 'Rookie Ray', position: 'MF', attack: 50, defense: 50, stamina: 95, isInternational: false, value: 500, rarity: 'COMMON' },
  { id: '7', name: 'Veteran Vic', position: 'DF', attack: 30, defense: 80, stamina: 40, isInternational: false, value: 800, rarity: 'COMMON' },
  { id: '8', name: 'Super Sub', position: 'FW', attack: 80, defense: 30, stamina: 100, isInternational: true, value: 3000, rarity: 'RARE' }, 
];

const PARODY_TEAMS = [
    { id: 't1', name: 'Man Red', color: 'bg-red-600', strength: 90, fans: 50000 },
    { id: 't2', name: 'Man Blue', color: 'bg-sky-500', strength: 95, fans: 45000 },
    { id: 't3', name: 'Arse-nal', color: 'bg-red-500', strength: 88, fans: 40000 },
    { id: 't4', name: 'Liver Pool', color: 'bg-red-700', strength: 92, fans: 48000 },
    { id: 't5', name: 'East Ham', color: 'bg-fuchsia-800', strength: 75, fans: 20000 },
    { id: 't6', name: 'Totten Ham', color: 'bg-white text-slate-900', strength: 80, fans: 25000 },
    { id: 't7', name: 'Chels Sea', color: 'bg-blue-700', strength: 85, fans: 35000 },
    { id: 't8', name: 'New Castle', color: 'bg-slate-800', strength: 82, fans: 30000 },
    { id: 't9', name: 'Villa Aston', color: 'bg-fuchsia-900', strength: 78, fans: 18000 },
];

const TEAM_LOCATIONS: Record<string, string> = {
    't1': 'Manchester',
    't2': 'Manchester',
    't3': 'London',
    't4': 'Liverpool',
    't5': 'London',
    't6': 'London',
    't7': 'London',
    't8': 'Newcastle',
    't9': 'Birmingham'
};

const MARKET_STARS = [
    { name: 'Mboppi', position: 'FW', attack: 98, defense: 40, price: 50000, rarity: 'LEGENDARY' },
    { name: 'Messy', position: 'MF', attack: 99, defense: 35, price: 60000, rarity: 'LEGENDARY' },
    { name: 'Ronny', position: 'FW', attack: 97, defense: 45, price: 45000, rarity: 'LEGENDARY' },
    { name: 'Halam', position: 'FW', attack: 99, defense: 50, price: 55000, rarity: 'LEGENDARY' },
    { name: 'Viny Jr', position: 'FW', attack: 94, defense: 30, price: 35000, rarity: 'EPIC' },
    { name: 'De Broyne', position: 'MF', attack: 95, defense: 60, price: 38000, rarity: 'EPIC' },
    { name: 'Van Dike', position: 'DF', attack: 40, defense: 99, price: 40000, rarity: 'EPIC' },
    { name: 'Sallah', position: 'FW', attack: 96, defense: 35, price: 39000, rarity: 'EPIC' },
    { name: 'Kane', position: 'FW', attack: 95, defense: 40, price: 32000, rarity: 'EPIC' },
    { name: 'Nymar', position: 'FW', attack: 93, defense: 25, price: 28000, rarity: 'EPIC' },
    { name: 'Sonny', position: 'FW', attack: 92, defense: 40, price: 25000, rarity: 'RARE' },
    { name: 'Modrich', position: 'MF', attack: 88, defense: 70, price: 15000, rarity: 'RARE' },
    { name: 'Alisson', position: 'GK', attack: 10, defense: 98, price: 20000, rarity: 'EPIC' },
    { name: 'Courtois', position: 'GK', attack: 10, defense: 97, price: 18000, rarity: 'EPIC' },
    { name: 'Magwire', position: 'DF', attack: 50, defense: 75, price: 5000, rarity: 'COMMON' },
    { name: 'Onana', position: 'GK', attack: 10, defense: 82, price: 8000, rarity: 'COMMON' },
];

const SPONSORS: Sponsor[] = [
    { id: 's1', name: "Joe's Fertilizers", incomePerMatch: 10, requiredFans: 0, description: "Local manure shop.", color: "text-amber-600" },
    { id: 's2', name: "Super Tractors", incomePerMatch: 50, requiredFans: 1000, description: "Heavy machinery for heavy players.", color: "text-blue-500" },
    { id: 's3', name: "BetKing Global", incomePerMatch: 250, requiredFans: 5000, description: "Official betting partner.", color: "text-green-500" },
    { id: 's4', name: "Fly Baba Airlines", incomePerMatch: 1000, requiredFans: 20000, description: "Premier travel partner.", color: "text-purple-500" }
];

const TV_DEALS: TvDeal[] = [
    { id: 'tv1', name: "Community Radio", incomePerMatch: 5, requiredFans: 0 },
    { id: 'tv2', name: "Channel 4 Local", incomePerMatch: 40, requiredFans: 1500 },
    { id: 'tv3', name: "SportMax HD", incomePerMatch: 150, requiredFans: 8000 },
    { id: 'tv4', name: "Global Satellite", incomePerMatch: 500, requiredFans: 25000 }
];

const COMMENTARY_PHRASES = [
    "They don't come as fiercely contested than this!",
    "BABA!",
    "He's hit that with the force of a tractor!",
    "Absolute scenes at the farm!",
    "The referee needs glasses, honestly.",
    "Tiki-taka? More like Tika-Tractor.",
    "End to end stuff here!",
    "The manager is eating an orange on the sidelines.",
    "Schoolboy defending!",
    "Magisterial! Mercurial! Magnificent!",
    "Can they do it on a rainy night in the field?",
    "That's a cynical foul!",
    "Top bins!",
    "Unbelievable Jeff!",
    "Parking the bus... or the harvester?",
    "A game of two halves, literally.",
    "Look at the pace on Speedy Joe!",
    "The Wall is standing tall today.",
];

const WC_COMMENTARY_PHRASES = [
    "Laser-guided pass!",
    "The cyber-ref is checking the hologram.",
    "Goal for Republic of Baba!",
    "This is 2050 football!",
    "Jetpack save by the keeper!",
    "The neon pitch is slippery today.",
    "Calculating trajectory... GOAL!",
    "What a strike from the future!",
    "The android crowd goes wild!",
    "Maximum overdrive activated!"
];

const AFCON_COMMENTARY_PHRASES = [
    "The drums are beating!",
    "Pure African magic!",
    "He danced past the defender!",
    "The Vuvuzelas are deafening!",
    "This is for the continent!",
    "What a strike! Mama Africa is watching!",
    "The Lions are roaring tonight!",
    "Absolute thunderbolt!",
    "Skill, pace, and power!",
    "The stadium is shaking!"
];

const PRE_MATCH_QUOTES = [
    "The pundits are predicting a tough battle in midfield.",
    "Local reports suggest the pitch is in terrible condition.",
    "The opposition manager has been talking trash in the press.",
    "Baba FC fans are traveling in numbers today!",
    "It's a perfect day for football, or farming.",
    "Tactical analysis: Watch out for their counter-attacks."
];

const FAN_REACTIONS = {
    WIN: [
        "BUILD THE STATUE! 🗿",
        "We are winning the league! 🚜🏆",
        "Mboppi who? I only know Baba.",
        "Farmers league? We OWN the farm!",
        "Tactical masterclass from the boss.",
        "Give him a lifetime contract!",
        "My goat 🐐"
    ],
    DRAW: [
        "Boring match. I want my money back.",
        "A point is a point, I guess.",
        "Referee was biased against us.",
        "We need to sign a striker in January.",
        "Not great, not terrible."
    ],
    LOSS: [
        "BABA OUT! 😡",
        "Sack everyone.",
        "My grandmother defends better than this.",
        "Liquidate the club immediately.",
        "Fraud watch.",
        "I'm tired Robbie...",
        "Why do I support this team? 😭"
    ]
};

const MATCH_COST = 50;
const MATCH_WIN_PRIZE = 100;
const BRIBE_COST = 200;
const WC_ENTRY_COST = 5000;
const AFCON_ENTRY_COST = 3000;
const EURO_ENTRY_COST = 4500;
const ASIAN_ENTRY_COST = 3000;
const COPA_ENTRY_COST = 3500;

// HELPER COMPONENTS

const TeamLogo: React.FC<{ name: string; color: string; size: 'sm' | 'md' | 'lg', textColor?: string }> = ({ name, color, size, textColor }) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2);
    const sizeClasses = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'md' ? 'w-12 h-12 text-lg' : 'w-8 h-8 text-xs';
    
    return (
        <div className={`${sizeClasses} ${color} rounded-full flex items-center justify-center font-black ${textColor || 'text-white'} shadow-lg border-2 border-white/20 relative overflow-hidden`}>
            {/* Gloss effect */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-full pointer-events-none"></div>
            <span className="relative z-10">{initials}</span>
        </div>
    );
};

const PlayerCard: React.FC<{ 
    player: FootballPlayer; 
    actionLabel?: string; 
    actionPrice?: number;
    onAction?: () => void; 
    disabled?: boolean;
    selected?: boolean;
    hidePrice?: boolean;
    compact?: boolean;
    isLightMode?: boolean;
}> = ({ player, actionLabel, actionPrice, onAction, disabled, selected, hidePrice, compact, isLightMode }) => {
    
    const getRarityColor = (rarity: string) => {
        if (rarity === 'LEGENDARY') return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
        if (rarity === 'EPIC') return 'bg-purple-500/20 border-purple-500 text-purple-400';
        if (rarity === 'RARE') return 'bg-blue-500/20 border-blue-500 text-blue-400';
        return isLightMode ? 'bg-gray-100 border-gray-300 text-gray-500' : 'bg-slate-500/20 border-slate-500 text-slate-400';
    };

    const rarityClass = getRarityColor(player.rarity);
    const avgStat = Math.round((player.attack + player.defense) / 2);
    
    const cardBg = isLightMode 
        ? (selected ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500 shadow-md' : 'bg-white border-gray-300 hover:border-orange-300 hover:shadow-sm') 
        : (selected ? 'bg-orange-500/20 border-orange-500 ring-1 ring-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-slate-800 border-slate-700 hover:border-slate-500');

    const textColor = isLightMode ? 'text-black' : 'text-white';
    const subTextColor = isLightMode ? 'text-gray-500' : 'text-slate-400';
    const badgeBg = isLightMode ? 'bg-gray-200 text-black' : 'bg-slate-700 text-white';

    return (
        <div className={`relative p-2 rounded-xl border transition-all duration-200 ${cardBg}`}>
            {selected && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-0.5 shadow-md z-10">
                    <Check className="w-3 h-3" />
                </div>
            )}
            
            <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-2">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-sm ${badgeBg} ${player.position === 'GK' ? 'text-yellow-500' : player.position === 'FW' ? 'text-red-500' : player.position === 'MF' ? 'text-blue-500' : 'text-green-500'}`}>
                         {player.position}
                     </div>
                     <div className="flex flex-col">
                         <div className={`font-bold text-sm leading-tight ${textColor} truncate max-w-[80px]`}>{player.name}</div>
                         <div className="flex items-center gap-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${rarityClass}`}>
                                {player.rarity}
                            </span>
                            {player.isInternational && <div className="text-[8px] bg-red-100 text-red-600 px-1 rounded font-bold uppercase border border-red-200">Intl</div>}
                         </div>
                     </div>
                 </div>
                 <div className={`text-lg font-black italic ${isLightMode ? 'text-gray-300' : 'text-slate-700'}`}>
                     {avgStat}
                 </div>
            </div>
            
            {!compact && (
                <div className="grid grid-cols-3 gap-1 mb-3">
                     <div className={`rounded p-1 text-center border ${isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-slate-900 border-slate-800'}`}>
                         <div className={`text-[8px] uppercase font-bold ${subTextColor}`}>ATT</div>
                         <div className={`text-xs font-mono font-bold ${player.attack > 80 ? 'text-green-500' : textColor}`}>{player.attack}</div>
                     </div>
                     <div className={`rounded p-1 text-center border ${isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-slate-900 border-slate-800'}`}>
                         <div className={`text-[8px] uppercase font-bold ${subTextColor}`}>DEF</div>
                         <div className={`text-xs font-mono font-bold ${player.defense > 80 ? 'text-green-500' : textColor}`}>{player.defense}</div>
                     </div>
                     <div className={`rounded p-1 text-center border ${isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-slate-900 border-slate-800'}`}>
                         <div className={`text-[8px] uppercase font-bold ${subTextColor}`}>STM</div>
                         <div className={`text-xs font-mono font-bold ${player.stamina > 80 ? 'text-blue-500' : player.stamina < 50 ? 'text-red-500' : textColor}`}>{player.stamina}</div>
                     </div>
                </div>
            )}

            {onAction && (
                <button 
                    onClick={onAction}
                    disabled={disabled}
                    className={`w-full py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all shadow-sm ${
                        selected 
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                        : (isLightMode ? 'bg-black hover:bg-gray-800 text-white disabled:bg-gray-200 disabled:text-gray-400' : 'bg-white hover:bg-gray-200 text-black disabled:bg-slate-800 disabled:text-slate-600')
                    }`}
                >
                    {actionLabel || 'Select'} 
                    {!hidePrice && actionPrice && ` ($${actionPrice.toLocaleString()})`}
                </button>
            )}
        </div>
    );
};

export const FootballSim: React.FC<FootballSimProps> = ({ onBack, balance, setBalance, isLightMode }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'SQUAD' | 'LEAGUE' | 'TRANSFERS' | 'ACADEMY' | 'OFFICE'>('SQUAD');
  const [phase, setPhase] = useState<'PRE_MATCH' | 'LIVE' | 'PENALTIES' | 'FULL_TIME'>('PRE_MATCH');
  const [simMode, setSimMode] = useState<SimMode>('LEAGUE');
  
  // League State
  const [leagueTable, setLeagueTable] = useState<LeagueTeam[]>([]);
  const [currentOpponent, setCurrentOpponent] = useState<LeagueTeam | null>(null);
  
  // World Cup 2050 State
  const [wcRound, setWcRound] = useState<WorldCupRound>('RO32');
  const [wcMatches, setWcMatches] = useState<WorldCupMatch[]>([]);
  const [wcTitleWon, setWcTitleWon] = useState(false);

  // Stats
  const [fans, setFans] = useState(500); // Start with 500 fans
  const [stadiumLevel, setStadiumLevel] = useState(1);

  // Skins State
  const [ownedSkins, setOwnedSkins] = useState<string[]>(['default']);
  const [activeSkin, setActiveSkin] = useState('default');

  // Squad & Market State
  const [myPlayers, setMyPlayers] = useState<FootballPlayer[]>(INITIAL_SQUAD);
  const [marketPlayers, setMarketPlayers] = useState<FootballPlayer[]>([]);
  const [selectedSquad, setSelectedSquad] = useState<string[]>(['1', '3', '4', '5', '2']); // Default squad
  const [tactic, setTactic] = useState<Tactic>('BALANCED');
  const [formation, setFormation] = useState<Formation>('1-2-1');
  
  // Office State
  const [activeSponsor, setActiveSponsor] = useState<string | null>('s1');
  const [activeTvDeal, setActiveTvDeal] = useState<string>('tv1');
  const [transferOffers, setTransferOffers] = useState<TransferOffer[]>([]);
  const [showStadiumUpgradeModal, setShowStadiumUpgradeModal] = useState(false);

  // Academy & Training State
  const [trainingLevels, setTrainingLevels] = useState({ PHYSICAL: 1, TECHNICAL: 1, TACTICAL: 1 });
  const [activeDrill, setActiveDrill] = useState<{ id: string, progress: number, max: number } | null>(null);
  const drillInterval = useRef<number | null>(null);

  // Match State
  const [matchTime, setMatchTime] = useState(0);
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [possession, setPossession] = useState(50);
  const [commentary, setCommentary] = useState<string | null>(null);
  
  // Live Betting State
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [showLiveBetting, setShowLiveBetting] = useState(false);

  // Ticket Modal State
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // Penalty State
  const [penaltyState, setPenaltyState] = useState<{
        round: number;
        homeScore: number;
        awayScore: number;
        homeHistory: boolean[];
        awayHistory: boolean[];
        isPlayerTurn: boolean; // true = shooting, false = saving
        kicksTaken: number;
  }>({
        round: 1,
        homeScore: 0,
        awayScore: 0,
        homeHistory: [],
        awayHistory: [],
        isPlayerTurn: true,
        kicksTaken: 0
  });

  // Substitution & Reactions State
  const [isPaused, setIsPaused] = useState(false);
  const [subsUsed, setSubsUsed] = useState(0);
  const [showSubsModal, setShowSubsModal] = useState(false);
  const [subPlayerOut, setSubPlayerOut] = useState<string | null>(null);
  const [matchReactions, setMatchReactions] = useState<string[]>([]);
  const [postMatchActionUsed, setPostMatchActionUsed] = useState(false);
  
  // Coach Section State
  const [coachMood, setCoachMood] = useState<'HAPPY' | 'NEUTRAL' | 'ANGRY'>('NEUTRAL');
  const [varActive, setVarActive] = useState(false);
  const [penaltyActive, setPenaltyActive] = useState(false);
  
  // Events & Cheats
  const [bribeActive, setBribeActive] = useState(false);
  const [specialEvent, setSpecialEvent] = useState<SpecialEvent | null>(null);

  // Betting State
  const [activeBet, setActiveBet] = useState<{ type: string; amount: number; target?: any } | null>(null);

  // Pre-Match Modal State
  const [showPreMatchModal, setShowPreMatchModal] = useState(false);
  const [preMatchComment, setPreMatchComment] = useState("");

  const matchInterval = useRef<number | null>(null);
  
  // --- REFS FOR SIMULATION LOOP ---
  // Using refs to break stale closure in setInterval loop while keeping game interactive
  const gameStatsRef = useRef({
      formation,
      tactic,
      selectedSquad,
      myPlayers,
      currentOpponent,
      bribeActive,
      simMode,
      score,
      activeBet,
      trainingLevels,
      liveBets,
      stadiumLevel,
      fans
  });

  // Sync refs with state
  useEffect(() => {
      gameStatsRef.current = {
          formation,
          tactic,
          selectedSquad,
          myPlayers,
          currentOpponent,
          bribeActive,
          simMode,
          score,
          activeBet,
          trainingLevels,
          liveBets,
          stadiumLevel,
          fans
      };
  }, [formation, tactic, selectedSquad, myPlayers, currentOpponent, bribeActive, simMode, score, activeBet, trainingLevels, liveBets, stadiumLevel, fans]);

  // Helper Functions
  const checkBets = (type: string, team: 'HOME' | 'AWAY') => {
      const currentActiveBet = gameStatsRef.current.activeBet;
      if (currentActiveBet && currentActiveBet.type === type && currentActiveBet.target === team) {
          const multiplier = type === 'GOAL' ? 3 : 2; // Simple odds
          const winnings = currentActiveBet.amount * multiplier;
          setBalance(prev => prev + winnings);
          setCommentary(`BET WON! You won $${winnings}!`);
          audioService.playCashOut();
          setActiveBet(null);
      }
  };

  const placeLiveBet = (type: LiveBet['type'], odds: number, label: string) => {
      const betAmount = 50; // Fixed bet amount for simplicity
      if (balance >= betAmount) {
          setBalance(prev => prev - betAmount);
          const newBet: LiveBet = {
              id: Date.now().toString(),
              type,
              amount: betAmount,
              odds,
              label,
              timestamp: Date.now()
          };
          setLiveBets(prev => [newBet, ...prev]);
          audioService.playBet();
          setCommentary(`Bet Placed: ${label}`);
      }
  };

  const resolveLiveBets = (event: 'GOAL_HOME' | 'GOAL_AWAY' | 'CORNER' | 'CARD') => {
      // Logic:
      // GOAL_HOME wins on Home Goal, loses on Away Goal
      // GOAL_AWAY wins on Away Goal, loses on Home Goal
      // CORNER wins on Corner
      // CARD wins on Card
      
      const { liveBets } = gameStatsRef.current;
      const winners: LiveBet[] = [];
      const losersIds: string[] = [];

      liveBets.forEach(bet => {
          if (bet.type === event) {
              winners.push(bet);
          } else if (
              (bet.type === 'GOAL_HOME' && event === 'GOAL_AWAY') ||
              (bet.type === 'GOAL_AWAY' && event === 'GOAL_HOME')
          ) {
              losersIds.push(bet.id);
          }
      });

      if (winners.length > 0) {
          let totalWinnings = 0;
          winners.forEach(w => totalWinnings += w.amount * w.odds);
          setBalance(prev => prev + totalWinnings);
          audioService.playCashOut();
          setCommentary(`LIVE BET WIN! +$${totalWinnings.toFixed(0)}`);
          
          // Remove winners
          setLiveBets(prev => prev.filter(b => !winners.find(w => w.id === b.id)));
      }

      if (losersIds.length > 0) {
          setLiveBets(prev => prev.filter(b => !losersIds.includes(b.id)));
          audioService.playSplat();
      }
  };

  const calculateMatchStats = (team: LeagueTeam, gf: number, ga: number): LeagueTeam => {
      const won = gf > ga;
      const drawn = gf === ga;
      const lost = gf < ga;
      
      return {
          ...team,
          played: team.played + 1,
          won: team.won + (won ? 1 : 0),
          drawn: team.drawn + (drawn ? 1 : 0),
          lost: team.lost + (lost ? 1 : 0),
          gf: team.gf + gf,
          ga: team.ga + ga,
          points: team.points + (won ? 3 : drawn ? 1 : 0)
      };
  };

  const processLeagueRound = (homeGoals: number, awayGoals: number) => {
      const { currentOpponent } = gameStatsRef.current;
      
      setLeagueTable(prev => {
          let updated = [...prev];
          
          // 1. Update Player Match (Ensure currentOpponent is valid)
          if (currentOpponent) {
              const playerIdx = updated.findIndex(t => t.id === 'player');
              const oppIdx = updated.findIndex(t => t.id === currentOpponent.id);
              
              if (playerIdx !== -1) updated[playerIdx] = calculateMatchStats(updated[playerIdx], homeGoals, awayGoals);
              if (oppIdx !== -1) updated[oppIdx] = calculateMatchStats(updated[oppIdx], awayGoals, homeGoals);
          }

          // 2. Simulate Other Matches
          // Filter out teams that just played (Player & Opponent) to avoid double playing
          const playedIds = ['player', currentOpponent?.id || ''];
          const simTeams = updated.filter(t => !playedIds.includes(t.id));
          const shuffled = simTeams.sort(() => 0.5 - Math.random());

          for (let i = 0; i < shuffled.length; i += 2) {
              if (i + 1 >= shuffled.length) break;
              
              const t1 = shuffled[i];
              const t2 = shuffled[i+1];
              
              const t1Advantage = (t1.strength - t2.strength) / 10;
              const t1Goals = Math.max(0, Math.floor(Math.random() * 3 + t1Advantage));
              const t2Goals = Math.max(0, Math.floor(Math.random() * 3 - t1Advantage));
              
              const t1Index = updated.findIndex(t => t.id === t1.id);
              const t2Index = updated.findIndex(t => t.id === t2.id);
              
              if (t1Index !== -1) updated[t1Index] = calculateMatchStats(updated[t1Index], t1Goals, t2Goals);
              if (t2Index !== -1) updated[t2Index] = calculateMatchStats(updated[t2Index], t2Goals, t1Goals);
          }

          // 3. Sort Table
          return updated.sort((a, b) => {
               if (b.points !== a.points) return b.points - a.points;
               return (b.gf - b.ga) - (a.gf - a.ga);
          });
      });
  };

  const proceedToNextRound = () => {
    // 1. Check if user survived
    const userMatch = wcMatches.find(m => m.isUserMatch);
    // User wins if winner name matches OR user was home and won penalty shootout result (captured in winner field)
    const userWon = userMatch?.winner === 'Republic of Baba';

    if (!userWon) {
        // Eliminated
        setSimMode('LEAGUE');
        setPhase('PRE_MATCH');
        setActiveTab('LEAGUE');
        // Optional: show a toast or alert here, but UI transition makes it clear
        return;
    }

    // 2. Gather Winners
    const winners = wcMatches.map(m => m.winner).filter(w => w !== undefined) as string[];
    
    // 3. Check for Championship
    if (wcRound === 'FINAL') {
        setWcTitleWon(true);
        setPhase('PRE_MATCH');
        setActiveTab('LEAGUE'); // Shows the WC Hub which handles 'wcTitleWon' view
        return;
    }

    // 4. Generate Next Round
    const nextRoundMap: Record<WorldCupRound, WorldCupRound> = {
        'RO32': 'RO16',
        'RO16': 'QF',
        'QF': 'SF',
        'SF': 'FINAL',
        'FINAL': 'CHAMPION',
        'CHAMPION': 'CHAMPION'
    };
    const nextRound = nextRoundMap[wcRound];
    
    // Shuffle winners to create new pairings
    const shuffled = winners.filter(w => w !== 'Republic of Baba').sort(() => 0.5 - Math.random());
    
    const newMatches: WorldCupMatch[] = [];
    
    // User Match
    const userOpponent = shuffled.pop()!;
    newMatches.push({
        id: `wc_${nextRound}_user`,
        home: 'Republic of Baba',
        away: userOpponent,
        played: false,
        isUserMatch: true
    });

    // Rest of matches
    while (shuffled.length >= 2) {
        const home = shuffled.pop()!;
        const away = shuffled.pop()!;
        newMatches.push({
            id: `wc_${nextRound}_${home}_vs_${away}`,
            home,
            away,
            played: false,
            isUserMatch: false
        });
    }

    setWcRound(nextRound);
    setWcMatches(newMatches);
    setPhase('PRE_MATCH');
    setCurrentOpponent(null); // Reset for new selection logic in prepareMatch
    setActiveTab('LEAGUE');
  };

  const startTournament = (mode: SimMode, cost: number, countryList: string[]) => {
    if (balance >= cost) {
        setBalance(prev => prev - cost);
        setSimMode(mode);
        setWcRound('RO32');
        setWcTitleWon(false);
        setActiveTab('LEAGUE');

        const participants = [...countryList].sort(() => 0.5 - Math.random()).slice(0, 31);
        const newMatches: WorldCupMatch[] = [];

        const userOpp = participants.pop()!;
        newMatches.push({
            id: `${mode.toLowerCase()}_user_32`,
            home: 'Republic of Baba',
            away: userOpp,
            played: false,
            isUserMatch: true
        });

        for(let i=0; i<15; i++) {
            newMatches.push({
                id: `${mode.toLowerCase()}_32_${i}`,
                home: participants.pop()!,
                away: participants.pop()!,
                played: false,
                isUserMatch: false
            });
        }
        setWcMatches(newMatches);
        audioService.playCashOut();
        if (mode === 'AFCON') audioService.playVuvuzela();
    }
  };

  const initWorldCup = () => startTournament('WORLD_CUP', WC_ENTRY_COST, COUNTRIES);
  const initAfcon = () => startTournament('AFCON', AFCON_ENTRY_COST, AFCON_COUNTRIES);
  const initEuro = () => startTournament('EURO', EURO_ENTRY_COST, EURO_COUNTRIES);
  const initAsian = () => startTournament('ASIAN', ASIAN_ENTRY_COST, ASIAN_COUNTRIES);
  const initCopa = () => startTournament('COPA', COPA_ENTRY_COST, COPA_COUNTRIES);

  // Initialize League & Market
  useEffect(() => {
      const initLeague = () => {
          const teams: LeagueTeam[] = [
              { id: 'player', name: 'Baba FC', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0, color: 'bg-orange-500', strength: 85, fans: 500 },
              ...PARODY_TEAMS.map(t => ({
                  ...t,
                  played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0
              }))
          ];
          setLeagueTable(teams);
      };

      const initMarket = () => {
          const market = MARKET_STARS.map((star, idx) => ({
              id: `mkt_${idx}`,
              name: star.name,
              position: star.position as any,
              attack: star.attack,
              defense: star.defense,
              stamina: 90,
              isInternational: false,
              value: star.price,
              rarity: star.rarity as any
          }));
          setMarketPlayers(market);
      };

      initLeague();
      initMarket();
  }, []);

  // Monitor match time to end match safely
  useEffect(() => {
      if (matchTime > 90 && phase === 'LIVE') {
          endMatch();
      }
  }, [matchTime, phase]);

  const togglePlayer = (id: string) => {
    if (selectedSquad.includes(id)) {
      setSelectedSquad(prev => prev.filter(p => p !== id));
    } else {
      if (selectedSquad.length < 5) {
        setSelectedSquad(prev => [...prev, id]);
      }
    }
  };

  const buyPlayer = (player: FootballPlayer) => {
      if (balance >= player.value) {
          setBalance(prev => prev - player.value);
          setMyPlayers(prev => [...prev, player]);
          setMarketPlayers(prev => prev.filter(p => p.id !== player.id));
          
          let fanGain = 10;
          if (player.rarity === 'LEGENDARY') fanGain = 2000;
          else if (player.rarity === 'EPIC') fanGain = 800;
          else if (player.rarity === 'RARE') fanGain = 200;
          else fanGain = 50;

          setFans(prev => prev + fanGain);

          audioService.playCashOut(); 
      }
  };

  const buySkin = (skin: TeamSkin) => {
      if (balance >= skin.cost && !ownedSkins.includes(skin.id)) {
          setBalance(prev => prev - skin.cost);
          setOwnedSkins(prev => [...prev, skin.id]);
          audioService.playCashOut();
      }
  };

  const equipSkin = (skinId: string) => {
      if (ownedSkins.includes(skinId)) {
          setActiveSkin(skinId);
          // Update player team color in league table if needed for persistent display
          setLeagueTable(prev => prev.map(t => 
              t.id === 'player' 
              ? { ...t, color: TEAM_SKINS.find(s => s.id === skinId)?.class || t.color }
              : t
          ));
      }
  };

  const buyStadiumUpgrade = () => {
      if (stadiumLevel >= STADIUM_LEVELS.length) return;
      
      const nextLevel = STADIUM_LEVELS[stadiumLevel]; // Current level index is stadiumLevel-1, so next is stadiumLevel
      
      if (balance >= nextLevel.cost) {
          setBalance(prev => prev - nextLevel.cost);
          setStadiumLevel(prev => prev + 1);
          setFans(prev => prev + 1000); // Immediate fan boost
          setShowStadiumUpgradeModal(false);
          audioService.playCashOut();
          // Show fireworks?
      }
  };

  const acceptTransferOffer = (offer: TransferOffer) => {
      setBalance(prev => prev + offer.amount);
      setMyPlayers(prev => prev.filter(p => p.id !== offer.playerId));
      setTransferOffers(prev => prev.filter(o => o.id !== offer.id));
      setSelectedSquad(prev => prev.filter(id => id !== offer.playerId));
      audioService.playCashOut();
  };

  const rejectTransferOffer = (id: string) => {
      setTransferOffers(prev => prev.filter(o => o.id !== id));
  };

  const performPrStunt = (type: 'CHARITY' | 'INTERVIEW') => {
      if (type === 'CHARITY') {
          if (balance >= 500) {
              setBalance(prev => prev - 500);
              setFans(prev => prev + 300);
              audioService.playBet();
          }
      } else if (type === 'INTERVIEW') {
          if (Math.random() > 0.4) {
              setFans(prev => prev + 150);
          } else {
              setFans(prev => Math.max(0, prev - 50));
          }
      }
  };

  // --- TRAINING LOGIC ---
  const startDrill = (drill: TrainingDrill) => {
      if (activeDrill) return;
      setActiveDrill({ id: drill.id, progress: 0, max: drill.duration });
      
      drillInterval.current = window.setInterval(() => {
          setActiveDrill(prev => {
              if (!prev) return null;
              if (prev.progress >= prev.max) {
                  // Drill Complete
                  completeDrill(drill);
                  return null;
              }
              return { ...prev, progress: prev.progress + 1 };
          });
      }, 50); // Fast updates for smooth bar
  };

  const completeDrill = (drill: TrainingDrill) => {
      if (drillInterval.current) clearInterval(drillInterval.current);
      setTrainingLevels(prev => ({
          ...prev,
          [drill.category]: Math.min(10, prev[drill.category] + 1)
      }));
      audioService.playCashOut(); // Success sound
  };

  const getNextOpponent = () => {
      const randomIdx = Math.floor(Math.random() * PARODY_TEAMS.length);
      const oppData = PARODY_TEAMS[randomIdx];
      return leagueTable.find(t => t.id === oppData.id) || leagueTable[1];
  };

  const prepareMatch = () => {
    if (selectedSquad.length !== 5) return;
    
    const isTournament = simMode !== 'LEAGUE';
    const totalCost = isTournament ? 0 : MATCH_COST + (bribeActive ? BRIBE_COST : 0);
    if (balance < totalCost) return;

    if (isTournament) {
        const userMatch = wcMatches.find(m => m.isUserMatch && !m.played);
        if (userMatch) {
            const oppName = userMatch.home === 'Republic of Baba' ? userMatch.away : userMatch.home;
            const wcOpponent: LeagueTeam = {
                id: `${simMode.toLowerCase()}_opp_${oppName}`,
                name: oppName,
                played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0,
                color: simMode === 'AFCON' ? 'bg-yellow-600' : simMode === 'EURO' ? 'bg-blue-600' : simMode === 'ASIAN' ? 'bg-red-600' : simMode === 'COPA' ? 'bg-yellow-500' : 'bg-cyan-600',
                strength: 85 + (wcRound === 'RO32' ? 0 : wcRound === 'RO16' ? 5 : wcRound === 'QF' ? 8 : wcRound === 'SF' ? 10 : 15),
                fans: 0
            };
            setCurrentOpponent(wcOpponent);
        }
    } else {
        const opponent = getNextOpponent();
        setCurrentOpponent(opponent);
    }
    
    setPreMatchComment(PRE_MATCH_QUOTES[Math.floor(Math.random() * PRE_MATCH_QUOTES.length)]);
    setShowPreMatchModal(true);
  };

  const confirmMatchStart = () => {
    const isTournament = simMode !== 'LEAGUE';
    const totalCost = isTournament ? 0 : MATCH_COST + (bribeActive ? BRIBE_COST : 0);
    if (balance < totalCost) {
        setShowPreMatchModal(false);
        return;
    }

    setBalance(prev => prev - totalCost);
    setShowPreMatchModal(false);

    setPhase('LIVE');
    setMatchTime(0);
    setScore({ home: 0, away: 0 });
    setEvents([]);
    setLiveBets([]); // Reset live bets
    setShowLiveBetting(false);
    setSubsUsed(0);
    setIsPaused(false);
    setShowSubsModal(false);
    setPostMatchActionUsed(false);
    setSpecialEvent(null);
    setCoachMood('NEUTRAL');
    setVarActive(false);
    setPenaltyActive(false);
    setCommentary("And we are LIVE! The whistle blows.");
    audioService.startEngine();
    if (simMode === 'AFCON') audioService.playVuvuzela();
    else audioService.playWhistle();
    
    matchInterval.current = window.setInterval(simulateMinute, 200); 
  };

  const togglePause = () => {
      if (isPaused) {
          setIsPaused(false);
          matchInterval.current = window.setInterval(simulateMinute, 200);
      } else {
          setIsPaused(true);
          if (matchInterval.current) clearInterval(matchInterval.current);
      }
  };

  const openSubsModal = () => {
      if (phase !== 'LIVE') return;
      if (!isPaused) togglePause();
      setShowSubsModal(true);
      setSubPlayerOut(null);
  };

  const closeSubsModal = () => {
      setShowSubsModal(false);
      setSubPlayerOut(null);
      if (isPaused) togglePause();
  };

  const performSubstitution = (playerInId: string) => {
      if (!subPlayerOut || subsUsed >= 3) return;

      setSelectedSquad(prev => prev.map(id => id === subPlayerOut ? playerInId : id));
      setSubsUsed(prev => prev + 1);
      
      const pOut = myPlayers.find(p => p.id === subPlayerOut);
      const pIn = myPlayers.find(p => p.id === playerInId);
      
      addEvent(matchTime, 'WHISTLE', `SUB: ${pIn?.name} replaces ${pOut?.name}`, 'HOME');
      setCommentary(`Tactical change: ${pIn?.name} enters the field.`);
      
      closeSubsModal();
  };

  const handlePostMatchAction = (type: 'PRAISE' | 'CRITICIZE' | 'MEET') => {
      if (postMatchActionUsed) return;
      setPostMatchActionUsed(true);

      const won = score.home > score.away;
      const lost = score.home < score.away;
      let fanChange = 0;
      let msg = "";

      if (type === 'PRAISE') {
          if (won) {
              fanChange = 50;
              msg = "Fans loved your passion! +50 Fans";
          } else if (lost) {
              fanChange = -20;
              msg = "Fans think you are deluded. -20 Fans";
          } else {
              fanChange = 10;
              msg = "Fans appreciate the positivity. +10 Fans";
          }
      } else if (type === 'CRITICIZE') {
          if (lost) {
              fanChange = 30;
              msg = "Fans agree! Accountability matters. +30 Fans";
          } else if (won) {
              fanChange = -40;
              msg = "Why spoil the mood? -40 Fans";
          } else {
              fanChange = -10;
              msg = "Bit harsh, boss. -10 Fans";
          }
      } else if (type === 'MEET') {
          const success = Math.random() > 0.3;
          if (success) {
              fanChange = 100;
              msg = "Great event! The community loves you. +100 Fans";
          } else {
              fanChange = 0;
              msg = "Awkward silence. No new fans gained.";
          }
      }

      setFans(prev => Math.max(0, prev + fanChange));
  };

  const simulateMinute = () => {
    setMatchTime(prev => {
      const newTime = prev + 1;
      
      if (newTime > 90) {
        return 91; 
      }
      
      // Use Ref to access fresh state inside closure
      const stats = gameStatsRef.current;
      const { selectedSquad, myPlayers, formation, tactic, bribeActive, currentOpponent, simMode, trainingLevels } = stats;

      const squad = myPlayers.filter(p => selectedSquad.includes(p.id));
      let avgAtt = squad.reduce((sum, p) => sum + p.attack, 0) / 5;
      let avgDef = squad.reduce((sum, p) => sum + p.defense, 0) / 5;
      
      // FORMATION MODIFIERS
      if (formation === '1-1-2') { avgAtt += 15; avgDef -= 15; }
      if (formation === '3-1') { avgAtt -= 20; avgDef += 25; }
      if (formation === '2-2') { avgAtt -= 5; avgDef += 10; }

      // TRAINING BONUSES (Interactive Opportunity!)
      // Each level adds 2 points to relevant stats
      avgAtt += (trainingLevels.TECHNICAL - 1) * 3;
      avgDef += (trainingLevels.TACTICAL - 1) * 3;
      // Physical improves consistency (reduced variance) and late game stamina (simulated by flat boost here)
      avgAtt += (trainingLevels.PHYSICAL - 1);
      avgDef += (trainingLevels.PHYSICAL - 1);

      if (bribeActive) {
          avgAtt += 30; 
          avgDef += 10; 
      }

      let momentum = 0;
      if (tactic === 'ATTACK') momentum = (avgAtt * 0.6) - (Math.random() * 50);
      if (tactic === 'DEFENSE') momentum = (avgDef * 0.4) - (Math.random() * 30);
      if (tactic === 'BALANCED') momentum = ((avgAtt + avgDef) / 2 * 0.5) - (Math.random() * 40);

      const oppStrength = currentOpponent ? currentOpponent.strength : 80;
      momentum -= (oppStrength - 80);

      setPossession(p => Math.max(20, Math.min(80, p + (momentum > 0 ? 2 : -2))));

      if (Math.random() < 0.08) {
          let pool = COMMENTARY_PHRASES;
          if (simMode !== 'LEAGUE') pool = WC_COMMENTARY_PHRASES;
          if (simMode === 'AFCON') pool = AFCON_COMMENTARY_PHRASES;
          
          const phrase = pool[Math.floor(Math.random() * pool.length)];
          setCommentary(phrase);
      }

      const rand = Math.random();
      const isHomeEvent = possession > 50; 
      const effectiveHomeEvent = Math.random() > 0.5 ? true : false; 

      if (rand < 0.04) {
        const eventType = Math.random();
        
        if (eventType < 0.05) {
            setPenaltyActive(true);
            setCommentary("PENALTY! The referee points to the spot!");
            audioService.playWhistle();
            
            setTimeout(() => {
                const scored = Math.random() > 0.3; 
                if (scored) {
                    if (effectiveHomeEvent) {
                        addEvent(newTime, 'GOAL', 'Penalty Scored!', 'HOME');
                        setScore(s => ({ ...s, home: s.home + 1 }));
                        audioService.playCashOut();
                    } else {
                        addEvent(newTime, 'GOAL', 'Opponent scores penalty.', 'AWAY');
                        setScore(s => ({ ...s, away: s.away + 1 }));
                        audioService.playSplat();
                    }
                } else {
                    addEvent(newTime, 'MISS', 'Penalty Missed!', effectiveHomeEvent ? 'HOME' : 'AWAY');
                    setCommentary("SAVED! Unbelievable!");
                }
                setPenaltyActive(false);
            }, 2000);

        } else if (eventType < 0.25) { 
           if (Math.random() < 0.3) {
               setVarActive(true);
               setCommentary("Hold on... checking VAR for offside.");
               
               setTimeout(() => {
                   const allowed = Math.random() > 0.3; 
                   if (allowed) {
                       setCommentary("Goal STANDS!");
                       processGoal(effectiveHomeEvent, avgAtt, squad, newTime);
                   } else {
                       setCommentary("NO GOAL! Offside given by VAR.");
                       addEvent(newTime, 'WHISTLE', 'Goal disallowed (VAR)', effectiveHomeEvent ? 'HOME' : 'AWAY');
                   }
                   setVarActive(false);
               }, 2000);
           } else {
               processGoal(effectiveHomeEvent, avgAtt, squad, newTime);
           }

        } else if (eventType < 0.5) {
            addEvent(newTime, 'CORNER', 'Corner kick.', effectiveHomeEvent ? 'HOME' : 'AWAY');
            checkBets('CORNER', effectiveHomeEvent ? 'HOME' : 'AWAY');
            resolveLiveBets('CORNER');
        } else if (eventType < 0.6) {
            addEvent(newTime, 'CARD', 'Yellow Card.', effectiveHomeEvent ? 'HOME' : 'AWAY');
            setCommentary("That's a booking all day long.");
            resolveLiveBets('CARD');
            audioService.playWhistle();
        }
      }

      return newTime;
    });
  };

  const processGoal = (isHomeEvent: boolean, avgAtt: number, squad: FootballPlayer[], time: number) => {
       if (isHomeEvent && Math.random() < (avgAtt / 200)) {
           const scorer = squad[Math.floor(Math.random() * squad.length)];
           addEvent(time, 'GOAL', `${scorer.name} scores for Baba FC!`, 'HOME');
           setScore(s => ({ ...s, home: s.home + 1 }));
           checkBets('GOAL', 'HOME');
           resolveLiveBets('GOAL_HOME');
           setCommentary("GOALLLL! BABA FC TAKES THE LEAD!");
           audioService.playCashOut();
           audioService.playWhistle();
           if (gameStatsRef.current.simMode === 'AFCON') audioService.playVuvuzela();
       } else if (!isHomeEvent && Math.random() < 0.3) {
           addEvent(time, 'GOAL', 'Opponent scores!', 'AWAY');
           setScore(s => ({ ...s, away: s.away + 1 }));
           checkBets('GOAL', 'AWAY');
           resolveLiveBets('GOAL_AWAY');
           setCommentary("Disaster! The defense is sleeping!");
           audioService.playSplat();
           audioService.playWhistle();
       } else {
           addEvent(time, 'MISS', 'Post hit!', isHomeEvent ? 'HOME' : 'AWAY');
           setCommentary("OFF THE WOODWORK!");
       }
  };

  const endMatch = () => {
      if (matchInterval.current) clearInterval(matchInterval.current);
      audioService.stopEngine();
      audioService.playWhistle();

      // Clear any pending Live Bets as losses (if match ends without event)
      setLiveBets([]);

      // Access fresh state via Ref for end match logic
      const { simMode, score, stadiumLevel, fans } = gameStatsRef.current;

      // Handle Tournament Draws (WC or AFCON or Others)
      if (simMode !== 'LEAGUE' && score.home === score.away) {
          setPhase('PENALTIES');
          setCommentary("It's a DRAW! Proceeding to penalty shootout!");
          setPenaltyState({
              round: 1,
              homeScore: 0,
              awayScore: 0,
              homeHistory: [],
              awayHistory: [],
              isPlayerTurn: true, // Player always shoots first for simplicity
              kicksTaken: 0
          });
          return;
      }

      // Normal ending
      finishMatch(score.home, score.away, null);
  };

  const handlePenaltyGuess = (direction: 'LEFT' | 'MIDDLE' | 'RIGHT') => {
      const directions: ('LEFT' | 'MIDDLE' | 'RIGHT')[] = ['LEFT', 'MIDDLE', 'RIGHT'];
      const aiDirection = directions[Math.floor(Math.random() * directions.length)];
      
      let isGoal = false;
      let msg = "";

      if (penaltyState.isPlayerTurn) {
          // Player is SHOOTING
          if (direction !== aiDirection) {
              isGoal = true;
              msg = `GOAL! Keeper went ${aiDirection}!`;
              audioService.playCashOut();
          } else {
              isGoal = false;
              msg = `SAVED! Keeper guessed ${aiDirection}!`;
              audioService.playSplat();
          }
      } else {
          // Player is SAVING
          if (direction === aiDirection) {
              isGoal = false; // Save!
              msg = `WHAT A SAVE! You guessed ${direction}!`;
              audioService.playCashOut();
          } else {
              isGoal = true; // Goal
              msg = `GOAL. Opponent shot ${aiDirection}.`;
              audioService.playSplat();
          }
      }

      setCommentary(msg);

      setPenaltyState(prev => {
          const isHome = prev.isPlayerTurn; // Assuming Player is Home
          const newHomeHistory = isHome ? [...prev.homeHistory, isGoal] : prev.homeHistory;
          const newAwayHistory = !isHome ? [...prev.awayHistory, isGoal] : prev.awayHistory;
          const newHomeScore = isHome && isGoal ? prev.homeScore + 1 : prev.homeScore;
          const newAwayScore = !isHome && isGoal ? prev.awayScore + 1 : prev.awayScore;
          const newKicksTaken = prev.kicksTaken + 1;
          const nextIsPlayerTurn = !prev.isPlayerTurn;
          
          let nextRound = prev.round;
          if (newKicksTaken % 2 === 0) {
              nextRound = prev.round + 1;
          }

          // Check Win Condition (Simple sudden death after 5, or best of 5 logic)
          let winner: 'HOME' | 'AWAY' | null = null;
          
          if (newKicksTaken >= 10 && newKicksTaken % 2 === 0) {
              // Both taken same amount (at least 5 each)
              if (newHomeScore > newAwayScore) winner = 'HOME';
              if (newAwayScore > newHomeScore) winner = 'AWAY';
          } else if (newKicksTaken < 10) {
              // Early win check logic (if remaining kicks < diff)
              const homeRemaining = 5 - Math.floor((newKicksTaken + (isHome ? 0 : 1)) / 2); // Kicks left for home
              const awayRemaining = 5 - Math.floor((newKicksTaken + (isHome ? 1 : 0)) / 2); // Kicks left for away
              
              if (newHomeScore > newAwayScore + awayRemaining) winner = 'HOME';
              if (newAwayScore > newHomeScore + homeRemaining) winner = 'AWAY';
          }

          if (winner) {
              setTimeout(() => finishMatch(score.home, score.away, winner), 1500);
          }

          return {
              round: nextRound,
              homeScore: newHomeScore,
              awayScore: newAwayScore,
              homeHistory: newHomeHistory,
              awayHistory: newAwayHistory,
              isPlayerTurn: nextIsPlayerTurn,
              kicksTaken: newKicksTaken
          };
      });
  };

  const finishMatch = (homeScore: number, awayScore: number, penaltyWinner: 'HOME' | 'AWAY' | null) => {
      setPhase('FULL_TIME');
      setCommentary("The final whistle blows! What a match.");
      setLiveBets([]); // Clear live bets on finish
      
      const { simMode, bribeActive, myPlayers, stadiumLevel, fans } = gameStatsRef.current;

      if (simMode !== 'LEAGUE') {
          // If penalties happened, user won if winner='HOME'
          let userWon = homeScore > awayScore;
          if (penaltyWinner) {
              userWon = penaltyWinner === 'HOME';
          }
          
          setWcMatches(prev => prev.map(m => {
              if (m.isUserMatch) {
                  return {
                      ...m,
                      played: true,
                      winner: userWon ? "Republic of Baba" : m.away === "Republic of Baba" ? m.home : m.away,
                      score: { home: homeScore, away: awayScore } // Store reg time score
                  };
              } else {
                  const winner = Math.random() > 0.5 ? m.home : m.away;
                  return {
                      ...m,
                      played: true,
                      winner,
                      score: { home: Math.floor(Math.random()*3), away: Math.floor(Math.random()*3) }
                  };
              }
          }));

          if (userWon) {
              audioService.playCashOut();
          } else {
              audioService.playSplat();
          }
      } else {
          // Consolidated update to fix table sync issues
          processLeagueRound(homeScore, awayScore);
      }
      
      generateReactions(homeScore, awayScore);

      // Post-match events logic remains the same...
      const isLoss = homeScore < awayScore || (penaltyWinner === 'AWAY');
      const isDraw = homeScore === awayScore && !penaltyWinner;
      
      // Reward logic
      let income = 0;
      const sponsor = SPONSORS.find(s => s.id === activeSponsor);
      if (sponsor) income += sponsor.incomePerMatch;
      const tv = TV_DEALS.find(t => t.id === activeTvDeal);
      if (tv) income += tv.incomePerMatch;

      // Ticket Income logic
      const capacity = STADIUM_LEVELS[stadiumLevel - 1].capacity;
      const attendance = Math.min(capacity, fans + Math.floor(Math.random() * 500));
      const ticketPrice = 5 + (stadiumLevel * 2); // $7, $9, etc.
      const ticketRevenue = Math.floor(attendance * ticketPrice * 0.1); // Take 10% cut as owner? or calculate realistic scaling
      // Let's make it simpler: ticketRevenue is directly added
      income += ticketRevenue;

      let fanChange = 0;
      if (!isLoss && !isDraw) fanChange += 50; 
      else if (isDraw) fanChange += 5; 
      else fanChange -= 25; 
      
      fanChange += homeScore * 10; 
      setFans(prev => Math.max(0, prev + fanChange));

      let matchRevenue = income; 

      if (!isLoss && !isDraw) {
          matchRevenue += MATCH_WIN_PRIZE;
          if (simMode === 'WORLD_CUP') matchRevenue += 1000;
          if (simMode === 'AFCON') matchRevenue += 800;
          if (simMode === 'EURO') matchRevenue += 1200;
          if (simMode === 'ASIAN') matchRevenue += 900;
          if (simMode === 'COPA') matchRevenue += 1000;
          audioService.playCashOut(); 
      }
      setBalance(prev => prev + matchRevenue);
      setBribeActive(false);
  };

  const generateReactions = (home: number, away: number) => {
      let pool = FAN_REACTIONS.DRAW;
      if (home > away) pool = FAN_REACTIONS.WIN;
      if (home < away) pool = FAN_REACTIONS.LOSS;

      const count = Math.floor(Math.random() * 4) + 12;
      const reactions = [];
      for (let i = 0; i < count; i++) {
          reactions.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      setMatchReactions(reactions);
  };

  const updateLeagueTable = (homeGoals: number, awayGoals: number) => {
      // Not used anymore, replaced by processLeagueRound
  };

  const addEvent = (minute: number, type: MatchEvent['type'], description: string, team: 'HOME' | 'AWAY') => {
      setEvents(prev => [{ id: Date.now(), minute, type, description, team }, ...prev]);
  };

  const getSimTheme = () => {
      if (simMode === 'AFCON') return { text: 'text-red-500', bg: 'bg-red-950/40', border: 'border-green-600', shadow: 'shadow-[0_0_15px_#dc2626]', title: 'AFCON 2050' };
      if (simMode === 'WORLD_CUP') return { text: 'text-cyan-400', bg: 'bg-cyan-900/40', border: 'border-cyan-500', shadow: 'shadow-[0_0_15px_cyan]', title: 'World Cup 2050' };
      if (simMode === 'EURO') return { text: 'text-blue-400', bg: 'bg-blue-900/40', border: 'border-blue-500', shadow: 'shadow-[0_0_15px_blue]', title: 'Euro 2050' };
      if (simMode === 'ASIAN') return { text: 'text-amber-400', bg: 'bg-amber-900/40', border: 'border-amber-500', shadow: 'shadow-[0_0_15px_amber]', title: 'Asian Cup 2050' };
      if (simMode === 'COPA') return { text: 'text-yellow-400', bg: 'bg-yellow-900/40', border: 'border-green-500', shadow: 'shadow-[0_0_15px_yellow]', title: 'Copa 2050' };
      return { text: isLightMode ? 'text-orange-600' : 'text-orange-400', bg: isLightMode ? 'bg-white' : 'bg-slate-900', border: isLightMode ? 'border-gray-200' : 'border-slate-700', shadow: 'shadow-lg', title: 'Baba Manager FC' };
  };

  const themeVars = {
      bgMain: isLightMode ? 'bg-gray-100 text-black' : 'bg-slate-900 text-white',
      bgCard: isLightMode ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700',
      bgSub: isLightMode ? 'bg-gray-50' : 'bg-slate-950',
      textMuted: isLightMode ? 'text-gray-500' : 'text-slate-400',
      border: isLightMode ? 'border-gray-200' : 'border-slate-700',
      input: isLightMode ? 'bg-white border-gray-300 text-black' : 'bg-slate-900 border-slate-700 text-white',
      buttonSecondary: isLightMode ? 'bg-gray-200 hover:bg-gray-300 text-black' : 'bg-slate-700 hover:bg-slate-600 text-white',
  };

  const containerBgClass = simMode === 'WORLD_CUP' || simMode === 'EURO' ? 'bg-slate-950' : simMode === 'AFCON' ? 'bg-black' : simMode === 'ASIAN' ? 'bg-red-950' : simMode === 'COPA' ? 'bg-green-950' : (isLightMode ? 'bg-gray-100' : 'bg-slate-900');
  const textColorClass = isLightMode && simMode === 'LEAGUE' ? 'text-black' : 'text-white';

  return (
    <div className={`min-h-screen p-4 flex flex-col items-center font-sans ${containerBgClass} ${textColorClass}`}>
        <style>{`
            @keyframes float-football {
                0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
                10% { opacity: 0.5; }
                90% { opacity: 0.5; }
                100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)); opacity: 0; }
            }
            .animate-float-football {
                animation: float-football 2s linear infinite;
            }
        `}</style>
        
        {/* STADIUM UPGRADE MODAL */}
        {showStadiumUpgradeModal && (
            <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                <div className={`w-full max-w-sm rounded-2xl border-4 border-yellow-500 shadow-2xl p-6 relative overflow-hidden ${isLightMode ? 'bg-white' : 'bg-slate-900'}`}>
                    {/* Background Shine */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <button 
                        onClick={() => setShowStadiumUpgradeModal(false)}
                        className={`absolute top-4 right-4 ${isLightMode ? 'text-gray-400 hover:text-black' : 'text-slate-400 hover:text-white'}`}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <h3 className={`text-xl font-black uppercase tracking-wider mb-2 flex items-center gap-2 ${isLightMode ? 'text-black' : 'text-white'}`}>
                        <Armchair className="w-6 h-6 text-yellow-500" /> Stadium Upgrade
                    </h3>
                    
                    <div className={`rounded-xl p-4 mb-4 border ${isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-slate-700'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs uppercase font-bold ${themeVars.textMuted}`}>Current Level</span>
                            <span className={`text-sm font-bold ${isLightMode ? 'text-black' : 'text-white'}`}>{STADIUM_LEVELS[stadiumLevel-1].name}</span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${isLightMode ? 'bg-gray-200' : 'bg-slate-700'}`}>
                            <div className="h-full bg-yellow-500 transition-all" style={{ width: `${(stadiumLevel/STADIUM_LEVELS.length)*100}%` }}></div>
                        </div>
                    </div>

                    {stadiumLevel < STADIUM_LEVELS.length ? (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="text-xs font-bold text-green-500 uppercase mb-1">Next Upgrade</div>
                                <div className={`text-2xl font-black ${isLightMode ? 'text-black' : 'text-white'}`}>{STADIUM_LEVELS[stadiumLevel].name}</div>
                                <div className={`text-sm ${themeVars.textMuted}`}>Capacity: {STADIUM_LEVELS[stadiumLevel].capacity.toLocaleString()}</div>
                            </div>
                            
                            <button 
                                onClick={buyStadiumUpgrade}
                                disabled={balance < STADIUM_LEVELS[stadiumLevel].cost}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Hammer className="w-5 h-5" /> 
                                Upgrade for ${STADIUM_LEVELS[stadiumLevel].cost.toLocaleString()}
                            </button>
                            {balance < STADIUM_LEVELS[stadiumLevel].cost && (
                                <div className="text-center text-xs text-red-500 font-bold">Insufficient Funds</div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <div className="text-4xl mb-2">🏟️</div>
                            <div className="font-bold text-yellow-500 text-lg">Max Level Reached!</div>
                            <p className={`text-xs ${themeVars.textMuted}`}>Your stadium is world-class.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* TICKET / DONATION MODAL */}
        {showTicketModal && (
// ... existing ticket modal code ...
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in">
                <div className="w-full max-w-sm relative transform hover:scale-[1.01] transition-transform duration-500">
                    
                    <button 
                        onClick={() => setShowTicketModal(false)}
                        className="absolute -top-10 right-0 text-slate-400 hover:text-white"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div className="bg-white w-full rounded-3xl overflow-hidden relative shadow-[0_0_50px_rgba(234,179,8,0.4)] flex flex-col">
                        {/* Ticket Header (Red) */}
                        <div className="bg-[#c1272d] p-6 text-white relative overflow-hidden">
                            {/* Decorative Green Star opacity */}
                            <div className="absolute -right-10 -top-10 text-[#006233]/30">
                                <Star className="w-40 h-40 fill-current" />
                            </div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-black italic tracking-tighter leading-none">AFCON<br/>2050</h2>
                                    <div className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-90 text-yellow-300">Morocco Edition</div>
                                </div>
                                <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-md" />
                            </div>
                            <div className="mt-6 flex justify-between items-end">
                                <div>
                                    <div className="text-[9px] uppercase opacity-75">Venue</div>
                                    <div className="font-bold text-sm">Mohammed V Stadium</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] uppercase opacity-75">Date</div>
                                    <div className="font-bold text-sm">July 15, 2050</div>
                                </div>
                            </div>
                        </div>

                        {/* Perforation */}
                        <div className="relative h-6 bg-[#f8fafc] flex items-center justify-center">
                            <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full"></div> 
                            <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full"></div> 
                            <div className="w-full border-t-2 border-dashed border-slate-300 mx-6"></div>
                        </div>

                        {/* Ticket Body (White/Gold) */}
                        <div className="bg-slate-50 p-6 text-slate-900 flex-1">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                                <div className="text-center">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Gate</div>
                                    <div className="text-xl font-black">A1</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Row</div>
                                    <div className="text-xl font-black">12</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Seat</div>
                                    <div className="text-xl font-black text-[#c1272d]">VIP</div>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
                                <div className="text-center mb-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Payment Required to Validate</p>
                                    {/* Simulated Barcode */}
                                    <div className="h-10 w-full bg-slate-900 flex justify-between items-center px-2 overflow-hidden mb-2 rounded-sm opacity-90">
                                        {Array.from({length: 45}).map((_, i) => (
                                            <div key={i} className="bg-white h-full" style={{width: Math.random() * 3 + 1 + 'px'}}></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Donation Methods */}
                                <div className="space-y-2">
                                    <div onClick={() => handleCopy("0782813854")} className="flex items-center justify-between p-2 bg-green-50/80 hover:bg-green-100 rounded border border-green-200 cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-500 text-white p-1 rounded">
                                                <Smartphone className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-bold text-slate-500 uppercase">M-PESA</div>
                                                <div className="text-sm font-mono font-bold text-slate-900">0782813854</div>
                                            </div>
                                        </div>
                                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-400 group-hover:text-green-600" />}
                                    </div>

                                    <div onClick={() => handleCopy("1EoupeVLQ3qUhEQ2bZQsduyefzLRXnwVDQ")} className="flex items-center justify-between p-2 bg-orange-50/80 hover:bg-orange-100 rounded border border-orange-200 cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-500 text-white p-1 rounded">
                                                <Bitcoin className="w-4 h-4" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="text-[9px] font-bold text-slate-500 uppercase">BITCOIN</div>
                                                <div className="text-[10px] font-mono font-bold text-slate-900 truncate w-32">1EoupeVLQ3qUhEQ2bZQsduyefzLRXnwVDQ</div>
                                            </div>
                                        </div>
                                        {copied ? <CheckCircle2 className="w-4 h-4 text-orange-600" /> : <Copy className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />}
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-[9px] text-slate-400 font-medium">
                                    * Validates your status as a "Legend" supporter.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* POST MATCH MODAL */}
        {phase === 'FULL_TIME' && (
// ... existing post match modal code ...
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in">
                <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-8 text-center relative overflow-hidden ${isLightMode ? 'bg-white border-gray-300' : 'bg-slate-900 border-slate-700'}`}>
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
                    
                    <h2 className={`text-4xl font-black uppercase mb-2 ${isLightMode ? 'text-black' : 'text-white'}`}>Full Time</h2>
                    <div className={`text-6xl font-mono font-bold mb-6 flex justify-center gap-4 ${isLightMode ? 'text-black' : 'text-white'}`}>
                        <span className={score.home > score.away ? 'text-green-500' : score.home < score.away ? 'text-red-500' : ''}>{score.home}</span>
                        <span className={isLightMode ? 'text-gray-400 text-4xl' : 'text-slate-600 text-4xl'}>:</span>
                        <span className={score.away > score.home ? 'text-green-500' : score.away < score.home ? 'text-red-500' : ''}>{score.away}</span>
                    </div>
                    {penaltyState.kicksTaken > 0 && (
                        <div className={`mb-6 p-2 rounded ${isLightMode ? 'bg-gray-100' : 'bg-slate-950'}`}>
                            <div className={`text-xs uppercase font-bold mb-1 ${themeVars.textMuted}`}>Penalties</div>
                            <div className={`text-xl font-mono font-bold ${isLightMode ? 'text-black' : 'text-white'}`}>
                                {penaltyState.homeScore} - {penaltyState.awayScore}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 mb-8">
                        <div className={`p-4 rounded-xl border ${themeVars.bgSub} ${themeVars.border}`}>
                            <h3 className={`text-xs font-bold uppercase mb-2 ${themeVars.textMuted}`}>Fan Reactions</h3>
                            <div className={`text-sm italic ${isLightMode ? 'text-gray-700' : 'text-slate-300'}`}>
                                "{matchReactions[0]}"
                            </div>
                        </div>
                        {specialEvent && (
                            <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/50">
                                <h3 className="text-xs font-bold uppercase text-red-400 mb-1 flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> {specialEvent.title}
                                </h3>
                                <p className="text-xs text-red-200">{specialEvent.description}</p>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => {
                            if (simMode !== 'LEAGUE') {
                                proceedToNextRound();
                            } else {
                                setPhase('PRE_MATCH');
                                setActiveTab('LEAGUE'); // Auto switch to league table to see updates
                            }
                        }}
                        className={`w-full py-4 font-bold uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 ${simMode === 'WORLD_CUP' ? 'bg-cyan-600 hover:bg-cyan-500 text-black' : simMode === 'AFCON' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white'}`}
                    >
                        {(simMode !== 'LEAGUE') ? 'Next Round / Finish' : 'Continue to Office'}
                    </button>
                </div>
            </div>
        )}

        {/* LIVE BETTING OVERLAY */}
        {showLiveBetting && phase === 'LIVE' && (
// ... existing live betting code ...
            <div className="fixed inset-x-0 bottom-0 z-50 bg-slate-900 border-t-2 border-green-500 p-4 animate-in slide-in-from-bottom-20 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black uppercase text-green-400 flex items-center gap-2">
                        <Banknote className="w-5 h-5" /> Live Betting
                    </h3>
                    <button onClick={() => setShowLiveBetting(false)} className="text-slate-400 hover:text-white">Close</button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button 
                        onClick={() => placeLiveBet('GOAL_HOME', 2.5, 'Next Goal: BABA')}
                        className="bg-slate-800 hover:bg-green-900/50 p-3 rounded-lg border border-slate-700 flex flex-col items-center gap-1 active:scale-95 transition-transform"
                    >
                        <span className="text-xs text-slate-400 uppercase font-bold">Next Goal</span>
                        <span className="font-black text-white">BABA FC</span>
                        <span className="text-xs bg-green-500 text-black px-2 rounded font-bold">2.50x</span>
                    </button>
                    <button 
                        onClick={() => placeLiveBet('GOAL_AWAY', 3.0, 'Next Goal: AWAY')}
                        className="bg-slate-800 hover:bg-red-900/50 p-3 rounded-lg border border-slate-700 flex flex-col items-center gap-1 active:scale-95 transition-transform"
                    >
                        <span className="text-xs text-slate-400 uppercase font-bold">Next Goal</span>
                        <span className="font-black text-white">OPPONENT</span>
                        <span className="text-xs bg-green-500 text-black px-2 rounded font-bold">3.00x</span>
                    </button>
                    <button 
                        onClick={() => placeLiveBet('CORNER', 4.0, 'Next Event: CORNER')}
                        className="bg-slate-800 hover:bg-blue-900/50 p-3 rounded-lg border border-slate-700 flex flex-col items-center gap-1 active:scale-95 transition-transform"
                    >
                        <span className="text-xs text-slate-400 uppercase font-bold">Next Event</span>
                        <span className="font-black text-white">CORNER</span>
                        <span className="text-xs bg-green-500 text-black px-2 rounded font-bold">4.00x</span>
                    </button>
                    <button 
                        onClick={() => placeLiveBet('CARD', 5.0, 'Next Event: CARD')}
                        className="bg-slate-800 hover:bg-yellow-900/50 p-3 rounded-lg border border-slate-700 flex flex-col items-center gap-1 active:scale-95 transition-transform"
                    >
                        <span className="text-xs text-slate-400 uppercase font-bold">Next Event</span>
                        <span className="font-black text-white">CARD</span>
                        <span className="text-xs bg-green-500 text-black px-2 rounded font-bold">5.00x</span>
                    </button>
                </div>
                <div className="text-center text-[10px] text-slate-500 mt-2">Cost: $50 per bet. Winnings added instantly.</div>
            </div>
        )}

        {/* SUBS MODAL */}
        {showSubsModal && (
// ... existing subs modal code ...
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl p-6 ${isLightMode ? 'bg-white border-gray-300' : 'bg-slate-900 border-slate-700'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-black uppercase text-orange-400">Tactical Substitution</h2>
                            <p className={`text-sm ${themeVars.textMuted}`}>Select player to sub OFF, then select player to sub ON.</p>
                        </div>
                        <div className={`text-right ${isLightMode ? 'text-black' : 'text-white'}`}>
                             <div className="text-3xl font-mono font-bold">{subsUsed}/3</div>
                             <div className={`text-xs uppercase font-bold ${themeVars.textMuted}`}>Subs Used</div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* ON PITCH */}
                        <div className="flex-1">
                            <h3 className="text-sm font-bold uppercase text-green-500 mb-3 flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4 rotate-90 md:rotate-0" /> On Pitch (Select one to remove)
                            </h3>
                            <div className="space-y-2">
                                {myPlayers.filter(p => selectedSquad.includes(p.id)).map(player => (
                                    <button
                                        key={player.id}
                                        onClick={() => setSubPlayerOut(player.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                            subPlayerOut === player.id 
                                            ? 'bg-red-500/20 border-red-500 ring-1 ring-red-500' 
                                            : (isLightMode ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' : 'bg-slate-800 border-slate-700 hover:bg-slate-700')
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`font-mono text-xs font-bold px-2 py-1 rounded ${isLightMode ? 'bg-gray-200 text-black' : 'bg-slate-950 text-white'}`}>{player.position}</span>
                                            <span className={`font-bold ${isLightMode ? 'text-black' : 'text-white'}`}>{player.name}</span>
                                        </div>
                                        <div className={`text-xs ${themeVars.textMuted}`}>
                                            {Math.max(player.attack, player.defense)} OVR
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* BENCH */}
                        <div className="flex-1">
                             <h3 className="text-sm font-bold uppercase text-blue-500 mb-3 flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4 rotate-[-90deg] md:rotate-180" /> Bench (Select one to bring on)
                            </h3>
                            <div className="space-y-2">
                                {myPlayers.filter(p => !selectedSquad.includes(p.id)).map(player => (
                                    <button
                                        key={player.id}
                                        onClick={() => performSubstitution(player.id)}
                                        disabled={!subPlayerOut || subsUsed >= 3 || player.isInternational}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                            !subPlayerOut 
                                            ? (isLightMode ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200' : 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-700')
                                            : (isLightMode ? 'bg-gray-50 border-gray-200 hover:bg-green-100 hover:border-green-500' : 'bg-slate-800 border-slate-700 hover:bg-green-900/40 hover:border-green-500')
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`font-mono text-xs font-bold px-2 py-1 rounded ${isLightMode ? 'bg-gray-200 text-black' : 'bg-slate-950 text-white'}`}>{player.position}</span>
                                            <span className={`font-bold ${isLightMode ? 'text-black' : 'text-white'}`}>{player.name}</span>
                                            {player.isInternational && <span className="text-[10px] text-red-400">(Intl Duty)</span>}
                                        </div>
                                        <div className={`text-xs ${themeVars.textMuted}`}>
                                            {Math.max(player.attack, player.defense)} OVR
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button 
                            onClick={closeSubsModal}
                            className={`px-6 py-3 font-bold rounded-xl ${themeVars.buttonSecondary}`}
                        >
                            Cancel / Return to Match
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* PRE-MATCH ITINERARY MODAL */}
        {showPreMatchModal && currentOpponent && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
                <div className={`w-full max-w-md rounded-3xl border-2 shadow-2xl relative overflow-hidden ${simMode === 'WORLD_CUP' ? 'bg-slate-900 border-cyan-500/50' : simMode === 'AFCON' ? 'bg-black border-green-600/50' : simMode === 'ASIAN' ? 'bg-red-950 border-amber-500/50' : simMode === 'COPA' ? 'bg-green-950 border-yellow-500/50' : simMode === 'EURO' ? 'bg-slate-900 border-blue-500/50' : (isLightMode ? 'bg-white border-orange-500/50' : 'bg-slate-900 border-orange-500/50')}`}>
                    {/* Background decoration */}
                    <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b to-transparent ${simMode === 'WORLD_CUP' ? 'from-cyan-500/20' : simMode === 'AFCON' ? 'from-red-600/20' : simMode === 'ASIAN' ? 'from-amber-600/20' : simMode === 'COPA' ? 'from-yellow-600/20' : simMode === 'EURO' ? 'from-blue-600/20' : 'from-orange-500/20'}`}></div>
                    
                    <div className="p-6 relative z-10">
                        <div className="text-center mb-6">
                            <h2 className={`text-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 ${getSimTheme().text}`}>
                                <Plane className={`w-6 h-6 ${simMode === 'WORLD_CUP' ? 'text-cyan-400' : simMode === 'AFCON' ? 'text-red-500' : simMode === 'ASIAN' ? 'text-amber-500' : simMode === 'COPA' ? 'text-yellow-500' : simMode === 'EURO' ? 'text-blue-500' : 'text-orange-400'}`} /> 
                                {simMode === 'WORLD_CUP' ? 'Teleporting...' : simMode === 'AFCON' ? 'Flying to Casablanca...' : simMode === 'EURO' ? 'Train to Berlin...' : simMode === 'ASIAN' ? 'Jet to Tokyo...' : simMode === 'COPA' ? 'Trek to Rio...' : 'Match Itinerary'}
                            </h2>
                            <p className={`text-xs font-mono mt-1 ${themeVars.textMuted}`}>SQUAD DEPLOYMENT PROTOCOL</p>
                        </div>

                        {/* Matchup Banner */}
                        <div className={`flex items-center justify-between p-4 rounded-2xl border mb-6 ${themeVars.bgCard}`}>
                            <div className="flex flex-col items-center">
                                <TeamLogo 
                                    name="Baba FC" 
                                    color={TEAM_SKINS.find(s => s.id === activeSkin)?.class || 'bg-orange-500'} 
                                    size="md" 
                                    textColor={TEAM_SKINS.find(s => s.id === activeSkin)?.textColor}
                                />
                                <span className={`text-xs font-bold mt-2 ${isLightMode ? 'text-black' : 'text-white'}`}>BABA FC</span>
                            </div>
                            <div className="flex flex-col items-center px-4">
                                <span className={`text-xs font-bold uppercase ${themeVars.textMuted}`}>VS</span>
                                <div className={`text-2xl font-black italic ${isLightMode ? 'text-black' : 'text-white'}`}>AWAY</div>
                            </div>
                            <div className="flex flex-col items-center">
                                {simMode !== 'LEAGUE' ? (
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-2 ${simMode === 'AFCON' ? 'bg-red-900 border-green-500 text-green-200' : simMode === 'ASIAN' ? 'bg-red-900 border-amber-500 text-amber-200' : simMode === 'COPA' ? 'bg-green-900 border-yellow-500 text-yellow-200' : simMode === 'EURO' ? 'bg-blue-900 border-white text-white' : 'bg-cyan-900 border-cyan-500 text-cyan-200'}`}>{currentOpponent.name.substring(0,2)}</div>
                                ) : (
                                    <TeamLogo name={currentOpponent.name} color={currentOpponent.color} size="md" />
                                )}
                                <span className={`text-xs font-bold mt-2 truncate max-w-[80px] ${isLightMode ? 'text-black' : 'text-white'}`}>{currentOpponent.name}</span>
                            </div>
                        </div>

                        {/* Travel Details */}
                        <div className="space-y-4 mb-6">
                            <div className={`p-4 rounded-xl border flex items-start gap-4 ${themeVars.bgSub} ${themeVars.border}`}>
                                <div className="bg-blue-900/30 p-2 rounded-lg">
                                    <MapPin className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className={`text-sm font-bold uppercase ${isLightMode ? 'text-black' : 'text-white'}`}>Destination</h3>
                                    <p className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-slate-300'}`}>
                                        Traveling to <span className="text-blue-400 font-bold">{simMode === 'WORLD_CUP' ? 'Neo-Tokyo Arena' : simMode === 'AFCON' ? 'Mohammed V Stadium' : TEAM_LOCATIONS[currentOpponent.id] || 'Unknown City'}</span>.
                                    </p>
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl border flex items-start gap-4 ${themeVars.bgSub} ${themeVars.border}`}>
                                <div className="bg-purple-900/30 p-2 rounded-lg">
                                    <Mic2 className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className={`text-sm font-bold uppercase ${isLightMode ? 'text-black' : 'text-white'}`}>Commentary Preview</h3>
                                    <p className={`text-xs italic ${isLightMode ? 'text-gray-600' : 'text-slate-300'}`}>"{preMatchComment}"</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={confirmMatchStart}
                            className={`w-full py-4 text-white font-black uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2 group transition-all transform active:scale-95 ${simMode === 'WORLD_CUP' ? 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : simMode === 'AFCON' ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_#dc2626]' : simMode === 'ASIAN' ? 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_20px_#d97706]' : simMode === 'COPA' ? 'bg-green-600 hover:bg-green-500 shadow-[0_0_20px_#16a34a]' : simMode === 'EURO' ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_#2563eb]' : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500'}`}
                        >
                            <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" /> Start Match
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button onClick={onBack} className={`p-2 rounded-full transition-colors border ${isLightMode ? 'bg-white hover:bg-gray-50 border-gray-300 text-gray-600 hover:text-black' : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'}`}>
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className={`text-2xl font-black uppercase tracking-tighter italic hidden md:block ${getSimTheme().text}`}>
                    {getSimTheme().title}
                </h1>
            </div>

            <div className={`flex items-center gap-3 p-2 pr-4 rounded-full border shadow-xl ${isLightMode ? 'bg-white border-gray-300 text-black' : 'bg-slate-900 border-slate-800 text-white'}`}>
                 <div className={`flex items-center gap-2 pl-2 border-r pr-4 ${isLightMode ? 'border-gray-200' : 'border-slate-700'}`}>
                     <div className="bg-blue-500/10 p-1.5 rounded-full">
                         <Users className="w-4 h-4 text-blue-400" />
                     </div>
                     <div className="flex flex-col">
                         <span className={`text-[10px] font-bold uppercase leading-none ${themeVars.textMuted}`}>Fanbase</span>
                         <span className="font-bold text-sm leading-none">{fans.toLocaleString()}</span>
                     </div>
                 </div>
                 <div className="flex items-center gap-2">
                     <div className="bg-green-500/10 p-1.5 rounded-full">
                         <DollarSign className="w-4 h-4 text-green-400" />
                     </div>
                     <span className="font-mono text-green-500 font-bold">${balance.toFixed(2)}</span>
                 </div>
            </div>
        </div>

        {/* Content Area */}
        <div className={`w-full max-w-4xl rounded-3xl overflow-hidden border shadow-2xl relative ${isLightMode ? 'bg-white' : 'bg-slate-900'} ${simMode === 'WORLD_CUP' ? 'border-cyan-800' : simMode === 'AFCON' ? 'border-red-600' : simMode === 'ASIAN' ? 'border-amber-600' : simMode === 'COPA' ? 'border-green-600' : simMode === 'EURO' ? 'border-blue-600' : (isLightMode ? 'border-gray-300' : 'border-slate-700')}`}>
            
            {/* MATCH HEADER / SCOREBOARD */}
            <div className={`p-4 md:p-6 border-b relative overflow-hidden ${isLightMode ? 'bg-white border-gray-200' : 'bg-slate-950 border-slate-800'}`}>
                <div className="relative z-10 flex justify-between items-center">
                    {/* Home Team */}
                    <div className="flex items-center gap-4 flex-1">
                        <TeamLogo 
                            name="Baba FC" 
                            color={TEAM_SKINS.find(s => s.id === activeSkin)?.class || 'bg-orange-500'} 
                            size="lg" 
                            textColor={TEAM_SKINS.find(s => s.id === activeSkin)?.textColor}
                        />
                        <div className="hidden md:block">
                            <div className={`text-2xl font-black tracking-tighter ${isLightMode ? 'text-black' : 'text-white'}`}>BABA FC</div>
                            <div className={`text-xs font-bold uppercase tracking-widest ${themeVars.textMuted}`}>Home</div>
                        </div>
                    </div>
                    
                    {/* Scoreboard Center */}
                    <div className="flex flex-col items-center mx-4">
                        <div className={`backdrop-blur-sm border rounded-xl px-6 py-2 shadow-2xl flex items-center gap-4 mb-2 ${isLightMode ? 'bg-gray-100 border-gray-300' : 'bg-black/50 border-slate-800'} ${simMode === 'WORLD_CUP' ? 'border-cyan-500/50' : simMode === 'AFCON' ? 'border-red-500/50' : ''}`}>
                            <span className={`text-4xl md:text-5xl font-mono font-bold tabular-nums ${isLightMode ? 'text-black' : 'text-white'}`}>{score.home}</span>
                            <span className={`text-2xl ${isLightMode ? 'text-gray-400' : 'text-slate-600'}`}>:</span>
                            <span className={`text-4xl md:text-5xl font-mono font-bold tabular-nums ${isLightMode ? 'text-black' : 'text-white'}`}>{score.away}</span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isLightMode ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-800'}`}>
                             {phase === 'LIVE' ? (
                                 <div className="flex items-center gap-2">
                                     <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                    <span className="text-xs font-bold text-red-500 uppercase">LIVE</span>
                                 </div>
                             ) : phase === 'PENALTIES' ? (
                                <div className="flex items-center gap-2 animate-pulse">
                                    <Target className="w-3 h-3 text-yellow-400" />
                                    <span className="text-xs font-bold text-yellow-400 uppercase">PENS</span>
                                </div>
                             ) : (
                                <span className={`text-xs font-bold uppercase ${themeVars.textMuted}`}>{phase === 'FULL_TIME' ? 'FT' : 'PRE'}</span>
                             )}
                             <div className={`w-px h-3 ${isLightMode ? 'bg-gray-300' : 'bg-slate-700'}`}></div>
                             <span className={`font-mono text-xs font-bold w-8 text-center ${isLightMode ? 'text-black' : 'text-white'}`}>{matchTime}'</span>
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-4 flex-1 justify-end">
                        <div className="hidden md:block text-right">
                            <div className={`text-2xl font-black tracking-tighter truncate max-w-[150px] ${isLightMode ? 'text-black' : 'text-white'}`}>
                                {currentOpponent ? currentOpponent.name : 'OPPONENT'}
                            </div>
                            <div className={`text-xs font-bold uppercase tracking-widest ${themeVars.textMuted}`}>Away</div>
                        </div>
                         {currentOpponent ? (
                             (simMode !== 'LEAGUE') ? (
                                 <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center font-bold text-xl shadow-lg ${simMode === 'AFCON' ? 'bg-red-900 border-green-500 text-green-200' : simMode === 'ASIAN' ? 'bg-red-900 border-amber-500 text-amber-200' : simMode === 'COPA' ? 'bg-green-900 border-yellow-500 text-yellow-200' : simMode === 'EURO' ? 'bg-blue-900 border-white text-white' : 'bg-cyan-900 border-cyan-500 text-cyan-200'}`}>{currentOpponent.name.substring(0,2)}</div>
                             ) : (
                                 <TeamLogo name={currentOpponent.name} color={currentOpponent.color} size="lg" />
                             )
                         ) : (
                             <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center ${isLightMode ? 'bg-gray-100 border-gray-300' : 'bg-slate-800 border-slate-700'}`}>
                                 <Shield className={`w-6 h-6 ${isLightMode ? 'text-gray-400' : 'text-slate-600'}`} />
                             </div>
                         )}
                    </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent pointer-events-none"></div>
                <div className={`absolute bottom-0 left-0 w-full h-px ${isLightMode ? 'bg-gradient-to-r from-transparent via-gray-300 to-transparent' : 'bg-gradient-to-r from-transparent via-slate-700 to-transparent'}`}></div>
            </div>

            {/* LIVE PITCH VIEW (Standard vs World Cup vs Penalties) */}
            {(phase === 'LIVE' || phase === 'PENALTIES') && (
                <div className="relative w-full h-64 md:h-96 bg-slate-950 overflow-hidden shadow-inner group">
                    
                    {/* STADIUM STANDS (VISUAL ONLY) */}
                    {stadiumLevel > 1 && (
                        <div 
                            className="absolute inset-0 pointer-events-auto cursor-pointer group/stands"
                            onClick={() => setShowStadiumUpgradeModal(true)} // Clicking stands opens Upgrade Modal
                            title="Click to Upgrade Stadium"
                        >
                            {/* TOP STAND */}
                            <div className="absolute top-0 left-0 right-0 h-16 bg-slate-900 border-b-4 border-slate-800 z-10 overflow-hidden hover:bg-slate-800/80 transition-colors">
                                <div className="absolute inset-0 opacity-30" style={{ 
                                    backgroundImage: `radial-gradient(circle, ${STADIUM_LEVELS[stadiumLevel-1].seatColor} 2px, transparent 2.5px)`, 
                                    backgroundSize: '10px 10px' 
                                }}></div>
                                {/* Crowd Overlay */}
                                <div className="absolute inset-0 opacity-50 transition-opacity duration-1000" style={{
                                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1.5px)',
                                    backgroundSize: '8px 8px',
                                    opacity: Math.min(0.8, (fans / STADIUM_LEVELS[stadiumLevel-1].capacity))
                                }}></div>
                            </div>

                            {/* BOTTOM STAND */}
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-slate-900 border-t-4 border-slate-800 z-10 overflow-hidden hover:bg-slate-800/80 transition-colors">
                                <div className="absolute inset-0 opacity-30" style={{ 
                                    backgroundImage: `radial-gradient(circle, ${STADIUM_LEVELS[stadiumLevel-1].seatColor} 2px, transparent 2.5px)`, 
                                    backgroundSize: '10px 10px' 
                                }}></div>
                                {/* Crowd Overlay */}
                                <div className="absolute inset-0 opacity-50 transition-opacity duration-1000" style={{
                                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1.5px)',
                                    backgroundSize: '8px 8px',
                                    opacity: Math.min(0.8, (fans / STADIUM_LEVELS[stadiumLevel-1].capacity))
                                }}></div>
                            </div>

                            {/* Upgrade Tooltip on Hover */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 opacity-0 group-hover/stands:opacity-100 transition-opacity bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 pointer-events-none shadow-xl backdrop-blur-sm">
                                <Hammer className="w-3 h-3 inline mr-1" /> Manage Stadium
                            </div>
                        </div>
                    )}

                    {/* AD BOARD - FAR SIDE (TOP) */}
                    <div className="absolute top-16 left-12 right-12 h-8 bg-slate-900/90 z-20 border-y-2 border-slate-700 flex items-center overflow-hidden perspective-[500px] shadow-lg rounded-b-lg">
                        <div className="animate-marquee flex gap-12 whitespace-nowrap opacity-90 w-full">
                            {[...AD_BANNERS, ...AD_BANNERS].map((ad, i) => (
                                <div key={i} className={`font-mono font-black text-xs md:text-sm ${ad.color} flex items-center gap-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] shrink-0`}>
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    {ad.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Render the appropriate pitch based on mode */}
                    {simMode === 'WORLD_CUP' ? (
                        // DUBAI SKY-OCEAN ARENA (World Cup Mode)
                        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
                            {/* Ambient Space/Sky Background */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black"></div>
                            <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '100px 100px'}}></div>
                            
                            <div className="absolute bottom-0 w-full h-2/3 opacity-40 pointer-events-none flex items-end justify-center gap-2 z-0 transform scale-110 origin-bottom">
                                <div className="w-10 h-40 bg-gradient-to-t from-cyan-900 to-transparent border-t border-cyan-500/30"></div>
                                <div className="w-20 h-96 bg-gradient-to-t from-slate-900 via-slate-800 to-transparent border-t border-cyan-400/30 relative z-10"></div>
                                <div className="w-12 h-48 bg-gradient-to-t from-cyan-900 to-transparent border-t border-cyan-500/30"></div>
                            </div>
                            <div className="absolute inset-12 md:inset-16 border border-cyan-500/40 rounded-3xl bg-slate-900/20 backdrop-blur-[2px] shadow-[0_0_100px_rgba(6,182,212,0.15)] overflow-hidden z-10">
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,182,212,0.02),rgba(6,182,212,0.1))]"></div>
                                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.4) 1px, transparent 1px)', backgroundSize: '40px 40px', transform: 'perspective(500px) rotateX(10deg) scale(1.1)' }}></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-cyan-400 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-t-0 border-cyan-400 rounded-b-xl bg-cyan-500/10"></div>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-b-0 border-cyan-400 rounded-t-xl bg-cyan-500/10"></div>
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-cyan-400/50 shadow-[0_0_10px_cyan]"></div>
                            </div>
                        </div>
                    ) : simMode === 'AFCON' ? (
                        // MOROCCO NEON ARENA (AFCON Mode)
                        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/30 via-black to-black"></div>
                            {/* Grid Floor - Green lines */}
                            <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'linear-gradient(rgba(22,163,74,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(22,163,74,0.3) 1px, transparent 1px)', backgroundSize: '50px 50px', transform: 'perspective(500px) rotateX(20deg) scale(1.2)'}}></div>
                            
                            {/* Stadium Structure - Red Borders */}
                            <div className="absolute inset-12 md:inset-16 border-2 border-red-600 rounded-3xl bg-black/40 backdrop-blur-sm shadow-[0_0_50px_rgba(220,38,38,0.3)] overflow-hidden z-10">
                                {/* Center Star (Morocco Flag Theme) */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-600 opacity-50 transform scale-[3]">
                                    <Star className="w-24 h-24 fill-current" />
                                </div>
                                
                                {/* Center Circle - Green */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-green-600 rounded-full shadow-[0_0_20px_#16a34a]"></div>
                                {/* Midline - Green */}
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-green-600/50 shadow-[0_0_10px_#16a34a]"></div>
                                {/* Boxes - Red Tint */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 border-2 border-t-0 border-red-600 bg-red-900/10"></div>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 border-2 border-b-0 border-red-600 bg-red-900/10"></div>
                            </div>
                        </div>
                    ) : (
                        // STANDARD LEAGUE PITCH
                        <div className="absolute inset-0 bg-slate-900">
                            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,0,0,0.1) 50px, rgba(0,0,0,0.1) 100px)'}}></div>
                            <div className="absolute inset-12 md:inset-16 border-2 border-white/60 rounded-lg bg-green-700 shadow-inner">
                                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.1) 50%)', backgroundSize: '50px 50px'}}></div>
                                <div className="absolute top-1/2 left-12 right-12 h-px bg-white/60"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/60 rounded-full"></div>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 border-2 border-t-0 border-white/60"></div>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 border-2 border-b-0 border-white/60"></div>
                            </div>
                        </div>
                    )}

                    {/* LIVE BETTING OVERLAY */}
                    {liveBets.length > 0 && phase === 'LIVE' && (
                        <div className="absolute top-10 left-10 z-40 bg-black/70 backdrop-blur-md p-2 rounded-lg border border-green-500/50 max-w-[200px]">
                            <h4 className="text-xs font-bold text-green-400 uppercase mb-2 flex items-center gap-1">
                                <Banknote className="w-3 h-3" /> Active Bets
                            </h4>
                            <div className="space-y-1">
                                {liveBets.map(bet => (
                                    <div key={bet.id} className="text-[10px] text-white flex justify-between bg-white/10 p-1 rounded">
                                        <span>{bet.label}</span>
                                        <span className="font-mono font-bold">${bet.amount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* OPEN BETTING BUTTON */}
                    {phase === 'LIVE' && !showLiveBetting && (
                        <button 
                            onClick={() => setShowLiveBetting(true)}
                            className="absolute bottom-28 right-4 z-40 bg-green-600 hover:bg-green-500 text-white font-bold p-3 rounded-full shadow-lg border-2 border-white flex items-center gap-2 animate-bounce"
                        >
                            <Banknote className="w-5 h-5" />
                            <span className="text-xs uppercase">Live Bet</span>
                        </button>
                    )}

                    {/* PENALTY SHOOTOUT OVERLAY */}
                    {phase === 'PENALTIES' && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
                            <div className="text-center mb-8">
                                <h3 className="text-3xl font-black text-white uppercase mb-2 tracking-widest drop-shadow-lg">Penalty Shootout</h3>
                                <div className="flex items-center justify-center gap-4 text-sm font-bold bg-black/40 px-4 py-2 rounded-full border border-white/10">
                                    <div className="flex gap-1">
                                        {penaltyState.homeHistory.map((res, i) => (
                                            <div key={i} className={`w-3 h-3 rounded-full ${res ? 'bg-green-500 shadow-[0_0_5px_lime]' : 'bg-red-500'}`}></div>
                                        ))}
                                        {Array.from({length: Math.max(0, 5 - penaltyState.homeHistory.length)}).map((_, i) => (
                                            <div key={i} className="w-3 h-3 rounded-full bg-white/20"></div>
                                        ))}
                                    </div>
                                    <span className="text-white font-mono">{penaltyState.homeScore} - {penaltyState.awayScore}</span>
                                    <div className="flex gap-1">
                                        {penaltyState.awayHistory.map((res, i) => (
                                            <div key={i} className={`w-3 h-3 rounded-full ${res ? 'bg-green-500 shadow-[0_0_5px_lime]' : 'bg-red-500'}`}></div>
                                        ))}
                                        {Array.from({length: Math.max(0, 5 - penaltyState.awayHistory.length)}).map((_, i) => (
                                            <div key={i} className="w-3 h-3 rounded-full bg-white/20"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="relative mb-8">
                                <div className="text-xl font-bold text-white mb-4 animate-pulse">
                                    {penaltyState.isPlayerTurn ? "🎯 SHOOT! Pick a spot." : "🧤 SAVE! Guess the direction."}
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => handlePenaltyGuess('LEFT')}
                                        className="w-24 h-24 bg-slate-800/80 hover:bg-orange-500/80 border-2 border-slate-600 hover:border-orange-400 rounded-xl flex flex-col items-center justify-center transition-all group"
                                    >
                                        <MoveLeft className="w-8 h-8 text-white group-hover:scale-125 transition-transform" />
                                        <span className="text-xs font-bold text-slate-300 group-hover:text-white mt-2">LEFT</span>
                                    </button>
                                    <button 
                                        onClick={() => handlePenaltyGuess('MIDDLE')}
                                        className="w-24 h-24 bg-slate-800/80 hover:bg-orange-500/80 border-2 border-slate-600 hover:border-orange-400 rounded-xl flex flex-col items-center justify-center transition-all group"
                                    >
                                        <Circle className="w-8 h-8 text-white group-hover:scale-125 transition-transform" />
                                        <span className="text-xs font-bold text-slate-300 group-hover:text-white mt-2">MIDDLE</span>
                                    </button>
                                    <button 
                                        onClick={() => handlePenaltyGuess('RIGHT')}
                                        className="w-24 h-24 bg-slate-800/80 hover:bg-orange-500/80 border-2 border-slate-600 hover:border-orange-400 rounded-xl flex flex-col items-center justify-center transition-all group"
                                    >
                                        <MoveRight className="w-8 h-8 text-white group-hover:scale-125 transition-transform" />
                                        <span className="text-xs font-bold text-slate-300 group-hover:text-white mt-2">RIGHT</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HUD / Commentary Overlay */}
                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent pointer-events-none pb-6">
                        <div className="text-center">
                            <div className={`text-lg md:text-2xl font-bold mb-2 ${simMode === 'WORLD_CUP' ? 'text-cyan-400 drop-shadow-[0_0_5px_cyan]' : simMode === 'AFCON' ? 'text-yellow-400 drop-shadow-[0_0_5px_gold]' : 'text-white'}`}>
                                {commentary}
                            </div>
                            {phase === 'LIVE' && (
                                <div className="text-xs text-slate-400 font-mono">
                                    Possession: {possession}% - {100 - possession}%
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <style>{`
                        @keyframes marquee-vertical {
                            0% { transform: translateY(0); }
                            100% { transform: translateY(-50%); }
                        }
                        .animate-marquee-vertical {
                            animation: marquee-vertical 20s linear infinite;
                        }
                        @keyframes marquee-reverse {
                            0% { transform: translateX(-50%); }
                            100% { transform: translateX(0); }
                        }
                        .animate-marquee-reverse {
                            animation: marquee-reverse 20s linear infinite;
                        }
                    `}</style>
                </div>
            )}
            
            {/* OTHER PHASES */}
            {phase === 'PRE_MATCH' && (
                <div className={`min-h-[400px] ${isLightMode ? 'bg-white' : 'bg-slate-900'}`}>
                    <div className={`flex border-b ${isLightMode ? 'bg-gray-100 border-gray-300' : 'bg-slate-800 border-slate-700'}`}>
                        {['SQUAD', 'LEAGUE', 'TRANSFERS', 'ACADEMY', 'OFFICE'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab as any)} 
                                className={`flex-1 py-3 text-xs font-bold transition-colors ${activeTab === tab ? (isLightMode ? 'bg-white text-black border-b-2 border-red-500' : 'bg-slate-700 text-white border-b-2 border-orange-500') : (isLightMode ? 'text-gray-500 hover:text-black' : 'text-slate-400 hover:text-white')}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-4">
                        {activeTab === 'SQUAD' && (
// ... existing squad code ...
                            <div className="space-y-4">
                                <div className="flex gap-4 mb-4">
                                    <div className={`flex-1 p-2 rounded-lg border ${themeVars.bgCard}`}>
                                        <div className={`text-[10px] uppercase font-bold mb-1 ${themeVars.textMuted}`}>Tactics</div>
                                        <div className="flex gap-1">
                                            {['ATTACK', 'BALANCED', 'DEFENSE'].map((t) => (
                                                <button 
                                                    key={t}
                                                    onClick={() => setTactic(t as any)}
                                                    className={`flex-1 py-1 rounded text-[10px] font-bold ${tactic === t ? 'bg-orange-600 text-white' : (isLightMode ? 'bg-gray-200 text-gray-600' : 'bg-slate-700 text-slate-400')}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`flex-1 p-2 rounded-lg border ${themeVars.bgCard}`}>
                                        <div className={`text-[10px] uppercase font-bold mb-1 ${themeVars.textMuted}`}>Formation</div>
                                        <div className="flex gap-1">
                                            {['1-2-1', '2-2', '3-1'].map((f) => (
                                                <button 
                                                    key={f}
                                                    onClick={() => setFormation(f as any)}
                                                    className={`flex-1 py-1 rounded text-[10px] font-bold ${formation === f ? 'bg-blue-600 text-white' : (isLightMode ? 'bg-gray-200 text-gray-600' : 'bg-slate-700 text-slate-400')}`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <h3 className={`text-xs font-bold uppercase mb-2 ${themeVars.textMuted}`}>Starting V (Select 5)</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {myPlayers.map(player => (
                                        <PlayerCard 
                                            key={player.id} 
                                            player={player} 
                                            selected={selectedSquad.includes(player.id)}
                                            onAction={() => togglePlayer(player.id)}
                                            actionLabel={selectedSquad.includes(player.id) ? 'Remove' : 'Select'}
                                            disabled={!selectedSquad.includes(player.id) && selectedSquad.length >= 5}
                                            hidePrice
                                            isLightMode={isLightMode}
                                        />
                                    ))}
                                </div>

                                <button 
                                    onClick={prepareMatch}
                                    disabled={selectedSquad.length !== 5 || balance < MATCH_COST}
                                    className="w-full py-4 mt-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:bg-slate-700 text-white font-bold rounded-xl shadow-lg uppercase flex items-center justify-center gap-2 relative overflow-hidden group"
                                >
                                    {/* Floating Footballs Animation */}
                                    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                                        {[...Array(5)].map((_, i) => (
                                            <div 
                                                key={i}
                                                className="absolute text-xs animate-float-football opacity-0"
                                                style={{
                                                    left: '50%',
                                                    top: '50%',
                                                    '--tx': `${(Math.random() - 0.5) * 150}px`,
                                                    '--ty': `${(Math.random() - 0.5) * 80}px`,
                                                    '--rot': `${Math.random() * 720 - 360}deg`,
                                                    animationDelay: `${i * 0.3}s`
                                                } as React.CSSProperties}
                                            >
                                                ⚽
                                            </div>
                                        ))}
                                    </div>
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <Play className="w-5 h-5 fill-current" /> Match Day (Cost ${MATCH_COST})
                                    </span>
                                </button>
                                {balance < MATCH_COST && <div className="text-center text-xs text-red-500 mt-2 font-bold">Insufficient Funds</div>}
                            </div>
                        )}

                        {activeTab === 'LEAGUE' && (
                             <div className="space-y-6">
                                {simMode === 'LEAGUE' ? (
                                    <>
                                        <div className={`rounded-xl border overflow-hidden shadow-lg ${themeVars.bgCard}`}>
                                            <div className={`px-4 py-3 border-b flex justify-between items-center ${isLightMode ? 'bg-gray-100 border-gray-300' : 'bg-slate-800 border-slate-700'}`}>
                                                <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isLightMode ? 'text-black' : 'text-white'}`}>
                                                    <Trophy className="w-4 h-4 text-yellow-500" /> League Standings
                                                </h3>
                                                <span className={`text-[10px] px-2 py-1 rounded ${isLightMode ? 'bg-gray-200 text-gray-600' : 'bg-slate-700 text-slate-300'}`}>Season 2050</span>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm min-w-[300px]">
                                                    <thead className={`${isLightMode ? 'bg-gray-200 text-gray-600' : 'bg-slate-950 text-slate-400'} font-bold uppercase text-[10px] tracking-wider`}>
                                                        <tr>
                                                            <th className="px-4 py-3">#</th>
                                                            <th className="px-4 py-3 w-full">Team</th>
                                                            <th className="px-2 py-3 text-center">PL</th>
                                                            <th className="px-2 py-3 text-center">GD</th>
                                                            <th className={`px-4 py-3 text-center ${isLightMode ? 'text-black' : 'text-white'}`}>PTS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className={`divide-y ${isLightMode ? 'divide-gray-200' : 'divide-slate-800'}`}>
                                                        {leagueTable.map((team, idx) => (
                                                            <tr 
                                                                key={team.id} 
                                                                className={`transition-colors ${
                                                                    team.id === 'player' 
                                                                    ? (isLightMode ? 'bg-orange-100 hover:bg-orange-200' : 'bg-orange-500/10 hover:bg-orange-500/20')
                                                                    : (isLightMode ? 'hover:bg-gray-50' : 'hover:bg-slate-800/50')
                                                                }`}
                                                            >
                                                                <td className={`px-4 py-3 font-mono text-xs align-middle ${themeVars.textMuted}`}>
                                                                    {idx + 1}
                                                                    {idx === 0 && <span className="ml-1 text-lg leading-none">👑</span>}
                                                                    {idx >= leagueTable.length - 3 && <span className="ml-1 text-red-500 text-lg leading-none">•</span>}
                                                                </td>
                                                                <td className="px-4 py-3 font-bold flex items-center gap-3 align-middle">
                                                                    <TeamLogo 
                                                                        name={team.name} 
                                                                        color={team.id === 'player' ? (TEAM_SKINS.find(s => s.id === activeSkin)?.class || 'bg-orange-500') : team.color} 
                                                                        size="sm"
                                                                        textColor={team.id === 'player' ? TEAM_SKINS.find(s => s.id === activeSkin)?.textColor : undefined} 
                                                                    />
                                                                    <span className={`truncate ${team.id === 'player' ? 'text-orange-500' : (isLightMode ? 'text-black' : 'text-slate-200')}`}>
                                                                        {team.name}
                                                                    </span>
                                                                    {team.id === 'player' && <span className="text-[10px] bg-orange-500 text-black px-1.5 rounded font-bold hidden sm:inline-block">YOU</span>}
                                                                </td>
                                                                <td className={`px-2 py-3 text-center font-mono text-xs align-middle ${themeVars.textMuted}`}>{team.played}</td>
                                                                <td className={`px-2 py-3 text-center font-mono text-xs align-middle ${themeVars.textMuted}`}>
                                                                    <span className={(team.gf - team.ga) > 0 ? 'text-green-500' : (team.gf - team.ga) < 0 ? 'text-red-500' : ''}>
                                                                        {(team.gf - team.ga) > 0 ? '+' : ''}{team.gf - team.ga}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center align-middle">
                                                                    <span className={`font-mono font-black text-base px-2 py-1 rounded border ${isLightMode ? 'bg-white border-gray-300 text-black' : 'bg-slate-800 border-slate-700 text-white'}`}>
                                                                        {team.points}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            {/* World Cup Card */}
                                            <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 p-5 rounded-xl border border-blue-500/30 text-center relative overflow-hidden group hover:border-blue-500/50 transition-all shadow-lg">
                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                    <Globe className="w-24 h-24 text-blue-400" />
                                                </div>
                                                <div className="relative z-10">
                                                    <h3 className="text-xl font-black text-white mb-2 uppercase italic tracking-tighter">World Cup 2050</h3>
                                                    <p className="text-sm text-slate-300 mb-6 font-medium">
                                                        Prove yourself on the global stage. High stakes matches.
                                                    </p>
                                                    <button 
                                                        onClick={initWorldCup}
                                                        disabled={balance < WC_ENTRY_COST}
                                                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:bg-slate-700 text-white font-black rounded-xl uppercase shadow-lg tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                                                    >
                                                        <Plane className="w-5 h-5" /> Enter (${WC_ENTRY_COST.toLocaleString()})
                                                    </button>
                                                </div>
                                            </div>

                                            {/* AFCON Card */}
                                            <div className="bg-gradient-to-r from-red-900/40 to-green-900/40 p-5 rounded-xl border border-red-500/30 text-center relative overflow-hidden group hover:border-red-500/50 transition-all shadow-lg">
                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                    <Trophy className="w-24 h-24 text-red-500" />
                                                </div>
                                                <div className="relative z-10">
                                                    <h3 className="text-xl font-black text-white mb-2 uppercase italic tracking-tighter">AFCON 2050</h3>
                                                    <p className="text-sm text-slate-300 mb-6 font-medium">
                                                        Conquer the continent. Yellow Neon Glory.
                                                    </p>
                                                    <div className="flex flex-col gap-2">
                                                        <button 
                                                            onClick={initAfcon}
                                                            disabled={balance < AFCON_ENTRY_COST}
                                                            className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:bg-slate-700 text-white font-black rounded-xl uppercase shadow-lg tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_#dc2626]"
                                                        >
                                                            <Plane className="w-5 h-5" /> Enter (${AFCON_ENTRY_COST.toLocaleString()})
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={() => setShowTicketModal(true)}
                                                            className="w-full py-2 text-xs font-bold text-red-300 hover:text-white border border-red-500/30 hover:border-red-500 rounded-lg uppercase tracking-wide transition-colors flex items-center justify-center gap-2 bg-red-950/30 hover:bg-red-900/50"
                                                        >
                                                            <Ticket className="w-4 h-4" /> Buy Real Ticket (Support Dev)
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Euro 2050 Card */}
                                            <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-5 rounded-xl border border-blue-500/30 text-center relative overflow-hidden group hover:border-blue-500/50 transition-all shadow-lg">
                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                    <Globe className="w-24 h-24 text-blue-400" />
                                                </div>
                                                <div className="relative z-10">
                                                    <h3 className="text-xl font-black text-white mb-2 uppercase italic tracking-tighter">Euro 2050</h3>
                                                    <p className="text-sm text-slate-300 mb-6 font-medium">
                                                        Clash of European Titans. Cold Steel.
                                                    </p>
                                                    <button 
                                                        onClick={initEuro}
                                                        disabled={balance < EURO_ENTRY_COST}
                                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-700 text-white font-black rounded-xl uppercase shadow-lg tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_#2563eb]"
                                                    >
                                                        <Plane className="w-5 h-5" /> Enter (${EURO_ENTRY_COST.toLocaleString()})
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Asian Cup Card */}
                                            <div className="bg-gradient-to-r from-red-900/40 to-amber-900/40 p-5 rounded-xl border border-amber-500/30 text-center relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-lg">
                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                    <Sun className="w-24 h-24 text-amber-500" />
                                                </div>
                                                <div className="relative z-10">
                                                    <h3 className="text-xl font-black text-white mb-2 uppercase italic tracking-tighter">Asian Cup 2050</h3>
                                                    <p className="text-sm text-slate-300 mb-6 font-medium">
                                                        Eastern Dominance. Neon & Tech.
                                                    </p>
                                                    <button 
                                                        onClick={initAsian}
                                                        disabled={balance < ASIAN_ENTRY_COST}
                                                        className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:bg-slate-700 text-white font-black rounded-xl uppercase shadow-lg tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_#d97706]"
                                                    >
                                                        <Plane className="w-5 h-5" /> Enter (${ASIAN_ENTRY_COST.toLocaleString()})
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Copa America Card */}
                                            <div className="bg-gradient-to-r from-yellow-900/40 to-green-900/40 p-5 rounded-xl border border-green-500/30 text-center relative overflow-hidden group hover:border-green-500/50 transition-all shadow-lg md:col-span-2">
                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                    <Flame className="w-24 h-24 text-yellow-500" />
                                                </div>
                                                <div className="relative z-10">
                                                    <h3 className="text-xl font-black text-white mb-2 uppercase italic tracking-tighter">Copa 2050</h3>
                                                    <p className="text-sm text-slate-300 mb-6 font-medium">
                                                        Pan-American Glory. Passion & Heat.
                                                    </p>
                                                    <button 
                                                        onClick={initCopa}
                                                        disabled={balance < COPA_ENTRY_COST}
                                                        className="w-full py-4 bg-gradient-to-r from-yellow-500 to-green-600 hover:from-yellow-400 hover:to-green-500 disabled:opacity-50 disabled:bg-slate-700 text-white font-black rounded-xl uppercase shadow-lg tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_#16a34a]"
                                                    >
                                                        <Plane className="w-5 h-5" /> Enter (${COPA_ENTRY_COST.toLocaleString()})
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center">
// ... existing tournament hub logic ...
                                        <div className={`p-6 rounded-2xl border mb-6 relative overflow-hidden shadow-2xl ${simMode === 'AFCON' ? 'bg-yellow-900/20 border-yellow-500/30' : simMode === 'ASIAN' ? 'bg-red-900/20 border-amber-500/30' : simMode === 'COPA' ? 'bg-green-900/20 border-yellow-500/30' : simMode === 'EURO' ? 'bg-blue-900/20 border-blue-500/30' : 'bg-cyan-900/20 border-cyan-500/30'}`}>
                                            <div className="absolute top-0 right-0 p-4 opacity-10"><Globe className={`w-32 h-32 ${simMode === 'AFCON' ? 'text-yellow-500' : simMode === 'ASIAN' ? 'text-amber-500' : simMode === 'COPA' ? 'text-green-500' : simMode === 'EURO' ? 'text-blue-500' : 'text-cyan-500'}`} /></div>
                                            <h2 className={`text-3xl font-black uppercase mb-2 tracking-tighter ${getSimTheme().text}`}>
                                                {getSimTheme().title}
                                            </h2>
                                            <div className={`inline-block px-4 py-1 rounded-full border font-mono font-bold text-sm mb-6 ${simMode === 'AFCON' ? 'bg-yellow-950 border-yellow-700 text-yellow-200' : 'bg-slate-900 border-slate-700 text-slate-200'}`}>
                                                Current Stage: <span className="text-white">{wcRound.replace('RO', 'Round of ')}</span>
                                            </div>
                                            
                                            {wcTitleWon ? (
                                                <div className="animate-bounce-in py-8">
                                                    <div className="relative inline-block">
                                                        <Trophy className="w-32 h-32 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_25px_gold] animate-pulse" />
                                                        <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full"></div>
                                                    </div>
                                                    <h3 className="text-4xl font-black text-white mb-2 uppercase italic">Champions!</h3>
                                                    <p className="text-slate-300 mb-8 text-lg">You have conquered the world. The trophy comes home.</p>
                                                    <button 
                                                        onClick={() => {
                                                            setSimMode('LEAGUE');
                                                            setPhase('PRE_MATCH');
                                                        }}
                                                        className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-xl"
                                                    >
                                                        Return Home
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3 max-w-2xl mx-auto">
                                                    {wcMatches.map(m => (
                                                        <div key={m.id} className={`flex justify-between items-center p-3 rounded-lg border transition-all ${m.isUserMatch ? (simMode === 'AFCON' ? 'bg-yellow-900/40 border-yellow-500 shadow-[0_0_10px_gold]' : simMode === 'COPA' ? 'bg-green-900/40 border-yellow-500 shadow-[0_0_10px_yellow]' : simMode === 'EURO' ? 'bg-blue-900/40 border-blue-500 shadow-[0_0_10px_blue]' : simMode === 'ASIAN' ? 'bg-amber-900/40 border-amber-500 shadow-[0_0_10px_orange]' : 'bg-cyan-900/40 border-cyan-500 shadow-[0_0_10px_cyan]') : 'bg-slate-800 border-slate-700 opacity-60'}`}>
                                                            <span className={`text-xs md:text-sm font-bold w-1/3 text-left ${m.winner === m.home ? 'text-green-400' : 'text-white'}`}>{m.home}</span>
                                                            {m.played ? (
                                                                <span className={`text-sm font-mono bg-black/50 px-3 py-1 rounded font-bold tracking-widest border border-white/10 ${simMode === 'AFCON' ? 'text-yellow-200' : 'text-cyan-200'}`}>{m.score?.home} - {m.score?.away}</span>
                                                            ) : (
                                                                <span className="text-[10px] text-slate-500 font-bold uppercase bg-slate-900 px-2 py-1 rounded">VS</span>
                                                            )}
                                                            <span className={`text-xs md:text-sm font-bold w-1/3 text-right ${m.winner === m.away ? 'text-green-400' : 'text-white'}`}>{m.away}</span>
                                                        </div>
                                                    ))}
                                                    
                                                    {!wcMatches.find(m => m.isUserMatch && !m.played) ? (
                                                        <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
                                                            <p className="text-slate-400 text-sm">Round Complete. Proceeding...</p>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={prepareMatch}
                                                            className={`w-full mt-6 py-4 text-black font-black uppercase rounded-xl shadow-lg tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden group ${simMode === 'AFCON' ? 'bg-yellow-500 hover:bg-yellow-400 shadow-[0_0_20px_gold]' : simMode === 'ASIAN' ? 'bg-amber-500 hover:bg-amber-400' : simMode === 'COPA' ? 'bg-green-500 hover:bg-green-400' : simMode === 'EURO' ? 'bg-blue-500 hover:bg-blue-400 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_cyan]'}`}
                                                        >
                                                            {/* Floating Footballs Animation */}
                                                            <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <div 
                                                                        key={i}
                                                                        className="absolute text-xs animate-float-football opacity-0"
                                                                        style={{
                                                                            left: '50%',
                                                                            top: '50%',
                                                                            '--tx': `${(Math.random() - 0.5) * 150}px`,
                                                                            '--ty': `${(Math.random() - 0.5) * 80}px`,
                                                                            '--rot': `${Math.random() * 720 - 360}deg`,
                                                                            animationDelay: `${i * 0.3}s`
                                                                        } as React.CSSProperties}
                                                                    >
                                                                        ⚽
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                                <Play className="w-5 h-5 fill-current" /> Play Next Match
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                             </div>
                        )}

                        {activeTab === 'TRANSFERS' && (
// ... existing transfers code ...
                             <div className="space-y-4">
                                 <h3 className={`text-xs font-bold uppercase ${themeVars.textMuted}`}>Scouted Talent</h3>
                                 <div className="grid grid-cols-2 gap-2">
                                     {marketPlayers.map(player => (
                                         <PlayerCard 
                                             key={player.id} 
                                             player={player} 
                                             onAction={() => buyPlayer(player)}
                                             actionLabel="Sign"
                                             actionPrice={player.value}
                                             disabled={balance < player.value}
                                             isLightMode={isLightMode}
                                         />
                                     ))}
                                 </div>
                             </div>
                        )}

                        {activeTab === 'ACADEMY' && (
// ... existing academy code ...
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className={`p-2 rounded text-center border ${themeVars.bgCard}`}>
                                        <div className={`text-[10px] uppercase font-bold ${themeVars.textMuted}`}>PHY</div>
                                        <div className={`text-xl font-black ${isLightMode ? 'text-black' : 'text-white'}`}>{trainingLevels.PHYSICAL}</div>
                                    </div>
                                    <div className={`p-2 rounded text-center border ${themeVars.bgCard}`}>
                                        <div className={`text-[10px] uppercase font-bold ${themeVars.textMuted}`}>TEC</div>
                                        <div className={`text-xl font-black ${isLightMode ? 'text-black' : 'text-white'}`}>{trainingLevels.TECHNICAL}</div>
                                    </div>
                                    <div className={`p-2 rounded text-center border ${themeVars.bgCard}`}>
                                        <div className={`text-[10px] uppercase font-bold ${themeVars.textMuted}`}>TAC</div>
                                        <div className={`text-xl font-black ${isLightMode ? 'text-black' : 'text-white'}`}>{trainingLevels.TACTICAL}</div>
                                    </div>
                                </div>

                                <h3 className={`text-xs font-bold uppercase mb-2 ${themeVars.textMuted}`}>Available Drills</h3>
                                <div className="space-y-2">
                                    {DRILLS.map(drill => (
                                        <button
                                            key={drill.id}
                                            onClick={() => startDrill(drill)}
                                            disabled={!!activeDrill}
                                            className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left relative overflow-hidden ${
                                                activeDrill?.id === drill.id 
                                                ? (isLightMode ? 'bg-white border-orange-500' : 'bg-slate-800 border-orange-500') 
                                                : (isLightMode ? 'bg-white border-gray-300 hover:bg-gray-50 disabled:opacity-50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 disabled:opacity-50')
                                            }`}
                                        >
                                            {/* Progress Bar Background */}
                                            {activeDrill?.id === drill.id && (
                                                <div 
                                                    className="absolute left-0 top-0 bottom-0 bg-orange-500/10 transition-all duration-75"
                                                    style={{ width: `${(activeDrill.progress / activeDrill.max) * 100}%` }}
                                                ></div>
                                            )}
                                            
                                            <div className={`p-2 rounded-lg relative z-10 ${isLightMode ? 'bg-gray-100' : 'bg-slate-900'}`}>
                                                {drill.icon}
                                            </div>
                                            <div className="flex-1 relative z-10">
                                                <div className={`font-bold text-sm ${isLightMode ? 'text-black' : 'text-white'}`}>{drill.name}</div>
                                                <div className={`text-[10px] ${themeVars.textMuted}`}>{drill.description}</div>
                                            </div>
                                            {activeDrill?.id === drill.id && (
                                                <div className="text-xs font-bold text-orange-500 relative z-10 animate-pulse">
                                                    TRAINING...
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'OFFICE' && (
                            <div className="space-y-4">
                                {/* Stadium Upgrades */}
                                <div>
                                    <h3 className={`text-xs font-bold uppercase mb-2 flex items-center gap-2 ${themeVars.textMuted}`}>
                                        <Armchair className="w-4 h-4" /> Stadium Infrastructure
                                    </h3>
                                    <div className={`p-4 rounded-xl border ${themeVars.bgCard}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className={`font-black text-lg ${isLightMode ? 'text-black' : 'text-white'}`}>{STADIUM_LEVELS[stadiumLevel-1].name}</div>
                                                <div className={`text-xs ${themeVars.textMuted}`}>Capacity: {STADIUM_LEVELS[stadiumLevel-1].capacity.toLocaleString()}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-[10px] uppercase font-bold ${themeVars.textMuted}`}>Ticket Income</div>
                                                <div className="text-green-500 font-mono font-bold">~${(STADIUM_LEVELS[stadiumLevel-1].capacity * 0.05).toFixed(0)} / match</div>
                                            </div>
                                        </div>
                                        
                                        {stadiumLevel < STADIUM_LEVELS.length ? (
                                            <button 
                                                onClick={buyStadiumUpgrade}
                                                disabled={balance < STADIUM_LEVELS[stadiumLevel].cost}
                                                className="w-full py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <Hammer className="w-4 h-4" /> 
                                                Expand to {STADIUM_LEVELS[stadiumLevel].name} (${STADIUM_LEVELS[stadiumLevel].cost.toLocaleString()})
                                            </button>
                                        ) : (
                                            <div className={`w-full py-2 text-center font-bold rounded-lg text-xs uppercase tracking-wider ${isLightMode ? 'bg-gray-200 text-gray-500' : 'bg-slate-700 text-slate-400'}`}>
                                                Max Level Reached
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* LOCKER ROOM / SKINS */}
                                <div>
                                    <h3 className={`text-xs font-bold uppercase mb-2 flex items-center gap-2 ${themeVars.textMuted}`}>
                                        <Shirt className="w-4 h-4" /> Locker Room
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {TEAM_SKINS.map(skin => {
                                            const isOwned = ownedSkins.includes(skin.id);
                                            const isActive = activeSkin === skin.id;
                                            
                                            return (
                                                <div key={skin.id} className={`rounded-lg p-2 border relative overflow-hidden group ${isActive ? 'border-green-500 ring-1 ring-green-500' : (isLightMode ? 'border-gray-300' : 'border-slate-700')} ${themeVars.bgCard}`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className={`w-8 h-8 rounded-full border-2 border-white/20 shadow-lg flex items-center justify-center font-bold text-xs ${skin.class} ${skin.textColor || 'text-white'}`}>
                                                            B
                                                        </div>
                                                        {isActive && <div className="text-[10px] bg-green-500 text-black font-bold px-1.5 rounded">USED</div>}
                                                    </div>
                                                    
                                                    <div className="mb-2">
                                                        <div className={`font-bold text-xs truncate ${isLightMode ? 'text-black' : 'text-white'}`}>{skin.name}</div>
                                                        <div className={`text-[9px] leading-tight ${themeVars.textMuted}`}>{skin.description}</div>
                                                    </div>

                                                    {isOwned ? (
                                                        <button 
                                                            onClick={() => equipSkin(skin.id)}
                                                            disabled={isActive}
                                                            className={`w-full py-1 rounded text-[10px] font-bold uppercase ${isActive ? (isLightMode ? 'bg-gray-200 text-gray-500' : 'bg-slate-700 text-slate-500') : (isLightMode ? 'bg-gray-200 hover:bg-green-500 hover:text-white text-black' : 'bg-slate-600 hover:bg-green-600 text-white')}`}
                                                        >
                                                            {isActive ? 'Equipped' : 'Equip'}
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => buySkin(skin)}
                                                            disabled={balance < skin.cost}
                                                            className="w-full py-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:bg-slate-700 text-white rounded text-[10px] font-bold uppercase"
                                                        >
                                                            Buy ${skin.cost}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Corporate Deals */}
                                <div>
                                    <h3 className={`text-xs font-bold uppercase mb-2 flex items-center gap-2 ${themeVars.textMuted}`}>
                                        <Building2 className="w-4 h-4" /> Commercial Partners
                                    </h3>
// ... existing corporate deals code ...
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* SPONSORS */}
                                        <div className={`rounded-xl p-3 border ${themeVars.bgCard}`}>
                                            <div className={`text-[10px] font-bold uppercase mb-2 ${themeVars.textMuted}`}>Shirt Sponsor</div>
                                            <div className="space-y-2">
                                                {SPONSORS.map(s => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => fans >= s.requiredFans && setActiveSponsor(s.id)}
                                                        disabled={fans < s.requiredFans}
                                                        className={`w-full p-2 rounded border text-left transition-all ${
                                                            activeSponsor === s.id 
                                                            ? 'bg-blue-900/40 border-blue-500' 
                                                            : (isLightMode ? 'bg-white border-gray-300 hover:bg-gray-50' : 'bg-slate-900 border-slate-800 opacity-80 hover:bg-slate-800')
                                                        } ${fans < s.requiredFans ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                    >
                                                        <div className={`font-bold text-sm ${s.color}`}>{s.name}</div>
                                                        <div className={`flex justify-between text-[10px] ${themeVars.textMuted}`}>
                                                            <span>+${s.incomePerMatch}/match</span>
                                                            {fans < s.requiredFans && <span>Req: {s.requiredFans} Fans</span>}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* TV DEALS */}
                                        <div className={`rounded-xl p-3 border ${themeVars.bgCard}`}>
                                            <div className={`text-[10px] font-bold uppercase mb-2 ${themeVars.textMuted}`}>TV Rights</div>
                                            <div className="space-y-2">
                                                {TV_DEALS.map(tv => (
                                                    <button
                                                        key={tv.id}
                                                        onClick={() => fans >= tv.requiredFans && setActiveTvDeal(tv.id)}
                                                        disabled={fans < tv.requiredFans}
                                                        className={`w-full p-2 rounded border text-left transition-all ${
                                                            activeTvDeal === tv.id 
                                                            ? 'bg-purple-900/40 border-purple-500' 
                                                            : (isLightMode ? 'bg-white border-gray-300 hover:bg-gray-50' : 'bg-slate-900 border-slate-800 opacity-80 hover:bg-slate-800')
                                                        } ${fans < tv.requiredFans ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                    >
                                                        <div className={`font-bold text-sm ${isLightMode ? 'text-black' : 'text-white'}`}>{tv.name}</div>
                                                        <div className={`flex justify-between text-[10px] ${themeVars.textMuted}`}>
                                                            <span>+${tv.incomePerMatch}/match</span>
                                                            {fans < tv.requiredFans && <span>Req: {tv.requiredFans} Fans</span>}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* PR Stunts */}
                                <div>
                                    <h3 className={`text-xs font-bold uppercase mb-2 flex items-center gap-2 ${themeVars.textMuted}`}>
                                        <Megaphone className="w-4 h-4" /> Public Relations
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => performPrStunt('CHARITY')}
                                            disabled={balance < 500}
                                            className="bg-green-900/30 border border-green-500/30 hover:bg-green-900/50 p-3 rounded-lg text-left group"
                                        >
                                            <div className="font-bold text-green-400 text-sm group-hover:text-green-300">Charity Gala</div>
                                            <div className="text-[10px] text-slate-400">Cost: $500</div>
                                            <div className="text-[10px] text-green-200">+300 Fans</div>
                                        </button>
                                        
                                        <button 
                                            onClick={() => performPrStunt('INTERVIEW')}
                                            className="bg-blue-900/30 border border-blue-500/30 hover:bg-blue-900/50 p-3 rounded-lg text-left group"
                                        >
                                            <div className="font-bold text-blue-400 text-sm group-hover:text-blue-300">Press Interview</div>
                                            <div className="text-[10px] text-slate-400">Free</div>
                                            <div className="text-[10px] text-slate-300">Risk: +/- Fans</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Under Table Deals */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-red-400 mb-2 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" /> Dark Arts
                                    </h3>
                                    <button 
                                        onClick={() => setBribeActive(!bribeActive)}
                                        className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all ${
                                            bribeActive 
                                            ? 'bg-red-500/20 border-red-500 text-red-600' 
                                            : (isLightMode ? 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700')
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Handshake className={`w-5 h-5 ${bribeActive ? 'text-red-500' : (isLightMode ? 'text-gray-400' : 'text-slate-500')}`} />
                                            <div className="text-left">
                                                <div className={`font-bold text-sm ${isLightMode ? 'text-black' : 'text-white'}`}>Referee "Donation"</div>
                                                <div className="text-[10px] opacity-70">Increases win chance drastically.</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-xs font-bold">${BRIBE_COST}/match</div>
                                            <div className={`text-[10px] font-bold uppercase ${bribeActive ? 'text-red-500' : (isLightMode ? 'text-gray-400' : 'text-slate-600')}`}>
                                                {bribeActive ? 'ACTIVE' : 'INACTIVE'}
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
