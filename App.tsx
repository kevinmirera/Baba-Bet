
import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import ControlPanel from './components/ControlPanel';
import HistoryBar from './components/HistoryBar';
import BabaWisdom from './components/BabaWisdom';
import SocialSidebar from './components/SocialSidebar';
import ResponsibleGambling from './components/ResponsibleGambling';
import BabaAnalytics from './components/BabaAnalytics';
import { FootballSim } from './components/FootballSim';
import { GamePhase, Bet, HistoryItem, UserBetHistoryItem, BotPlayer, ChatMessage, AutoBetSettings, AutoBetState, MarketItem, WeatherType, FarmStats, PoliticalEvent, GameMode, CustomTheme } from './types';
import { audioService } from './services/audioService';
import { AlertTriangle, Dribbble, Target, Gift, X, Heart, Rocket, Activity, Loader2, Sun, Moon, Youtube, ExternalLink, Copy, Check, Smartphone, Bitcoin, BarChart3 } from 'lucide-react';

const INITIAL_BALANCE = 6000;
const BETTING_TIME_MS = 5000;
const DAILY_LIMIT = 1000;
const REMOVE_LIMIT_COST = 500;

const BOT_NAMES = ['CitrusKing', 'PeelMaster', 'ZestyBoi', 'BabaFan99', 'OrangeCrush', 'JuicyLucy', 'VitaminC', 'PulpFiction', 'ElfOnShelf', 'ReindeerBoy', 'SpeedyJoe'];
const BOT_MESSAGES_WIN = ['Nice one!', 'Baba is generous today', 'To the moon!', 'Easy money', 'Lets gooo', 'Christmas miracle!'];
const BOT_MESSAGES_LOSS = ['Ouch', 'Rigged!', 'My oranges!', 'Baba why', 'Scammed by a farmer', 'Coal for me'];

// Farm Constants
const ASSET_PRICES = { cows: 200, land: 1000, tractors: 5000, chickens: 300, burgers: 800, pizza: 1200 };
const ASSET_INCOME = { cows: 2, land: 15, tractors: 100, chickens: 5, burgers: 12, pizza: 18 };

// Spinner Constants
const SPINNER_COST = 100;
const SPINNER_PRIZES = [
    { id: 'p_cash100', type: 'CASH', label: '$100', icon: '💵', color: '#4ade80', value: 100 },
    { id: 'p_phone', type: 'ITEM', label: 'iPhone 16', icon: '📱', color: '#60a5fa', value: 'm_phone' },
    { id: 'p_jersey', type: 'ITEM', label: 'Club Kit', icon: '👕', color: '#f87171', value: 'shirt_club' },
    { id: 'p_car', type: 'ITEM', label: 'Toyota', icon: '🚗', color: '#c084fc', value: 'm_car' },
    { id: 'p_cash1000', type: 'CASH', label: '$1,000', icon: '💰', color: '#fbbf24', value: 1000 },
    { id: 'p_rotten', type: 'NOTHING', label: 'Rotten Orange', icon: '🧟', color: '#94a3b8', value: 0 },
    { id: 'p_lambo', type: 'ITEM', label: 'Lambo', icon: '🏎️', color: '#facc15', value: 'm_lambo' }, // Jackpot Item
    { id: 'p_cash10000', type: 'CASH', label: '$10,000', icon: '💎', color: '#22d3ee', value: 10000 }, // Jackpot Cash
];

