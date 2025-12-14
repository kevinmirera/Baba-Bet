
import React, { useState, useEffect } from 'react';
import { GamePhase, Bet, AutoBetSettings, AutoAction, AutoBetState, UserBetHistoryItem, GameMode } from '../types';
import { ShieldCheck, Target, Unlock, Volume2, VolumeX, Play, StopCircle, RefreshCw, TrendingUp, AlertCircle, ArrowUpRight, History, ChevronDown, ChevronUp, Wine, Laptop, Smartphone, Signal, Timer } from 'lucide-react';
import VoiceBetting from './VoiceBetting';

interface ControlPanelProps {
  balance: number;
  bet: Bet;
  phase: GamePhase;
  onPlaceBet: (amount: number, autoCashOut?: number) => void;
  onCashOut: () => void;
  dailySpent: number;
  dailyLimit: number;
  limitRemoved: boolean;
  onRemoveLimit: () => void;
  removeLimitCost: number;
  isMuted: boolean;
  onToggleMute: () => void;
  // Auto Bet Props
  autoBetState: AutoBetState;
  onStartAutoBet: (settings: AutoBetSettings) => void;
  onStopAutoBet: () => void;
  userHistory: UserBetHistoryItem[];
  // Drunk Prop
  drunkLevel: number;
  gameMode: GameMode;
  isChristmasMode?: boolean;
  // Inventory Props
  inventory?: string[];
  nextCrashPrediction?: number | null;
  isLightMode?: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
    balance, 
    bet, 
    phase, 
    onPlaceBet, 
    onCashOut,
    dailySpent,
    dailyLimit,
    limitRemoved,
    onRemoveLimit,
    removeLimitCost,
    isMuted,
    onToggleMute,
    autoBetState,
    onStartAutoBet,
    onStopAutoBet,
    userHistory,
    drunkLevel,
    gameMode,
    isChristmasMode,
    inventory,
    nextCrashPrediction,
    isLightMode
}) => {
  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Hack State
  const [hackExpiry, setHackExpiry] = useState<number>(0);
  const [hackTimeLeft, setHackTimeLeft] = useState(0);

  // Manual State
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashOut, setAutoCashOut] = useState<string>('');

  // Auto State
  const [autoBaseBet, setAutoBaseBet] = useState(10);
  const [autoTarget, setAutoTarget] = useState<string>('2.00');
  const [autoRounds, setAutoRounds] = useState<string>('10');
  
  const [onWinAction, setOnWinAction] = useState<AutoAction>('RESET');
  const [onWinPercent, setOnWinPercent] = useState<string>('100');
  
  const [onLossAction, setOnLossAction] = useState<AutoAction>('RESET');
  const [onLossPercent, setOnLossPercent] = useState<string>('100');

  // Sync auto state inputs when active state updates (optional, mainly for display)
  useEffect(() => {
    if (autoBetState.isActive) {
        setMode('AUTO');
    }
  }, [autoBetState.isActive]);

  // Hack Timer
  useEffect(() => {
      if (hackExpiry > Date.now()) {
          const interval = setInterval(() => {
              const remaining = Math.max(0, Math.ceil((hackExpiry - Date.now()) / 1000));
              setHackTimeLeft(remaining);
              if (remaining <= 0) {
                  setHackExpiry(0);
              }
          }, 1000);
          setHackTimeLeft(Math.max(0, Math.ceil((hackExpiry - Date.now()) / 1000))); // Initial set
          return () => clearInterval(interval);
      } else {
          setHackTimeLeft(0);
      }
  }, [hackExpiry]);

  const handleActivateHack = () => {
      setHackExpiry(Date.now() + 60000); // 1 Minute
  };

  const handleQuickBet = (amount: number) => {
    if (mode === 'MANUAL') setBetAmount(amount);
    else setAutoBaseBet(amount);
  };

  const handleStartAuto = () => {
      const rounds = parseInt(autoRounds) || 0;
      const target = parseFloat(autoTarget) || 1.1;
      const winPct = parseFloat(onWinPercent) || 0;
      const lossPct = parseFloat(onLossPercent) || 0;

      if (rounds > 0 && autoBaseBet > 0 && target >= 1.01) {
          onStartAutoBet({
              baseBet: autoBaseBet,
              autoCashOut: target,
              rounds: rounds,
              onWin: onWinAction,
              onWinPercent: winPct,
              onLoss: onLossAction,
              onLossPercent: lossPct
          });
      }
  };

  const isBettingClosed = phase === GamePhase.FLYING || phase === GamePhase.CRASHED;
  const isFlying = phase === GamePhase.FLYING;
  const hasBet = bet.amount > 0;
  
  const remainingLimit = Math.max(0, dailyLimit - dailySpent);
  const limitProgress = Math.min((dailySpent / dailyLimit) * 100, 100);
  const isLimitReached = !limitRemoved && dailySpent >= dailyLimit;
  
  // Drunk Logic - Only locks out standard orange game
  const isWasted = drunkLevel >= 80 && gameMode === 'ORANGE';
  
  // Manual Validation Logic
  const canAfford = balance >= betAmount;
  const withinLimit = limitRemoved || (betAmount <= remainingLimit);
  const isValidBet = canAfford && withinLimit && betAmount > 0;

  // Determine error message for manual bet input
  let manualBetError: string | null = null;
  if (mode === 'MANUAL' && betAmount > 0) {
      if (!canAfford) {
          manualBetError = "Insufficient balance";
      } else if (!withinLimit) {
          manualBetError = `Exceeds limit (Left: $${remainingLimit})`;
      }
  }

  // Handle immediate voice bet
  const handleVoiceBet = (amount: number) => {
      setBetAmount(amount);
      if (!isBettingClosed && !hasBet && !isWasted) {
          // Check affordablity specifically for the voice amount
          const canAffordVoice = balance >= amount;
          const withinLimitVoice = limitRemoved || (amount <= remainingLimit);
          
          if (canAffordVoice && withinLimitVoice) {
              onPlaceBet(amount, autoCashOut ? Number(autoCashOut) : undefined);
          }
      }
  };

  // Button Labels based on Game Mode
  const getBetButtonLabel = () => {
      if (phase === GamePhase.CRASHED || phase === GamePhase.FLYING) return 'Wait for Round';
      if (gameMode === 'SANTA') return 'THROW SNOWBALL';
      if (gameMode === 'FOOTBALL') return 'KICK OFF';
      if (gameMode === 'GOLF') return 'TEE OFF';
      if (gameMode === 'BEE') return 'RELEASE BEE';
      if (gameMode === 'SPACE') return 'LAUNCH COMET';
      if (gameMode === 'CARPET') return 'TAKE FLIGHT';
      if (gameMode === 'CANCER') return 'CRUSH IT';
      return 'Place Bet';
  };

  // Christmas Style Overrides
  const mainBtnClass = isChristmasMode && !isBettingClosed && isValidBet
    ? "bg-[repeating-linear-gradient(45deg,#ef4444,#ef4444_10px,#fca5a5_10px,#fca5a5_20px)] border-red-200 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
    : isBettingClosed || !isValidBet
    ? (isLightMode ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-slate-700 text-slate-500 border-slate-800 cursor-not-allowed')
    : (isLightMode ? 'bg-red-600 hover:bg-red-500 text-white border-red-800 shadow-md' : 'bg-green-600 hover:bg-green-500 text-white border-green-800 shadow-[0_0_15px_rgba(34,197,94,0.3)]');

  // Has Laptop?
  const hasLaptop = inventory?.includes('m_laptop');
  const isHackActive = hackExpiry > Date.now();

  const containerClass = isLightMode 
      ? 'bg-white border-black text-black' 
      : 'bg-slate-800 border-slate-700 text-white';
  
  const cardClass = isLightMode ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-700';
  const inputClass = isLightMode ? 'bg-gray-50 border-gray-300 text-black' : 'bg-slate-900 border-slate-700 text-white';
  const labelClass = isLightMode ? 'text-gray-500' : 'text-slate-500';

  return (
    <div className={`w-full rounded-xl p-4 md:p-6 shadow-2xl border-t relative overflow-hidden space-y-4 ${isChristmasMode ? 'border-red-500' : (isLightMode ? 'border-gray-300' : 'border-slate-700')} ${containerClass}`}>
        
        {/* Decorative Snow for UI */}
        {isChristmasMode && (
             <div className="absolute top-0 left-0 w-full h-3 bg-white/10 rounded-t-xl" style={{ backgroundImage: 'radial-gradient(circle, white 2px, transparent 2.5px)', backgroundSize: '10px 10px', opacity: 0.5 }}></div>
        )}

        {/* PRO LAPTOP PREDICTION WIDGET */}
        {hasLaptop && (
            isHackActive ? (
                <div className="bg-black/80 font-mono p-3 rounded-lg border border-green-500/50 text-green-400 relative overflow-hidden shadow-[0_0_20px_rgba(34,197,94,0.15)] flex flex-col gap-1 animate-in fade-in zoom-in-95">
                    <div className="absolute top-0 left-0 w-full h-full bg-green-500/5 pointer-events-none"></div>
                    <div className="flex justify-between items-center z-10 border-b border-green-500/30 pb-1 mb-1">
                        <span className="text-[10px] font-bold uppercase flex items-center gap-2">
                            <Laptop className="w-3 h-3" /> System_Hack_v9.exe
                        </span>
                        <span className="text-[10px] flex items-center gap-1 text-red-400 font-bold animate-pulse">
                            <Timer className="w-3 h-3" /> {hackTimeLeft}s
                        </span>
                    </div>
                    <div className="z-10 text-xs">
                        <span className="opacity-70">Computing Trajectory... </span>
                        <span className="font-bold text-white">Done.</span>
                    </div>
                    <div className="z-10 flex items-center justify-between mt-1">
                        <span className="text-[10px] text-green-600 uppercase font-bold">Predicted Crash</span>
                        <span className="text-xl font-bold text-white tabular-nums drop-shadow-[0_0_5px_lime]">
                            {nextCrashPrediction ? nextCrashPrediction.toFixed(2) + 'x' : 'CALCULATING...'}
                        </span>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={handleActivateHack}
                    className={`w-full font-mono p-3 rounded-lg border transition-all flex items-center justify-center gap-3 group shadow-lg ${isLightMode ? 'bg-gray-100 hover:bg-white border-gray-300 hover:border-black text-gray-600 hover:text-black' : 'bg-slate-900 hover:bg-slate-950 border-slate-600 hover:border-green-500 text-slate-400 hover:text-green-400'}`}
                >
                    <div className={`p-1.5 rounded transition-colors ${isLightMode ? 'bg-white group-hover:bg-gray-200' : 'bg-slate-800 group-hover:bg-green-900/30'}`}>
                        <Laptop className="w-4 h-4 group-hover:animate-pulse" />
                    </div>
                    <div className="text-left">
                        <div className="text-xs font-bold tracking-widest uppercase">Initiate System Hack</div>
                        <div className="text-[9px] opacity-60">Duration: 60s</div>
                    </div>
                </button>
            )
        )}

        {/* Ministry of Health Warning */}
        {drunkLevel >= 40 && (
             <div className={`p-2 rounded flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider ${drunkLevel >= 80 ? 'bg-red-500 text-white animate-pulse' : 'bg-yellow-500/20 text-yellow-600'}`}>
                 <AlertCircle className="w-4 h-4" />
                 {drunkLevel >= 80 ? "Ministry of Health Warning: Player Incapacitated" : "Ministry of Health Warning: Alcohol Impairs Judgement"}
             </div>
        )}

        {/* Safe Betting Header & Stats */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 ${isLightMode ? 'border-gray-200' : 'border-slate-700'}`}>
            <div className="flex flex-col">
                <div className={`text-sm font-semibold uppercase tracking-wider ${labelClass}`}>Your Balance</div>
                <div className={`text-2xl font-mono font-bold ${isLightMode ? 'text-green-600' : 'text-green-400'}`}>${balance.toFixed(2)}</div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className={`w-full md:w-64 rounded-lg p-3 border relative overflow-hidden flex flex-col gap-2 ${cardClass}`}>
                    
                    {/* Daily Limit Bar */}
                    <div>
                        <div className={`flex justify-between items-center text-xs mb-1 z-10 relative ${labelClass}`}>
                            <div className="flex items-center gap-1">
                                {limitRemoved ? <Unlock className="w-3 h-3 text-yellow-500" /> : <ShieldCheck className="w-3 h-3 text-orange-500" />}
                                <span className="uppercase font-bold">{limitRemoved ? 'Unlimited Access' : 'Daily Safe Limit'}</span>
                            </div>
                            {!limitRemoved && (
                                <span className={isLimitReached ? "text-red-500 font-bold" : (isLightMode ? "text-gray-700" : "text-slate-300")}>
                                    {dailySpent} / {dailyLimit} Used
                                </span>
                            )}
                        </div>
                        
                        {limitRemoved ? (
                            <div className="w-full py-0.5 bg-gradient-to-r from-yellow-600/20 to-amber-500/20 rounded flex items-center justify-center border border-yellow-500/30">
                                <span className="text-yellow-600 font-black tracking-widest text-[10px] animate-pulse">∞ LIMIT REMOVED</span>
                            </div>
                        ) : (
                            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLightMode ? 'bg-gray-200' : 'bg-slate-800'}`}>
                                <div 
                                    className={`h-full transition-all duration-500 ${isLimitReached ? 'bg-red-500' : 'bg-orange-500'}`}
                                    style={{ width: `${limitProgress}%` }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Sobriety Meter */}
                    <div>
                         <div className={`flex justify-between items-center text-xs mb-1 z-10 relative ${labelClass}`}>
                            <div className="flex items-center gap-1">
                                <Wine className={`w-3 h-3 ${drunkLevel > 50 ? 'text-purple-500' : 'text-gray-400'}`} />
                                <span className="uppercase font-bold">Sobriety Level</span>
                            </div>
                            <span className={`${drunkLevel >= 80 ? 'text-red-500 font-bold' : (isLightMode ? 'text-gray-700' : 'text-slate-300')}`}>
                                {drunkLevel}% Intoxicated
                            </span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLightMode ? 'bg-gray-200' : 'bg-slate-800'}`}>
                             <div 
                                className={`h-full transition-all duration-500 ${drunkLevel < 30 ? 'bg-green-500' : drunkLevel < 80 ? 'bg-yellow-500' : 'bg-red-600'}`}
                                style={{ width: `${drunkLevel}%` }}
                            />
                        </div>
                    </div>

                    {!limitRemoved && (
                        <div className="flex justify-end mt-1">
                            <button 
                                onClick={onRemoveLimit}
                                disabled={balance < removeLimitCost}
                                className={`flex items-center gap-1 border px-2 py-0.5 rounded text-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${isLightMode ? 'bg-white hover:bg-gray-50 text-orange-600 border-orange-200' : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-amber-400/30'}`}
                            >
                                <Unlock className="w-3 h-3" />
                                <span>Remove Limit (${removeLimitCost})</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 self-start">
                    <VoiceBetting 
                        onCashOut={onCashOut} 
                        onSetBetAmount={(amt) => setBetAmount(amt)}
                        onTriggerBet={handleVoiceBet}
                        isLightMode={isLightMode} 
                    />
                    <button
                        onClick={onToggleMute}
                        className={`p-3 rounded-lg transition-colors ${isLightMode ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>

        {/* Mode Switcher */}
        <div className={`flex p-1 rounded-lg w-full max-w-xs ${isLightMode ? 'bg-gray-200' : 'bg-slate-900'}`}>
            <button 
                onClick={() => !autoBetState.isActive && setMode('MANUAL')}
                disabled={autoBetState.isActive}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'MANUAL' ? (isLightMode ? 'bg-white text-black shadow-sm' : 'bg-slate-700 text-white shadow-sm') : (isLightMode ? 'text-gray-500 hover:text-black' : 'text-slate-400 hover:text-slate-200')} disabled:opacity-50`}
            >
                MANUAL
            </button>
            <button 
                onClick={() => setMode('AUTO')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'AUTO' ? 'bg-orange-600 text-white shadow-sm' : (isLightMode ? 'text-gray-500 hover:text-black' : 'text-slate-400 hover:text-slate-200')}`}
            >
                AUTO
            </button>
        </div>

        {/* Betting Interface */}
        <div className="flex flex-col md:flex-row gap-4">
            
            {/* INPUTS COLUMN */}
            <div className="flex-1 flex flex-col gap-3">
                {mode === 'MANUAL' ? (
                    <>
                        {/* MANUAL INPUTS */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative flex flex-col">
                                <label className={`text-xs font-bold ml-1 mb-1 block ${labelClass}`}>BET AMOUNT</label>
                                <div className="relative">
                                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${labelClass}`}>$</span>
                                    <input 
                                        type="number" 
                                        value={betAmount}
                                        onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                                        disabled={isBettingClosed || (hasBet && phase === GamePhase.BETTING) || isWasted}
                                        className={`w-full border rounded-lg py-3 pl-8 pr-4 font-bold text-lg focus:outline-none focus:ring-2 disabled:opacity-50 transition-colors ${inputClass}
                                            ${manualBetError 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : (isLightMode ? 'focus:ring-red-500' : 'focus:ring-orange-500')}`}
                                    />
                                </div>
                                {manualBetError && (
                                    <div className="flex items-center gap-1 mt-1 ml-1 text-[10px] font-bold text-red-400 animate-in slide-in-from-top-1 fade-in duration-200">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>{manualBetError}</span>
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <label className={`text-xs font-bold ml-1 mb-1 block flex items-center gap-1 ${labelClass}`}>
                                    <Target className="w-3 h-3" /> AUTO CASH OUT
                                </label>
                                <div className="relative">
                                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 font-bold text-sm ${labelClass}`}>x</span>
                                    <input 
                                        type="number" 
                                        placeholder="None"
                                        value={autoCashOut}
                                        step="0.1"
                                        onChange={(e) => setAutoCashOut(e.target.value)}
                                        disabled={isBettingClosed || (hasBet && phase === GamePhase.BETTING) || isWasted}
                                        className={`w-full border rounded-lg py-3 pl-3 pr-8 font-bold text-lg focus:outline-none focus:ring-2 disabled:opacity-50 placeholder:text-gray-400 ${inputClass} ${isLightMode ? 'focus:ring-red-500' : 'focus:ring-orange-500'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* AUTO INPUTS */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="relative">
                                <label className={`text-[10px] font-bold ml-1 mb-1 block ${labelClass}`}>BET AMOUNT</label>
                                <div className="relative">
                                    <span className={`absolute left-2 top-1/2 -translate-y-1/2 font-bold text-xs ${labelClass}`}>$</span>
                                    <input 
                                        type="number" 
                                        value={autoBaseBet}
                                        onChange={(e) => setAutoBaseBet(Math.max(0, Number(e.target.value)))}
                                        disabled={autoBetState.isActive || isWasted}
                                        className={`w-full border rounded-lg py-2 pl-6 pr-2 font-bold text-sm focus:outline-none focus:ring-2 disabled:opacity-50 ${inputClass} ${isLightMode ? 'focus:ring-red-500' : 'focus:ring-orange-500'}`}
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className={`text-[10px] font-bold ml-1 mb-1 block ${labelClass}`}>CASH OUT (x)</label>
                                <input 
                                    type="number" 
                                    value={autoTarget}
                                    step="0.1"
                                    onChange={(e) => setAutoTarget(e.target.value)}
                                    disabled={autoBetState.isActive || isWasted}
                                    className={`w-full border rounded-lg py-2 px-3 font-bold text-sm focus:outline-none focus:ring-2 disabled:opacity-50 ${inputClass} ${isLightMode ? 'focus:ring-red-500' : 'focus:ring-orange-500'}`}
                                />
                            </div>
                             <div className="relative">
                                <label className={`text-[10px] font-bold ml-1 mb-1 block ${labelClass}`}>ROUNDS</label>
                                <input 
                                    type="number" 
                                    value={autoRounds}
                                    onChange={(e) => setAutoRounds(e.target.value)}
                                    disabled={autoBetState.isActive || isWasted}
                                    className={`w-full border rounded-lg py-2 px-3 font-bold text-sm focus:outline-none focus:ring-2 disabled:opacity-50 ${inputClass} ${isLightMode ? 'focus:ring-red-500' : 'focus:ring-orange-500'}`}
                                />
                            </div>
                        </div>
                        
                        {/* Auto Strategy */}
                        <div className="grid grid-cols-2 gap-4 pt-1">
                             {/* On Win */}
                             <div className={`p-3 rounded-lg border flex flex-col gap-2 ${isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-slate-900/50 border-slate-700/50'}`}>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-green-500 uppercase">On Win</span>
                                    <div className={`flex rounded p-0.5 border ${isLightMode ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'}`}>
                                        <button 
                                            onClick={() => setOnWinAction('RESET')}
                                            disabled={autoBetState.isActive || isWasted}
                                            title="Reset to Base Bet"
                                            className={`p-1.5 rounded transition-all ${onWinAction === 'RESET' ? (isLightMode ? 'bg-gray-200 text-black shadow' : 'bg-slate-600 text-white shadow') : 'text-gray-400 hover:text-gray-600'} disabled:opacity-50`}
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => setOnWinAction('INCREASE')}
                                            disabled={autoBetState.isActive || isWasted}
                                            title="Increase Bet"
                                            className={`p-1.5 rounded transition-all ${onWinAction === 'INCREASE' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-gray-600'} disabled:opacity-50`}
                                        >
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                
                                {onWinAction === 'INCREASE' ? (
                                     <div className="animate-in slide-in-from-top-1 fade-in duration-200">
                                        <label className={`text-[10px] font-bold block mb-1 ${labelClass}`}>INCREASE BY %</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={onWinPercent} 
                                                onChange={e => setOnWinPercent(e.target.value)}
                                                disabled={autoBetState.isActive || isWasted}
                                                className={`w-full border rounded px-2 py-1 text-xs text-right focus:ring-1 focus:ring-green-500 focus:outline-none disabled:opacity-50 ${inputClass}`}
                                            />
                                            <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${labelClass}`}>%</span>
                                        </div>
                                     </div>
                                ) : (
                                    <div className={`text-[10px] italic py-1 ${labelClass}`}>Return to base bet</div>
                                )}
                             </div>
                             
                             {/* On Loss */}
                             <div className={`p-3 rounded-lg border flex flex-col gap-2 ${isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-slate-900/50 border-slate-700/50'}`}>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-red-500 uppercase">On Loss</span>
                                    <div className={`flex rounded p-0.5 border ${isLightMode ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'}`}>
                                        <button 
                                            onClick={() => setOnLossAction('RESET')}
                                            disabled={autoBetState.isActive || isWasted}
                                            title="Reset to Base Bet"
                                            className={`p-1.5 rounded transition-all ${onLossAction === 'RESET' ? (isLightMode ? 'bg-gray-200 text-black shadow' : 'bg-slate-600 text-white shadow') : 'text-gray-400 hover:text-gray-600'} disabled:opacity-50`}
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => setOnLossAction('INCREASE')}
                                            disabled={autoBetState.isActive || isWasted}
                                            title="Increase Bet"
                                            className={`p-1.5 rounded transition-all ${onLossAction === 'INCREASE' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-gray-600'} disabled:opacity-50`}
                                        >
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                
                                {onLossAction === 'INCREASE' ? (
                                     <div className="animate-in slide-in-from-top-1 fade-in duration-200">
                                        <label className={`text-[10px] font-bold block mb-1 ${labelClass}`}>INCREASE BY %</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={onLossPercent} 
                                                onChange={e => setOnLossPercent(e.target.value)}
                                                disabled={autoBetState.isActive || isWasted}
                                                className={`w-full border rounded px-2 py-1 text-xs text-right focus:ring-1 focus:ring-red-500 focus:outline-none disabled:opacity-50 ${inputClass}`}
                                            />
                                            <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${labelClass}`}>%</span>
                                        </div>
                                     </div>
                                ) : (
                                    <div className={`text-[10px] italic py-1 ${labelClass}`}>Return to base bet</div>
                                )}
                             </div>
                        </div>
                    </>
                )}

                <div className="grid grid-cols-4 gap-2">
                    {[10, 20, 50, 100].map(amt => (
                        <button 
                            key={amt}
                            onClick={() => handleQuickBet(amt)}
                            disabled={(mode === 'MANUAL' && (isBettingClosed || (hasBet && phase === GamePhase.BETTING))) || autoBetState.isActive || isWasted}
                            className={`font-bold py-2 rounded-md transition-colors text-sm disabled:opacity-50 ${isLightMode ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                        >
                            ${amt}
                        </button>
                    ))}
                </div>
            </div>

            {/* ACTION BUTTON COLUMN */}
            <div className="flex-1">
                {/* Cash Out Button takes priority if flying and we have a bet */}
                {isFlying && hasBet && !bet.cashedOut ? (
                    <button 
                        onClick={onCashOut}
                        className="w-full h-full min-h-[80px] bg-orange-500 hover:bg-orange-400 text-white rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] transform hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1 border-b-4 border-orange-700"
                    >
                        <span className="text-2xl font-black uppercase">Cash Out</span>
                        <div className="flex flex-col items-center leading-none">
                             <span className="text-lg font-mono opacity-90">Win ${(bet.amount * (bet.cashOutMultiplier || 1)).toFixed(2)}</span>
                             {bet.autoCashOutAt && <span className="text-[10px] uppercase opacity-75">Auto: {bet.autoCashOutAt}x</span>}
                        </div>
                    </button>
                ) : mode === 'AUTO' ? (
                     // AUTO MODE BUTTONS
                     autoBetState.isActive ? (
                        <button 
                            onClick={onStopAutoBet}
                            className="w-full h-full min-h-[80px] bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all flex flex-col items-center justify-center gap-2 border-b-4 border-red-800"
                        >
                            <span className="flex items-center gap-2 text-xl font-black uppercase"><StopCircle /> STOP AUTO</span>
                            <div className="text-sm font-mono bg-black/20 px-3 py-1 rounded">
                                Rounds Left: {autoBetState.roundsRemaining}
                            </div>
                            <div className="text-xs opacity-75">Current Bet: ${autoBetState.currentBetAmount}</div>
                        </button>
                     ) : (
                        <button 
                            onClick={handleStartAuto}
                            disabled={balance < autoBaseBet || isBettingClosed || isWasted}
                            className="w-full h-full min-h-[80px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all flex flex-col items-center justify-center gap-2 border-b-4 border-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                             <span className="flex items-center gap-2 text-xl font-black uppercase"><Play /> START AUTO</span>
                             <div className="text-xs opacity-75">
                                 {isWasted ? "Must Sober Up" : isBettingClosed ? "Wait for round end" : "Next round starts soon"}
                             </div>
                        </button>
                     )
                ) : (
                    // MANUAL MODE BUTTONS
                    isWasted ? (
                        <button 
                            disabled
                            className="w-full h-full min-h-[80px] bg-red-900/50 text-red-200 rounded-xl border-2 border-red-900/30 flex flex-col items-center justify-center cursor-not-allowed"
                        >
                             <span className="text-xl font-black uppercase animate-pulse">BABA PASSED OUT</span>
                             <span className="text-sm opacity-80">Cannot throw. Try Football?</span>
                        </button>
                    ) : hasBet && phase === GamePhase.BETTING ? (
                        <button 
                            disabled
                            className="w-full h-full min-h-[80px] bg-green-600/50 text-white/50 rounded-xl border-2 border-green-600/30 flex flex-col items-center justify-center"
                        >
                            <span className="text-xl font-bold uppercase">Bet Placed</span>
                            <span className="text-sm">Waiting for Baba...</span>
                            {bet.autoCashOutAt && <span className="text-xs text-green-200 mt-1">Auto Cash Out: {bet.autoCashOutAt}x</span>}
                        </button>
                    ) : (
                        <button 
                            onClick={() => onPlaceBet(betAmount, autoCashOut ? Number(autoCashOut) : undefined)}
                            disabled={isBettingClosed || !isValidBet}
                            className={`w-full h-full min-h-[80px] rounded-xl flex flex-col items-center justify-center transition-all border-b-4 ${mainBtnClass}`}
                        >
                            <span className="text-2xl font-black uppercase">
                                {getBetButtonLabel()}
                            </span>
                            {!isBettingClosed && (
                                <span className="text-sm font-medium opacity-80">
                                    {isLimitReached 
                                        ? "Daily Limit Reached" 
                                        : !canAfford 
                                        ? "Insufficient Funds" 
                                        : "Next round starts soon"}
                                </span>
                            )}
                        </button>
                    )
                )}
            </div>
        </div>

        {/* History Footer */}
        <div className={`border-t pt-2 ${isLightMode ? 'border-gray-200' : 'border-slate-700'}`}>
            <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className={`flex items-center justify-between w-full text-xs py-2 group ${isLightMode ? 'text-gray-500 hover:text-black' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <div className="flex items-center gap-2">
                    <History className={`w-3.5 h-3.5 transition-colors ${isLightMode ? 'group-hover:text-red-500' : 'group-hover:text-orange-400'}`} />
                    <span className="font-bold uppercase tracking-wide">My Last 5 Bets</span>
                </div>
                {isHistoryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            
            {isHistoryOpen && (
                <div className="flex flex-col gap-1.5 mt-1 animate-in slide-in-from-top-1">
                     {userHistory.length === 0 ? (
                         <div className={`text-[10px] italic text-center py-3 rounded ${isLightMode ? 'text-gray-500 bg-gray-50' : 'text-slate-600 bg-slate-900/30'}`}>
                             No bets placed in this session.
                         </div>
                     ) : (
                         userHistory.map(h => {
                             const profit = h.cashedOut ? h.amount * (h.cashOutMultiplier || 0) - h.amount : -h.amount;
                             return (
                                 <div key={h.id} className={`flex justify-between items-center p-2 rounded border text-xs transition-colors ${isLightMode ? 'bg-gray-50 border-gray-200 hover:bg-white' : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-900'}`}>
                                     <div className="flex items-center gap-3">
                                         <span className={`font-mono w-12 text-right ${isLightMode ? 'text-black' : 'text-slate-300'}`}>${h.amount}</span>
                                         <div className={`w-px h-3 ${isLightMode ? 'bg-gray-300' : 'bg-slate-700'}`}></div>
                                         <span className={h.cashedOut ? "text-green-500 font-bold" : "text-gray-500"}>
                                             {h.cashedOut ? `${h.cashOutMultiplier?.toFixed(2)}x` : `Crashed @ ${h.crashMultiplier.toFixed(2)}x`}
                                         </span>
                                     </div>
                                     <span className={`font-mono font-bold ${profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                                         {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                                     </span>
                                 </div>
                             );
                         })
                     )}
                </div>
            )}
        </div>
    </div>
  );
};

export default ControlPanel;