export default function App() {
  // Navigation State
  const [view, setView] = useState<'GAME' | 'RESPONSIBLE' | 'FOOTBALL_SIM' | 'ANALYTICS'>('GAME');

  // Theme State
  const [isLightMode, setIsLightMode] = useState(false);

  // Game State
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [phase, setPhase] = useState<GamePhase>(GamePhase.BETTING);
  const [multiplier, setMultiplier] = useState(1.00);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userHistory, setUserHistory] = useState<UserBetHistoryItem[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>('ORANGE');
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null);
  const [showSwitchPrompt, setShowSwitchPrompt] = useState(false);
  
  // Analytics State
  const [totalTimePlayed, setTotalTimePlayed] = useState(0);
  
  // Prediction State (Pro Laptop)
  const [nextCrashPrediction, setNextCrashPrediction] = useState<number | null>(null);

  // Christmas State
  const [isChristmasMode, setIsChristmasMode] = useState(true);
  const [showSantaGift, setShowSantaGift] = useState(false);

  // Support & Donation State
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Safe Betting State
  const [dailySpent, setDailySpent] = useState(0);
  const [limitRemoved, setLimitRemoved] = useState(false);
  
  // Audio State
  const [isMuted, setIsMuted] = useState(true); // Default Muted
  
  // Player State
  const [currentBet, setCurrentBet] = useState<Bet>({ amount: 0, cashedOut: false, cashOutMultiplier: null });

  // Weather & Inventory State
  const [weather, setWeather] = useState<WeatherType>('SNOW'); // Default to snow for Xmas
  const [inventory, setInventory] = useState<string[]>([]);
  
  // Drunk State
  const [drunkLevel, setDrunkLevel] = useState(0);

  // Farm & Political State
  const [farmStats, setFarmStats] = useState<FarmStats>({ cows: 0, land: 0, tractors: 0, chickens: 0, burgers: 0, pizza: 0 });
  const [politicalEvent, setPoliticalEvent] = useState<PoliticalEvent | null>(null);

  // Spinner State
  const [showSpinner, setShowSpinner] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<typeof SPINNER_PRIZES[0] | null>(null);

  // Auto Bet State
  const [autoBetState, setAutoBetState] = useState<AutoBetState>({
      isActive: false,
      roundsRemaining: 0,
      currentBetAmount: 0,
      config: {
          baseBet: 0,
          autoCashOut: 0,
          rounds: 0,
          onWin: 'RESET',
          onWinPercent: 0,
          onLoss: 'RESET',
          onLossPercent: 0
      }
  });

  // Social State
  const [bots, setBots] = useState<BotPlayer[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Refs for loop and state access inside loop
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);
  const currentBetRef = useRef<Bet>(currentBet);
  const botsRef = useRef<BotPlayer[]>([]);
  const autoBetRef = useRef<AutoBetState>(autoBetState);
  const farmStatsRef = useRef<FarmStats>(farmStats);
  const politicalEventRef = useRef<PoliticalEvent | null>(politicalEvent);
  
  // This ref holds the pre-calculated crash point for the upcoming round
  const nextCrashPointRef = useRef<number>(0);

  // Sync refs with state
  useEffect(() => { currentBetRef.current = currentBet; }, [currentBet]);
  useEffect(() => { botsRef.current = bots; }, [bots]);
  useEffect(() => { autoBetRef.current = autoBetState; }, [autoBetState]);
  useEffect(() => { farmStatsRef.current = farmStats; }, [farmStats]);
  useEffect(() => { politicalEventRef.current = politicalEvent; }, [politicalEvent]);

  // Track Time Played
  useEffect(() => {
      const storedTime = localStorage.getItem('bababet_time_played');
      if (storedTime) setTotalTimePlayed(parseInt(storedTime));

      const timer = setInterval(() => {
          setTotalTimePlayed(prev => {
              const newTime = prev + 1;
              // Save every 10s to minimize IO or just rely on unload
              if (newTime % 10 === 0) localStorage.setItem('bababet_time_played', newTime.toString());
              return newTime;
          });
      }, 1000);

      return () => clearInterval(timer);
  }, []);

  // Helper Functions Definitions
  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now(),
      user: 'You',
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => {
        const updated = [...prev, newMessage];
        return updated.slice(-50);
    });
  };

  const addBotMessage = (text: string, user: string) => {
    const newMessage: ChatMessage = {
      id: Date.now(),
      user,
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => {
        const updated = [...prev, newMessage];
        return updated.slice(-50);
    });
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handlePoliticalAction = (action: 'PAY' | 'IGNORE') => {
      if (!politicalEventRef.current) return;
      const event = politicalEventRef.current;

      if (action === 'PAY') {
          if (event.cost && balance >= event.cost) {
              setBalance(prev => prev - (event.cost || 0));
              setPoliticalEvent(null);
              addBotMessage(`You paid off the ${event.title}. Problem solved.`, "System");
              audioService.playCashOut();
          } else {
              handleSendMessage("I can't afford to pay this off!");
          }
      } else {
          if (event.type === 'CORRUPTION' || event.type === 'TAX') {
               const penalty = Math.floor(balance * 0.1);
               setBalance(prev => Math.max(0, prev - penalty));
               addBotMessage(`You ignored ${event.title}. They seized $${penalty}.`, "System");
          } else {
               addBotMessage(`${event.title} expired.`, "System");
          }
          setPoliticalEvent(null);
      }
  };

  // Generate a crash point (utility function)
  const generateCrashPoint = useCallback(() => {
    // Check for active Curse (Supernatural event)
    const currentEvent = politicalEventRef.current;
    if (currentEvent && currentEvent.type === 'SUPERNATURAL' && currentEvent.duration > 0) {
        // High chance of early crash
        if (Math.random() < 0.4) return 1.0 + Math.random() * 0.2; 
    }

    if (Math.random() < 0.03) return 1.00;
    const r = Math.random();
    const crash = 1 / (1 - r);
    return Math.min(crash, 1000); 
  }, []);

  // Initialize first predicted crash point
  useEffect(() => {
      const initialCrash = generateCrashPoint();
      nextCrashPointRef.current = initialCrash;
      setNextCrashPrediction(initialCrash);
  }, [generateCrashPoint]);

  // Handle Event Expiration (for urgent events)
  useEffect(() => {
      const checkExpiry = () => {
          if (politicalEventRef.current?.expiryTime) {
              if (Date.now() > politicalEventRef.current.expiryTime) {
                  // Auto-fail logic for Corruption/Wizard events
                  handlePoliticalAction('IGNORE');
              }
          }
      };
      
      const timer = setInterval(checkExpiry, 1000);
      return () => clearInterval(timer);
  }, []);

  // Load Persisted Data
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('bababet_date');
    const storedSpent = localStorage.getItem('bababet_spent');
    const storedLimitRemoved = localStorage.getItem('bababet_limit_removed');
    const storedInventory = localStorage.getItem('bababet_inventory');
    const storedFarm = localStorage.getItem('bababet_farm');
    const santaGiftClaimed = localStorage.getItem('bababet_santa_gift');

    if (storedDate === today && storedSpent) {
      setDailySpent(Number(storedSpent));
      setLimitRemoved(storedLimitRemoved === 'true');
      if (santaGiftClaimed !== 'true') setShowSantaGift(true);
    } else {
      localStorage.setItem('bababet_date', today);
      localStorage.setItem('bababet_spent', '0');
      localStorage.setItem('bababet_limit_removed', 'false');
      localStorage.setItem('bababet_santa_gift', 'false'); // Reset gift daily
      setDailySpent(0);
      setLimitRemoved(false);
      setShowSantaGift(true);
    }

    if (storedInventory) {
        setInventory(JSON.parse(storedInventory));
    }

    if (storedFarm) {
        const parsed = JSON.parse(storedFarm);
        setFarmStats({
            cows: parsed.cows || 0,
            land: parsed.land || 0,
            tractors: parsed.tractors || 0,
            chickens: parsed.chickens || 0,
            burgers: parsed.burgers || 0,
            pizza: parsed.pizza || 0
        });
    }
  }, []);

  // Monitor Drunk Level to show switch prompt
  useEffect(() => {
      if (drunkLevel >= 80 && gameMode === 'ORANGE' && !showSwitchPrompt) {
          setShowSwitchPrompt(true);
      }
  }, [drunkLevel, gameMode, showSwitchPrompt]);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    audioService.toggleMute(newState);
    audioService.init();
  };

  const toggleTheme = () => {
      setIsLightMode(prev => !prev);
  };

  const handleClaimGift = () => {
      const giftAmount = 100;
      setBalance(prev => prev + giftAmount);
      setShowSantaGift(false);
      localStorage.setItem('bababet_santa_gift', 'true');
      handleSendMessage(`Ho Ho Ho! I claimed Santa's gift of $${giftAmount}!`);
      audioService.playCashOut();
  };

  const handleRemoveLimit = () => {
    if (balance >= REMOVE_LIMIT_COST) {
      setBalance(prev => prev - REMOVE_LIMIT_COST);
      setLimitRemoved(true);
      localStorage.setItem('bababet_limit_removed', 'true');
      audioService.playBet(); 
    }
  };

  const handleBuyItem = (item: MarketItem) => {
      // Check for duplicate purchase for persistent items
      if (item.category !== 'BOOZ' && inventory.includes(item.id)) return;

      if (balance >= item.price) {
          setBalance(prev => prev - item.price);
          audioService.playBet(); // Use coin sound
          handleSendMessage(`I just bought ${item.name}!`); // Announce purchase

          // Save to inventory if it's an equipment item (Weather, Luck, Flex)
          // Booz is consumable and not saved
          if (item.category !== 'BOOZ') {
              const newInv = [...inventory, item.id];
              setInventory(newInv);
              localStorage.setItem('bababet_inventory', JSON.stringify(newInv));
          }

          if (item.category === 'BOOZ') {
              const newDrunkLevel = Math.min(drunkLevel + 35, 100);
              setDrunkLevel(newDrunkLevel);
              if (newDrunkLevel >= 80) {
                  addBotMessage("Ministry of Health Warning: Alcohol impairs your ability to operate machinery (or throw oranges).", "System");
              } else if (newDrunkLevel >= 40) {
                  addBotMessage("Whoa, easy there partner! The world is spinning.", "Baba");
              }
          }
      }
  };

  const handleBuyAsset = (assetType: 'cows' | 'land' | 'tractors' | 'chickens' | 'burgers' | 'pizza') => {
      const price = ASSET_PRICES[assetType];
      if (balance >= price) {
          setBalance(prev => prev - price);
          setFarmStats(prev => {
              const newStats = { ...prev, [assetType]: prev[assetType] + 1 };
              localStorage.setItem('bababet_farm', JSON.stringify(newStats));
              return newStats;
          });
          audioService.playBet();
          handleSendMessage(`Bought a ${assetType.slice(0, -1)} for the farm!`);
      }
  };

  // Spinner Logic
  const handleSpin = () => {
      if (balance < SPINNER_COST || isSpinning) return;
      setBalance(prev => prev - SPINNER_COST);
      setIsSpinning(true);
      setSpinResult(null);
      
      const spins = 5 + Math.random() * 5; // 5-10 spins
      const prizeIndex = Math.floor(Math.random() * SPINNER_PRIZES.length);
      const prize = SPINNER_PRIZES[prizeIndex];
      const sliceAngle = 360 / SPINNER_PRIZES.length;
      const targetRotation = spins * 360 + (360 - (prizeIndex * sliceAngle)) - (sliceAngle / 2);
      
      setSpinRotation(targetRotation);
      audioService.startEngine(); // Engine sound for spin

      setTimeout(() => {
          setIsSpinning(false);
          audioService.stopEngine();
          setSpinResult(prize);
          
          if (prize.type === 'CASH') {
              setBalance(prev => prev + (prize.value as number));
              audioService.playCashOut();
              addBotMessage(`You won $${prize.value} on the wheel!`, "System");
          } else if (prize.type === 'ITEM') {
              const itemId = prize.value as string;
              if (!inventory.includes(itemId)) {
                  setInventory(prev => [...prev, itemId]);
                  localStorage.setItem('bababet_inventory', JSON.stringify([...inventory, itemId]));
                  addBotMessage(`You won ${prize.label} on the wheel!`, "System");
              } else {
                  // Duplicate item fallback
                  setBalance(prev => prev + 100);
                  addBotMessage(`You won ${prize.label} (Duplicate) -> $100 Cash`, "System");
              }
              audioService.playCashOut();
          } else {
              audioService.playSplat();
              addBotMessage("You won... a rotten orange. Bad luck.", "System");
          }
      }, 5000);
  };

  // Game Logic
  const startGame = () => {
      setPhase(GamePhase.FLYING);
      crashPointRef.current = nextCrashPointRef.current;
      setMultiplier(1.00);
      startTimeRef.current = Date.now();
      audioService.startEngine();
      
      // Calculate next round's crash point during this flight for the laptop prediction
      const nextOne = generateCrashPoint();
      nextCrashPointRef.current = nextOne;
      
      requestRef.current = requestAnimationFrame(updateGame);
  };

  const updateGame = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      // Exponential growth curve: 1.00 + (elapsed/1000)^2 * 0.1? No, typical crash curve.
      // E(t) = e^(0.06 * t) approx
      const newMultiplier = Math.max(1.00, Math.pow(Math.E, 0.00006 * elapsed));
      
      setMultiplier(newMultiplier);
      audioService.updateEnginePitch(newMultiplier);

      // Auto Cashout Logic
      const { cashedOut, autoCashOutAt, amount } = currentBetRef.current;
      if (!cashedOut && amount > 0 && autoCashOutAt && newMultiplier >= autoCashOutAt) {
          handleCashOut(newMultiplier); // Use the exact auto cashout point? usually match limit
      }

      // Check Crash
      if (newMultiplier >= crashPointRef.current) {
          handleCrash(crashPointRef.current);
      } else {
          requestRef.current = requestAnimationFrame(updateGame);
      }
  };

  const handleCrash = (finalMultiplier: number) => {
      setPhase(GamePhase.CRASHED);
      setMultiplier(finalMultiplier);
      audioService.stopEngine();
      audioService.playSplat();

      const { amount, cashedOut } = currentBetRef.current;
      if (!cashedOut && amount > 0) {
          // Lost bet
          const historyItem: UserBetHistoryItem = {
              id: Date.now(),
              amount,
              cashedOut: false,
              cashOutMultiplier: null,
              crashMultiplier: finalMultiplier,
              timestamp: Date.now(),
              mode: gameMode
          };
          setUserHistory(prev => [historyItem, ...prev].slice(0, 50));
          
          if (!limitRemoved) {
              setDailySpent(prev => {
                  const newVal = prev + amount;
                  localStorage.setItem('bababet_spent', newVal.toString());
                  return newVal;
              });
          }

          // Auto Bet Loss Logic
          const ab = autoBetRef.current;
          if (ab.isActive) {
               let nextBet = ab.currentBetAmount;
               if (ab.config.onLoss === 'INCREASE') {
                   nextBet = nextBet * (1 + ab.config.onLossPercent / 100);
               } else if (ab.config.onLoss === 'RESET') {
                   nextBet = ab.config.baseBet;
               }
               setAutoBetState(prev => ({ ...prev, currentBetAmount: nextBet }));
          }
      }

      setHistory(prev => [{ id: Date.now(), multiplier: finalMultiplier }, ...prev].slice(0, 20));
      setNextCrashPrediction(nextCrashPointRef.current); // Reveal next prediction

      // Wait then reset
      setTimeout(() => {
          setPhase(GamePhase.BETTING);
          setMultiplier(1.00);
          setCurrentBet({ amount: 0, cashedOut: false, cashOutMultiplier: null });
          
          // Farm Income
          const income = 
              (farmStatsRef.current.cows * ASSET_INCOME.cows) +
              (farmStatsRef.current.land * ASSET_INCOME.land) +
              (farmStatsRef.current.tractors * ASSET_INCOME.tractors) +
              (farmStatsRef.current.chickens * ASSET_INCOME.chickens);
              
          if (income > 0) {
              setBalance(prev => prev + income);
          }

          // Auto Bet Progression
          const ab = autoBetRef.current;
          if (ab.isActive) {
              if (ab.roundsRemaining > 0 && balance >= ab.currentBetAmount) {
                  setAutoBetState(prev => ({ ...prev, roundsRemaining: prev.roundsRemaining - 1 }));
                  placeBet(ab.currentBetAmount, ab.config.autoCashOut);
              } else {
                  setAutoBetState(prev => ({ ...prev, isActive: false })); // Stop if empty or no funds
              }
          }
      }, 3000);
  };

  const placeBet = (amount: number, autoCashOut?: number) => {
      if (balance >= amount) {
          setBalance(prev => prev - amount);
          setCurrentBet({ amount, cashedOut: false, cashOutMultiplier: null, autoCashOutAt: autoCashOut });
          audioService.playBet();
      }
  };

  const handleCashOut = (cashOutMult: number = multiplier) => {
      const { amount, cashedOut } = currentBetRef.current;
      if (!cashedOut && amount > 0) {
          const winAmount = amount * cashOutMult;
          setBalance(prev => prev + winAmount);
          setCurrentBet(prev => ({ ...prev, cashedOut: true, cashOutMultiplier: cashOutMult }));
          audioService.playCashOut();

          const historyItem: UserBetHistoryItem = {
              id: Date.now(),
              amount,
              cashedOut: true,
              cashOutMultiplier: cashOutMult,
              crashMultiplier: 0,
              timestamp: Date.now(),
              mode: gameMode
          };
          setUserHistory(prev => [historyItem, ...prev].slice(0, 50));

          // Auto Bet Win Logic
          const ab = autoBetRef.current;
          if (ab.isActive) {
               let nextBet = ab.currentBetAmount;
               if (ab.config.onWin === 'INCREASE') {
                   nextBet = nextBet * (1 + ab.config.onWinPercent / 100);
               } else if (ab.config.onWin === 'RESET') {
                   nextBet = ab.config.baseBet;
               }
               setAutoBetState(prev => ({ ...prev, currentBetAmount: nextBet }));
          }
      }
  };

  // Betting Phase Timer
  useEffect(() => {
      if (phase === GamePhase.BETTING) {
          const timer = setTimeout(startGame, BETTING_TIME_MS);
          return () => clearTimeout(timer);
      }
  }, [phase]);

  // View Switching
  if (view === 'FOOTBALL_SIM') {
      return <FootballSim onBack={() => setView('GAME')} balance={balance} setBalance={setBalance} isLightMode={isLightMode} />;
  }

  if (view === 'RESPONSIBLE') {
      return <ResponsibleGambling onBack={() => setView('GAME')} />;
  }

  if (view === 'ANALYTICS') {
      return (
          <BabaAnalytics 
            userHistory={userHistory} 
            balance={balance} 
            totalTimePlayed={totalTimePlayed} 
            onBack={() => setView('GAME')} 
            isLightMode={isLightMode}
          />
      );
  }

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-gray-100 text-black' : 'bg-slate-950 text-white'} font-sans flex flex-col md:flex-row overflow-hidden relative transition-colors duration-500`}>
        {/* SPINNER OVERLAY */}
        {showSpinner && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border-4 border-yellow-500 rounded-3xl p-6 relative shadow-2xl flex flex-col items-center">
                    <button onClick={() => setShowSpinner(false)} className="absolute top-2 right-2 text-slate-500 hover:text-white"><X /></button>
                    <h2 className="text-2xl font-black text-yellow-500 mb-4 uppercase tracking-widest">Lucky Wheel</h2>
                    
                    <div className="relative w-64 h-64 mb-6">
                        {/* Wheel CSS Construction */}
                        <div 
                            className="w-full h-full rounded-full border-4 border-slate-700 relative overflow-hidden transition-transform duration-[5000ms] cubic-bezier(0.25, 0.1, 0.25, 1)"
                            style={{ transform: `rotate(${spinRotation}deg)` }}
                        >
                            {SPINNER_PRIZES.map((prize, i) => {
                                const angle = 360 / SPINNER_PRIZES.length;
                                return (
                                    <div 
                                        key={prize.id}
                                        className="absolute top-1/2 left-1/2 w-full h-full origin-top-left flex items-center justify-center"
                                        style={{ 
                                            transform: `rotate(${i * angle}deg) skewY(-${90 - angle}deg)`,
                                            backgroundColor: i % 2 === 0 ? '#1e293b' : '#334155'
                                        }}
                                    >
                                        <div 
                                            className="absolute left-8 top-8 transform rotate-[60deg]" 
                                            style={{ color: prize.color }}
                                        >
                                            <div className="text-xl">{prize.icon}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Pointer */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 text-red-500 text-4xl">▼</div>
                    </div>

                    {spinResult ? (
                        <div className="text-center animate-bounce-in">
                             <div className="text-sm text-slate-400">You Won</div>
                             <div className="text-2xl font-black text-white" style={{color: spinResult.color}}>{spinResult.label}</div>
                        </div>
                    ) : (
                        <button 
                            onClick={handleSpin}
                            disabled={balance < SPINNER_COST || isSpinning}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-8 py-3 rounded-full text-xl shadow-lg disabled:opacity-50"
                        >
                            {isSpinning ? 'SPINNING...' : `SPIN ($${SPINNER_COST})`}
                        </button>
                    )}
                </div>
            </div>
        )}

        {/* Santa Gift Modal */}
        {showSantaGift && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-sm w-full text-center relative border-4 border-red-500 shadow-2xl">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-6xl drop-shadow-lg">🎅</div>
                    <h2 className="text-2xl font-black text-red-600 mt-4 mb-2">Ho Ho Ho!</h2>
                    <p className="text-sm text-slate-600 mb-6">Santa Baba brought you a daily gift!</p>
                    <div className="text-4xl font-black text-green-600 mb-6 flex items-center justify-center gap-2">
                        <Gift className="w-10 h-10" /> $100
                    </div>
                    <button 
                        onClick={handleClaimGift}
                        className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95"
                    >
                        Claim Gift
                    </button>
                </div>
            </div>
        )}

        {/* DRUNK MODE WARNING MODAL */}
        {showSwitchPrompt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                 <div className="bg-slate-900 border-2 border-orange-500 rounded-xl p-6 max-w-md w-full text-center">
                     <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                     <h2 className="text-xl font-bold text-white mb-2">You seem a bit tipsy...</h2>
                     <p className="text-slate-400 mb-6">Baba is struggling to throw straight. Maybe switch to Football mode or play some slots?</p>
                     <div className="flex gap-4">
                         <button 
                            onClick={() => setShowSwitchPrompt(false)}
                            className="flex-1 py-2 border border-slate-600 rounded text-slate-300 hover:bg-slate-800"
                         >
                             I'm Fine!
                         </button>
                         <button 
                            onClick={() => { setView('FOOTBALL_SIM'); setShowSwitchPrompt(false); }}
                            className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded"
                         >
                             Play Football
                         </button>
                     </div>
                 </div>
            </div>
        )}

        {/* DONATION / SUPPORT MODAL */}
        {showSupportModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-slate-900 border-2 border-orange-500 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                    <button onClick={() => setShowSupportModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X /></button>
                    <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-red-500 fill-current" /> Support Development
                    </h3>
                    <p className="text-slate-400 text-sm mb-6">
                        Help us keep the servers running and Baba's tractor fueled. All donations go directly to development costs.
                    </p>

                    <div className="space-y-4">
                        {/* Mobile Money */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                <Smartphone className="w-3 h-3" /> Mobile Money / M-Pesa
                            </div>
                            <div className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-700">
                                <code className="text-orange-400 font-mono font-bold">0782813854</code>
                                <button onClick={() => handleCopy("0782813854")} className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded transition-colors">
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Bitcoin */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                <Bitcoin className="w-3 h-3" /> Bitcoin (BTC)
                            </div>
                            <div className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-700">
                                <code className="text-orange-400 font-mono text-xs truncate mr-2">1EoupeVLQ3qUhEQ2bZQsduyefzLRXnwVDQ</code>
                                <button onClick={() => handleCopy("1EoupeVLQ3qUhEQ2bZQsduyefzLRXnwVDQ")} className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded transition-colors shrink-0">
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-y-auto scroll-smooth">
            <header className={`p-4 flex items-center justify-between border-b z-20 sticky top-0 backdrop-blur-md ${isLightMode ? 'bg-white/80 border-gray-200' : 'bg-slate-900/80 border-slate-800'}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-black text-lg md:text-xl shadow-lg ${isChristmasMode ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'}`}>
                        {isChristmasMode ? '🎅' : 'B'}
                    </div>
                    <div>
                        <h1 className={`font-black text-lg md:text-xl tracking-tighter leading-none ${isChristmasMode ? 'text-red-600' : (isLightMode ? 'text-black' : 'text-white')}`}>
                            BABABET {isChristmasMode && <span className="text-green-500">XMAS</span>}
                        </h1>
                        <div className={`text-[10px] font-bold uppercase tracking-widest ${isLightMode ? 'text-gray-500' : 'text-slate-500'}`}>Provably Fair</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setView('ANALYTICS')}
                        className={`p-2 rounded-full hidden md:flex items-center justify-center transition-colors ${isLightMode ? 'bg-gray-200 text-gray-700 hover:text-black' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        title="Analytics"
                    >
                        <BarChart3 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={toggleTheme}
                        className={`p-2 rounded-full ${isLightMode ? 'bg-gray-200 text-gray-700' : 'bg-slate-800 text-slate-400'}`}
                    >
                        {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </button>
                    <button 
                        onClick={() => setView('RESPONSIBLE')}
                        className={`hidden md:flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full border ${isLightMode ? 'bg-red-50 text-red-600 border-red-200' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                    >
                        <AlertTriangle className="w-3 h-3" />
                        Responsible Gambling
                    </button>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-6 flex flex-col gap-4 relative pb-24">
                
                {/* DEDICATED SOCIALS & DONATIONS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 animate-in slide-in-from-top-4 duration-500">
                    {/* Socials Card */}
                    <div 
                        onClick={() => window.open('https://youtube.com/@kevinmirera?si=14ubH7d5LuIp3j28', '_blank')}
                        className={`rounded-xl p-4 border flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.02] shadow-md group ${isLightMode ? 'bg-white border-red-200 hover:border-red-500' : 'bg-slate-800 border-red-900/50 hover:border-red-600'}`}
                    >
                        <div className={`p-3 rounded-full ${isLightMode ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-500'}`}>
                            <Youtube className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-black uppercase text-sm ${isLightMode ? 'text-black' : 'text-white'}`}>Kevin Mirera</h3>
                            <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-slate-400'}`}>Watch devlogs & tutorials on YouTube.</p>
                        </div>
                        <ExternalLink className={`w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 ${isLightMode ? 'text-black' : 'text-white'}`} />
                    </div>

                    {/* Donate Card */}
                    <div 
                        onClick={() => setShowSupportModal(true)}
                        className={`rounded-xl p-4 border flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.02] shadow-md group ${isLightMode ? 'bg-white border-green-200 hover:border-green-500' : 'bg-slate-800 border-green-900/50 hover:border-green-600'}`}
                    >
                        <div className={`p-3 rounded-full ${isLightMode ? 'bg-green-100 text-green-600' : 'bg-green-900/30 text-green-500'}`}>
                            <Heart className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-black uppercase text-sm ${isLightMode ? 'text-black' : 'text-white'}`}>Support Dev</h3>
                            <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-slate-400'}`}>Keep the game free & servers running.</p>
                        </div>
                        <div className={`ml-auto text-xs font-bold px-2 py-1 rounded ${isLightMode ? 'bg-green-100 text-green-700' : 'bg-green-900/50 text-green-400'}`}>Donate</div>
                    </div>
                </div>

                <GameCanvas 
                    phase={phase} 
                    multiplier={multiplier} 
                    bet={currentBet} 
                    weather={weather}
                    inventory={inventory}
                    drunkLevel={drunkLevel}
                    gameMode={gameMode}
                    politicalEvent={politicalEvent}
                    onPoliticalAction={handlePoliticalAction}
                    isChristmasMode={isChristmasMode}
                    farmStats={farmStats}
                    customTheme={customTheme}
                    isLightMode={isLightMode}
                />
                
                <ControlPanel 
                    balance={balance}
                    bet={currentBet}
                    phase={phase}
                    onPlaceBet={placeBet}
                    onCashOut={() => handleCashOut(multiplier)}
                    dailySpent={dailySpent}
                    dailyLimit={DAILY_LIMIT}
                    limitRemoved={limitRemoved}
                    onRemoveLimit={handleRemoveLimit}
                    removeLimitCost={REMOVE_LIMIT_COST}
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                    autoBetState={autoBetState}
                    onStartAutoBet={(settings) => setAutoBetState({ isActive: true, roundsRemaining: settings.rounds, currentBetAmount: settings.baseBet, config: settings })}
                    onStopAutoBet={() => setAutoBetState(prev => ({ ...prev, isActive: false }))}
                    userHistory={userHistory}
                    drunkLevel={drunkLevel}
                    gameMode={gameMode}
                    isChristmasMode={isChristmasMode}
                    inventory={inventory}
                    nextCrashPrediction={nextCrashPrediction}
                    isLightMode={isLightMode}
                />

                <HistoryBar history={history} />
            </main>
        </div>

        {/* Sidebar (Desktop: Right Side, Mobile: Bottom Tab?) - For now just flex-row on desktop */}
        <div className={`w-full md:w-80 border-l flex flex-col z-20 ${isLightMode ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-800'}`}>
             <SocialSidebar 
                phase={phase}
                bots={bots}
                currentBet={currentBet}
                currentMultiplier={multiplier}
                messages={messages}
                onSendMessage={handleSendMessage}
                balance={balance}
                onBuyItem={handleBuyItem}
                inventory={inventory}
                weather={weather}
                farmStats={farmStats}
                politicalEvent={politicalEvent}
                onBuyAsset={handleBuyAsset}
                gameMode={gameMode}
                onSetGameMode={(mode, theme) => { setGameMode(mode); if(theme) setCustomTheme(theme); }}
                onNavigateToSim={() => setView('FOOTBALL_SIM')}
                isChristmasMode={isChristmasMode}
                onOpenSpinner={() => setShowSpinner(true)}
                isLightMode={isLightMode}
             />
        </div>
        
        <BabaWisdom />
    </div>
  );
}
