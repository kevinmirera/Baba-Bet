
import React, { useEffect, useState } from 'react';
import { GamePhase, Bet, WeatherType, GameMode, PoliticalEvent, FarmStats, CustomTheme } from '../types';
import { AlertCircle, X, ShieldAlert, Gavel, Briefcase, Skull, HeartCrack, ShoppingBag, Megaphone } from 'lucide-react';
import { audioService } from '../services/audioService';

interface GameCanvasProps {
  phase: GamePhase;
  multiplier: number;
  bet: Bet;
  weather: WeatherType;
  inventory: string[];
  drunkLevel: number;
  gameMode: GameMode;
  politicalEvent: PoliticalEvent | null;
  onPoliticalAction?: (action: 'PAY' | 'IGNORE') => void;
  isChristmasMode?: boolean;
  farmStats: FarmStats;
  customTheme?: CustomTheme | null;
  isLightMode?: boolean;
}

// ADVERTISING DATA
const AD_DATA: Record<string, { text: string; color: string }[]> = {
    'FOOTBALL': [
        { text: "FLY BABA AIRLINES", color: "text-sky-400" },
        { text: "BETKING - 100% ODDS", color: "text-yellow-400" },
        { text: "MAN RED FC - NEVER WALK", color: "text-red-500" },
        { text: "DRINK WATER", color: "text-blue-300" },
        { text: "YOUR AD HERE", color: "text-white animate-pulse" }
    ],
    'AFCON': [
        { text: "VISIT WAKANDA", color: "text-purple-400" },
        { text: "MTN - EVERYWHERE YOU GO", color: "text-yellow-400" },
        { text: "SUPER EAGLES OFFICIAL", color: "text-green-400" },
        { text: "EAT JOLLOF RICE", color: "text-red-400" },
        { text: "ADVERTISE WITH BABA", color: "text-white animate-pulse" }
    ],
    'GOLF': [
        { text: "ROLEX - TIME FLIES", color: "text-green-800" },
        { text: "TIGER WOODS GOLF", color: "text-red-600" },
        { text: "THE 19TH HOLE BAR", color: "text-amber-600" },
        { text: "TITLEIST PRO V1", color: "text-slate-800" }
    ],
    'CANCER': [
        { text: "ST. JUDE HOSPITAL", color: "text-pink-600" },
        { text: "EARLY DETECTION SAVES LIVES", color: "text-rose-500" },
        { text: "DONATE TO RESEARCH", color: "text-purple-500" },
        { text: "HOPE IS STRONGER", color: "text-pink-400" }
    ],
    'USA': [
        { text: "BURGER KING", color: "text-orange-500" },
        { text: "FORD - BUILT TOUGH", color: "text-blue-600" },
        { text: "NASA RECRUITING", color: "text-white" },
        { text: "YOUR AD HERE", color: "text-red-400 animate-pulse" }
    ],
    'DEFAULT': [
        { text: "JOE'S FERTILIZER", color: "text-amber-700" },
        { text: "BUY TRACTORS", color: "text-green-700" },
        { text: "FRESH MILK DAILY", color: "text-white" }
    ]
};

const GameCanvas: React.FC<GameCanvasProps> = ({ 
    phase, 
    multiplier, 
    bet, 
    weather, 
    inventory, 
    drunkLevel, 
    gameMode,
    politicalEvent,
    onPoliticalAction,
    isChristmasMode,
    farmStats,
    customTheme,
    isLightMode
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [showWinAnim, setShowWinAnim] = useState(false);
  const [showLossAnim, setShowLossAnim] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // Interactive Text State
  const [babaSpeech, setBabaSpeech] = useState<string | null>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Cycle Ads
  useEffect(() => {
      const interval = setInterval(() => {
          setCurrentAdIndex(prev => prev + 1);
      }, 4000);
      return () => clearInterval(interval);
  }, []);

  // Timer logic for urgent events
  useEffect(() => {
      if (politicalEvent?.expiryTime) {
          const updateTimer = () => {
              const remaining = Math.max(0, Math.ceil((politicalEvent.expiryTime! - Date.now()) / 1000));
              setTimeLeft(remaining);
          };
          updateTimer(); // Initial call
          const timer = setInterval(updateTimer, 1000);
          return () => clearInterval(timer);
      } else {
          setTimeLeft(null);
      }
  }, [politicalEvent]);

  // Reset visuals on IDLE
  useEffect(() => {
    if (phase === GamePhase.IDLE || phase === GamePhase.BETTING) {
      setPosition({ x: 5, y: 85 }); // Start bottom left
      setRotation(0);
      setShowWinAnim(false);
      setShowLossAnim(false);
      setParticles([]);
      
      // Randomly clear speech bubble
      if (Math.random() > 0.7) setBabaSpeech(null);
    }
  }, [phase]);

  // Detect Win
  useEffect(() => {
    if (bet.cashedOut && bet.amount > 0 && !showWinAnim) {
      setShowWinAnim(true);
      // Generate particle IDs
      setParticles(Array.from({ length: 30 }, (_, i) => i));
      
      if (gameMode === 'AFCON') {
          audioService.playVuvuzela();
      }
    }
  }, [bet.cashedOut, bet.amount, showWinAnim, gameMode]);

  // Detect Loss
  useEffect(() => {
    if (phase === GamePhase.CRASHED && bet.amount > 0 && !bet.cashedOut) {
      setShowLossAnim(true);
    }
  }, [phase, bet.amount, bet.cashedOut]);

  // Animate flight based on multiplier
  useEffect(() => {
    if (phase === GamePhase.FLYING) {
      // Calculate position based on multiplier log scale to simulate distance
      const progress = Math.min(Math.log10(multiplier) * 40, 90); 
      
      const newX = 5 + progress; 
      // Different trajectory height for modes?
      const newY = 85 - (Math.pow(progress / 90, 0.8) * 70); 

      setPosition({ x: newX, y: newY });
      setRotation(prev => prev + 5 + multiplier); // Spin faster as it goes
      
      // Random Vuvuzela bursts during AFCON flight
      if (gameMode === 'AFCON' && Math.random() < 0.05) {
          audioService.playVuvuzela();
      }
    }
  }, [multiplier, phase, gameMode]);

  const getBgClass = () => {
    if (gameMode === 'CUSTOM') return ''; // handled via style
    if (gameMode === 'SANTA') return 'from-slate-900 to-slate-600 border-t-2 border-white/20'; // Night sky
    if (gameMode === 'SPACE') return 'from-black via-indigo-950 to-purple-950'; // Deep Space
    if (gameMode === 'BEE') return 'from-yellow-100 to-amber-200'; // Garden/Hive
    if (gameMode === 'CARPET') return 'from-indigo-900 via-purple-800 to-orange-800'; // Arabian Night
    if (gameMode === 'CANCER') return 'from-pink-900 via-rose-900 to-slate-900'; // Cancer Awareness
    if (gameMode === 'AFCON') return 'from-yellow-600 via-orange-600 to-red-700'; // Sunset Savannah
    
    // Flag Styles are handled via inline styles in the main return for complexity reasons, or fallback here
    if (gameMode === 'USA' || gameMode === 'MEXICO' || gameMode === 'CANADA') return ''; // Handled inline

    if (gameMode === 'FOOTBALL') {
        if (weather === 'RAINY') return 'from-green-900 to-green-800'; // Muddy pitch
        if (weather === 'SNOW') return 'from-slate-100 to-slate-300'; // Snowy pitch
        return 'from-green-600 to-green-400'; // Grass pitch
    }
    if (gameMode === 'GOLF') {
        if (weather === 'WINDY') return 'from-emerald-400 to-teal-200';
        if (weather === 'SNOW') return 'from-slate-200 to-white';
        return 'from-emerald-300 to-lime-200'; // Fairway
    }

    // Default Orange Mode
    switch (weather) {
        case 'RAINY': return 'from-slate-600 to-slate-500';
        case 'WINDY': return 'from-sky-300 to-slate-200';
        case 'SNOW': return 'from-slate-300 to-slate-100';
        default: return 'from-sky-400 to-sky-200';
    }
  };

  // Flag Styles for World Cup Modes
  const getFlagStyle = (): React.CSSProperties => {
      if (gameMode === 'CUSTOM' && customTheme) {
          return { backgroundImage: `url(${customTheme.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
      }
      if (gameMode === 'USA') {
          return { background: 'linear-gradient(90deg, #002868 35%, transparent 35%), repeating-linear-gradient(180deg, #bf0a30, #bf0a30 20px, #ffffff 20px, #ffffff 40px)' };
      }
      if (gameMode === 'MEXICO') {
          return { background: 'linear-gradient(90deg, #006847 33.3%, #ffffff 33.3%, #ffffff 66.6%, #ce1126 66.6%)' };
      }
      if (gameMode === 'CANADA') {
          return { background: 'linear-gradient(90deg, #ff0000 25%, #ffffff 25%, #ffffff 75%, #ff0000 75%)' };
      }
      return {};
  };

  // Get current ad content
  const getActiveAd = () => {
      let ads = AD_DATA['DEFAULT'];
      if (gameMode === 'FOOTBALL') ads = AD_DATA['FOOTBALL'];
      if (gameMode === 'AFCON') ads = AD_DATA['AFCON'];
      if (gameMode === 'GOLF') ads = AD_DATA['GOLF'];
      if (gameMode === 'CANCER') ads = AD_DATA['CANCER'];
      if (gameMode === 'USA') ads = AD_DATA['USA'];
      
      return ads[currentAdIndex % ads.length];
  };

  const activeAd = getActiveAd();

  // Drunk Visuals Calculation
  const blurAmount = Math.max(0, (drunkLevel - 20) / 15); // Start blurring after 20%
  const swayClass = drunkLevel >= 30 ? (drunkLevel >= 80 ? 'animate-sway-heavy' : 'animate-sway-light') : '';
  
  // Game Assets based on Mode
  let projectileEmoji = '🍊';
  let babaEmoji = '👨‍🌾';
  let groundColor = 'bg-green-600'; // Default
  let babaClass = '';
  let projectileClass = '';
  
  if (gameMode === 'CUSTOM') {
      // Keep defaults but maybe darker ground overlay
      groundColor = 'bg-black/20 backdrop-blur-sm';
  } else if (gameMode === 'FOOTBALL') {
      projectileEmoji = '⚽';
      groundColor = 'bg-green-700 border-t-2 border-white/30'; // Pitch lines
      if (weather === 'SNOW') groundColor = 'bg-white border-t-2 border-slate-300';
      
      if (showWinAnim) {
          babaEmoji = '🙌'; // Celebration
          babaClass = 'animate-celebrate';
      } else if (showLossAnim) {
          babaEmoji = '🤦'; // Disappointment
          babaClass = 'animate-disappointment';
      } else if (phase === GamePhase.FLYING) {
           if (multiplier < 1.5) {
               babaEmoji = '🏃';
               babaClass = 'animate-kick origin-bottom';
           } else {
               babaEmoji = '🏃';
               babaClass = 'skew-x-12'; // Lean forward watching/running
           }
      } else {
          babaEmoji = '🏃'; // Idle/Warmup
          babaClass = 'animate-warmup';
      }

  } else if (gameMode === 'GOLF') {
      projectileEmoji = '⚪';
      babaEmoji = '🏌️';
      groundColor = 'bg-emerald-600';
      if (weather === 'SNOW') groundColor = 'bg-slate-100';
  } else if (gameMode === 'SANTA') {
      projectileEmoji = '❄️';
      babaEmoji = '🎅';
      groundColor = 'bg-slate-100 border-t-4 border-white';
  } else if (gameMode === 'BEE') {
      projectileEmoji = '🐝';
      babaEmoji = '👷'; // Beekeeper
      projectileClass = 'animate-buzz';
      groundColor = 'bg-amber-600';
  } else if (gameMode === 'SPACE') {
      projectileEmoji = '☄️';
      babaEmoji = '👨‍🚀';
      groundColor = 'bg-slate-900 border-t border-slate-700';
  } else if (gameMode === 'CARPET') {
      projectileEmoji = '🧞'; 
      babaEmoji = '👳';
      groundColor = 'bg-orange-900';
      projectileClass = 'animate-float';
  } else if (gameMode === 'CANCER') {
      projectileEmoji = '🦠';
      babaEmoji = '👨‍⚕️';
      groundColor = 'bg-rose-950';
  } else if (gameMode === 'AFCON') {
      projectileEmoji = '⚽';
      babaEmoji = '👨🏿'; 
      groundColor = 'bg-yellow-700/80 border-t-4 border-yellow-600'; // Savanna grass
  } else if (gameMode === 'USA') {
      projectileEmoji = '🦅';
      babaEmoji = '🤠';
      groundColor = 'bg-blue-900 border-t-4 border-white';
  } else if (gameMode === 'MEXICO') {
      projectileEmoji = '⚽'; // World Cup feel
      babaEmoji = '👨🏻'; 
      groundColor = 'bg-green-700 border-t-4 border-white';
  } else if (gameMode === 'CANADA') {
      projectileEmoji = '🍁';
      babaEmoji = '👮'; // Mountie vibes
      groundColor = 'bg-red-800 border-t-4 border-white';
  }

  // Override Emoji if Drunk (but keep Football animations if possible)
  if (drunkLevel >= 30) {
      // In football mode, only override face if not in a special animation state like Win/Loss
      if (gameMode === 'FOOTBALL') {
          if (!showWinAnim && !showLossAnim) {
               babaEmoji = '🥴';
          }
      } else {
          // Normal logic for other modes
          if (drunkLevel >= 80) babaEmoji = gameMode === 'ORANGE' ? '🤮' : '🥴'; 
          else babaEmoji = '🥴';
      }
  }
  
  // Santa Override if Christmas Mode is Active (and not specialized game mode)
  if (isChristmasMode && gameMode === 'ORANGE' && drunkLevel < 80) {
      // Baba wears a hat overlay instead of replacing emoji fully, logic handled in render
  }

  const handleBabaClick = () => {
      let quotes = ["Keep your eye on the orange!", "My arm is getting tired...", "Did you see that crow?", "Invest in seeds!"];
      
      if (gameMode === 'SPACE') quotes = ["Houston, we have a bet.", "One small step for Baba...", "The moon is made of cheese, right?", "Zero gravity, infinite wins."];
      if (gameMode === 'BEE') quotes = ["To bee or not to bee?", "Don't get stung!", "Sweet as honey.", "Buzz buzz!"];
      if (gameMode === 'CARPET') quotes = ["I can show you the world...", "Hold on tight!", "Magic flight!", "Watch out for sandstorms."];
      if (gameMode === 'CANCER') quotes = ["Health is wealth!", "Crush the curve!", "Stay strong!", "Research needs funding!"];
      if (gameMode === 'AFCON') quotes = ["BZZZZZZT!", "For the motherland!", "Hakuna Matata, just win.", "Can you hear the drums?"];
      if (gameMode === 'USA') quotes = ["Land of the free!", "Touchdown!", "I want YOU to bet!", "Freedom fries!", "Yeehaw!"];
      if (gameMode === 'MEXICO') quotes = ["Viva Mexico!", "Spicy!", "Goal goal goal!", "Fiesta time!"];
      if (gameMode === 'CANADA') quotes = ["Eh?", "Sorry!", "True North strong and free.", "Poutine power!", "Watch out for moose!"];
      if (gameMode === 'CUSTOM' && customTheme?.slogan) {
          quotes = [customTheme.slogan, "My World, My Rules!", "Watch this custom throw!"];
      }

      if (drunkLevel >= 50) {
          quotes = ["The ground is moving...", "Who put two moons in the sky?", "I love you man... *hic*", "Watch this trick shot..."];
      } else if (weather === 'RAINY') {
          quotes = ["My boots are soaked!", "Good for the crops, bad for the socks.", "Slippery when wet!"];
      } else if (weather === 'SNOW') {
          quotes = ["Brrr! My toes are frozen!", "Do you want to build a snowman?", "Yellow snow is NOT lemon sorbet.", "Ho ho... oh my back."];
      }

      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setBabaSpeech(randomQuote);
      
      // Auto clear after 3s
      setTimeout(() => setBabaSpeech(null), 3000);
  };


  return (
    <div 
        className={`relative w-full h-[300px] md:h-[400px] bg-gradient-to-b ${getBgClass()} overflow-hidden rounded-xl border-4 ${isChristmasMode ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : (isLightMode ? 'border-black' : 'border-slate-800')} shadow-2xl ${showLossAnim ? 'animate-shake-screen' : ''} ${swayClass}`}
        style={getFlagStyle()}
    >
      
      {/* Christmas Lights Decoration */}
      {isChristmasMode && gameMode !== 'AFCON' && gameMode !== 'USA' && gameMode !== 'MEXICO' && gameMode !== 'CANADA' && gameMode !== 'CUSTOM' && (
          <div className="absolute top-0 left-0 w-full h-4 z-50 flex justify-between px-2">
               {Array.from({length: 20}).map((_, i) => (
                   <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full animate-pulse ${i % 2 === 0 ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-green-500 shadow-[0_0_5px_green]'}`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                   />
               ))}
          </div>
      )}

      {/* Private Jet Flyover */}
      {inventory.includes('m_jet') && gameMode !== 'SPACE' && (
          <div className="absolute top-8 -right-32 animate-sleigh z-0 opacity-80 pointer-events-none" style={{ animationDuration: '20s', animationDelay: '2s' }}>
              <div className="text-6xl drop-shadow-xl transform -scale-x-100">🛩️</div>
              <div className="text-[10px] bg-white text-black font-bold px-1 rounded absolute top-4 left-4 whitespace-nowrap opacity-0 animate-fade-in-out">Baba Air</div>
          </div>
      )}

      {/* Dynamic Blur Layer for Drunkenness */}
      <div 
        className="absolute inset-0 pointer-events-none z-50 transition-all duration-1000"
        style={{ backdropFilter: `blur(${blurAmount}px)` }}
      />

      {/* BACKGROUND BILLBOARDS & ADVERTISING */}
      {(gameMode === 'FOOTBALL' || gameMode === 'AFCON' || gameMode === 'USA' || gameMode === 'MEXICO' || gameMode === 'CANADA') && (
          <div className="absolute bottom-16 left-0 w-full h-10 bg-black/80 border-y-2 border-slate-600 z-0 overflow-hidden flex items-center perspective-[500px]">
              <div className="animate-marquee-slow flex gap-16 whitespace-nowrap opacity-90 w-full px-4">
                  {[...AD_DATA[gameMode === 'FOOTBALL' ? 'FOOTBALL' : 'AFCON'], ...AD_DATA['FOOTBALL']].map((ad, i) => (
                      <div key={i} className={`font-mono font-black text-xs md:text-sm ${ad.color} flex items-center gap-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] shrink-0`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                          {ad.text}
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* ADVERTISE HERE BOARDS */}
      {(gameMode === 'FOOTBALL' || gameMode === 'AFCON' || gameMode === 'USA' || gameMode === 'MEXICO' || gameMode === 'CANADA') && (
          // Upper tier advertising board for stadiums
          <div className="absolute top-20 left-10 w-24 h-12 bg-slate-800 border border-slate-600 rounded z-0 flex items-center justify-center opacity-60 overflow-hidden transform perspective-[500px] rotate-y-12">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
               <div className="text-center p-1">
                   <div className="text-[6px] text-slate-400 uppercase">Spot Open</div>
                   <div className="text-[8px] font-black text-white leading-tight animate-pulse">ADVERTISE<br/>HERE</div>
               </div>
          </div>
      )}

      {gameMode === 'CUSTOM' && customTheme?.slogan && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 z-0 transform -rotate-1 shadow-xl">
              <div className="text-sm font-black text-white uppercase tracking-widest drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]">
                  {customTheme.slogan}
              </div>
          </div>
      )}

      {gameMode === 'GOLF' && (
          <div className="absolute bottom-24 left-10 w-24 h-16 bg-white rounded-lg border-2 border-slate-300 shadow-xl z-0 transform -rotate-6 flex flex-col items-center justify-center p-1 text-center">
              <div className="text-[8px] uppercase text-slate-500 font-bold">Sponsored By</div>
              <div className={`text-[10px] font-black leading-tight ${activeAd.color}`}>{activeAd.text}</div>
              <div className="w-full h-px bg-slate-200 mt-1"></div>
          </div>
      )}

      {gameMode === 'CANCER' && (
          <div className="absolute bottom-32 right-10 w-40 h-20 bg-pink-100 rounded-lg border-4 border-pink-300 shadow-xl z-0 flex flex-col items-center justify-center p-2 text-center transform perspective-[500px] rotate-y-12">
              <div className="flex items-center gap-1 mb-1">
                  <div className="text-pink-600 text-lg">🎗️</div>
                  <div className="text-[10px] font-bold text-pink-800 uppercase">Support Our Cause</div>
              </div>
              <div className={`text-[9px] font-black ${activeAd.color}`}>{activeAd.text}</div>
          </div>
      )}

      {(gameMode === 'ORANGE' || gameMode === 'BEE') && (
          <>
            <div className="absolute bottom-20 right-20 w-4 h-24 bg-amber-900 rounded-sm z-0">
                <div className="absolute -top-12 -left-12 w-28 h-16 bg-amber-100 border-4 border-amber-800 rounded flex items-center justify-center p-2 text-center shadow-lg transform rotate-3">
                    <div className={`font-serif font-bold text-xs ${activeAd.color.replace('text-', 'text-amber-900 ')}`}>{activeAd.text}</div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-slate-400 rounded-full"></div>
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-slate-400 rounded-full"></div>
                </div>
            </div>
            {/* Rustic Advertising Sign */}
            <div className="absolute bottom-24 left-20 z-0 opacity-80 scale-75">
                <div className="w-2 h-16 bg-amber-900 mx-auto"></div>
                <div className="bg-amber-100 w-24 h-16 -mt-16 border-4 border-amber-800 flex items-center justify-center text-center p-1 shadow-lg transform rotate-2">
                    <div className="text-[8px] font-bold text-amber-900 uppercase tracking-widest border-2 border-dotted border-amber-900/50 w-full h-full flex flex-col justify-center">
                        <Megaphone className="w-4 h-4 text-amber-800 mx-auto mb-1" />
                        <span>Your Ad Here</span>
                    </div>
                </div>
            </div>
          </>
      )}

      {/* POLITICAL EVENT BANNER */}
      {politicalEvent && (
        <div className={`absolute top-0 left-0 w-full z-[60] p-2 flex justify-center animate-in slide-in-from-top-4 duration-500`}>
             <div className={`
                flex items-center gap-3 px-4 py-2 rounded-full shadow-lg border border-white/20 backdrop-blur-md max-w-[90%]
                ${politicalEvent.type === 'CORRUPTION' || politicalEvent.type === 'SUPERNATURAL' || politicalEvent.type === 'BETRAYAL' ? 'bg-gradient-to-r from-purple-900/90 to-fuchsia-900/90 text-purple-100' : 
                  politicalEvent.type === 'TAX' || politicalEvent.type === 'STRIKE' ? 'bg-gradient-to-r from-red-900/90 to-rose-900/90 text-red-100' : 
                  politicalEvent.type === 'HUSTLER' ? 'bg-gradient-to-r from-yellow-900/90 to-amber-900/90 text-yellow-100' :
                  'bg-gradient-to-r from-green-900/90 to-emerald-900/90 text-green-100'}
             `}>
                 <div className="shrink-0">
                    {politicalEvent.type === 'CORRUPTION' ? <Briefcase className="w-5 h-5 animate-pulse" /> : 
                     politicalEvent.type === 'TAX' ? <Gavel className="w-5 h-5" /> : 
                     politicalEvent.type === 'SUPERNATURAL' ? <Skull className="w-5 h-5 animate-pulse" /> :
                     politicalEvent.type === 'BETRAYAL' ? <HeartCrack className="w-5 h-5" /> :
                     politicalEvent.type === 'HUSTLER' ? <ShoppingBag className="w-5 h-5" /> :
                     <AlertCircle className="w-5 h-5" />}
                 </div>
                 
                 <div className="flex flex-col">
                     <span className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-1">
                         {politicalEvent.type} EVENT 
                         {timeLeft !== null && (
                             <span className="text-red-300 animate-pulse ml-1">({timeLeft}s)</span>
                         )}
                     </span>
                     <span className="text-sm font-bold leading-tight">{politicalEvent.title}</span>
                 </div>

                 {politicalEvent.cost && onPoliticalAction ? (
                     <div className="flex gap-2 ml-2 border-l border-white/20 pl-2">
                         <button 
                            onClick={() => onPoliticalAction('PAY')}
                            className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap border border-white/10"
                         >
                            Pay ${politicalEvent.cost}
                         </button>
                         <button 
                            onClick={() => onPoliticalAction('IGNORE')}
                            className="bg-black/30 hover:bg-black/50 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap border border-white/10"
                         >
                            {politicalEvent.type === 'CORRUPTION' ? 'Refuse' : 'Wait it out'}
                         </button>
                     </div>
                 ) : (
                    <button 
                        onClick={() => onPoliticalAction && onPoliticalAction('IGNORE')}
                        className="ml-2 hover:bg-black/20 rounded-full p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                 )}
             </div>
        </div>
      )}

      {/* Background Elements */}
      <div className={`absolute bottom-0 w-full h-1/4 ${groundColor} rounded-t-[50%] scale-150 translate-y-8 shadow-inner`} />
      
      {/* Decorative Elements based on Mode */}
      {gameMode === 'ORANGE' && (
          <div className="absolute bottom-4 left-10 w-24 h-24 bg-red-800 rounded-lg shadow-xl z-0">
             <div className="w-full h-full border-2 border-red-900 opacity-50 flex flex-col gap-2 p-1">
                 <div className="w-full h-1/2 border-b-2 border-red-900"></div>
             </div>
             {/* Roof */}
             <div className={`absolute -top-10 -left-2 w-[120%] h-12 clip-path-polygon-[50%_0,0_100%,100%_100%] ${isChristmasMode || weather === 'SNOW' ? 'bg-white' : 'bg-slate-700'}`}></div>
          </div>
      )}

      {gameMode === 'SANTA' && (
          <>
             {/* Snowman */}
             <div className="absolute bottom-10 right-20 text-6xl drop-shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                 ⛄
             </div>
             {/* Moon */}
             <div className="absolute top-10 right-10 w-16 h-16 rounded-full bg-yellow-100 shadow-[0_0_40px_rgba(255,255,255,0.5)]"></div>
          </>
      )}

      {/* Sleigh Animation (Background) */}
      {(isChristmasMode || gameMode === 'SANTA') && gameMode !== 'AFCON' && gameMode !== 'USA' && gameMode !== 'MEXICO' && gameMode !== 'CANADA' && gameMode !== 'CUSTOM' && (
           <div className="absolute top-20 -left-64 flex items-center animate-sleigh z-0 opacity-90 pointer-events-none">
               {/* Banner trailing behind */}
               <div className="bg-white/90 border-2 border-red-500 px-3 py-1 transform rotate-2 shadow-lg rounded-sm">
                   <div className="text-[10px] font-black text-red-600 uppercase leading-none whitespace-nowrap">
                       Advertise<br/>Here
                   </div>
               </div>
               {/* Rope connection */}
               <div className="w-16 h-0.5 bg-white/50 mx-[-2px] self-center"></div>
               {/* Santa & Reindeer */}
               <div className="text-4xl filter drop-shadow-lg">🛷🦌</div>
           </div>
      )}

      {gameMode === 'SPACE' && (
          <>
             {/* Stars */}
             {Array.from({length: 50}).map((_, i) => (
                 <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, animationDuration: `${Math.random()*3}s` }}></div>
             ))}
             {/* Planet */}
             <div className="absolute top-10 right-10 text-6xl opacity-80">🪐</div>
          </>
      )}

      {gameMode === 'BEE' && (
          <>
            {/* Hexagon Pattern */}
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500 via-transparent to-transparent z-0"></div>
             {/* Hive */}
             <div className="absolute top-20 right-10 text-8xl drop-shadow-xl z-0">🛖</div>
             <div className="absolute bottom-10 right-20 text-4xl animate-bounce z-0">🌻</div>
          </>
      )}

      {gameMode === 'CARPET' && (
          <>
             {/* Stars */}
             {Array.from({length: 30}).map((_, i) => (
                 <div key={i} className="absolute w-0.5 h-0.5 bg-yellow-100 rounded-full" style={{ top: `${Math.random()*60}%`, left: `${Math.random()*100}%` }}></div>
             ))}
             {/* Palace Silhouette */}
             <div className="absolute bottom-10 right-0 w-40 h-32 bg-purple-950 opacity-50 z-0 clip-path-polygon-[20%_100%,20%_40%,40%_10%,60%_40%,60%_100%,80%_100%,80%_50%,100%_20%,100%_100%]"></div>
             <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-yellow-100/80 shadow-[0_0_40px_rgba(255,255,200,0.3)]"></div>
          </>
      )}


      {gameMode === 'FOOTBALL' && (
           <>
              {/* Goal Post */}
              <div className="absolute bottom-10 right-10 w-4 h-32 bg-white/50 z-0"></div>
              <div className="absolute bottom-10 right-32 w-4 h-32 bg-white/50 z-0"></div>
              <div className="absolute bottom-40 right-10 w-26 h-2 bg-white/50 z-0"></div>
              {/* Pitch Lines */}
              <div className="absolute bottom-0 w-full h-1/4 flex justify-around opacity-20">
                  <div className="w-20 h-full bg-green-900 skew-x-12"></div>
                  <div className="w-20 h-full bg-green-900 skew-x-12"></div>
                  <div className="w-20 h-full bg-green-900 skew-x-12"></div>
              </div>
           </>
      )}

       {gameMode === 'GOLF' && (
           <>
              {/* Sand Trap */}
              <div className="absolute bottom-12 right-20 w-32 h-12 bg-yellow-200 rounded-full opacity-80 z-0 rotate-6"></div>
              {/* Flag */}
              <div className="absolute bottom-20 right-10 w-1 h-32 bg-slate-400 z-0"></div>
              <div className="absolute bottom-44 right-6 w-12 h-8 bg-red-500 z-0 clip-path-polygon-[0_0,100%_50%,0_100%]"></div>
           </>
      )}

      {gameMode === 'AFCON' && (
          <>
             {/* Acacia Trees Silhouette */}
             <div className="absolute bottom-12 right-10 text-8xl text-black/40 z-0 pointer-events-none scale-150 origin-bottom">🌳</div>
             <div className="absolute bottom-12 left-20 text-6xl text-black/30 z-0 pointer-events-none scale-x-[-1] origin-bottom">🌳</div>
             
             {/* Sun */}
             <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-t from-yellow-500 to-orange-500 rounded-full blur-xl opacity-60 z-0"></div>
             
             {/* Random Vuvuzela Sound Text Effects */}
             {phase === 'FLYING' && Math.random() < 0.1 && (
                 <div className="absolute text-white font-black text-2xl animate-ping opacity-70 rotate-[-10deg]" style={{ top: `${20 + Math.random()*40}%`, left: `${20 + Math.random()*60}%` }}>
                     BZZZZT!
                 </div>
             )}
          </>
      )}

      {gameMode === 'USA' && (
          <>
             {/* Stars Canton Overlay (Top Left) */}
             <div className="absolute top-0 left-0 w-[40%] h-[50%] p-2 flex flex-wrap content-start gap-1 opacity-80 pointer-events-none">
                 {Array.from({length: 20}).map((_, i) => (
                     <div key={i} className="text-white text-xs">★</div>
                 ))}
             </div>
             {/* Statue of Liberty Torch */}
             <div className="absolute bottom-10 right-10 text-6xl opacity-90 drop-shadow-xl z-0 pointer-events-none">🗽</div>
          </>
      )}

      {gameMode === 'MEXICO' && (
          <>
             {/* Eagle Emblem in Center White Stripe */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-30 z-0 pointer-events-none">🦅</div>
             {/* Cactus */}
             <div className="absolute bottom-12 right-16 text-6xl z-0 pointer-events-none">🌵</div>
          </>
      )}

      {gameMode === 'CANADA' && (
          <>
             {/* Maple Leaf in Center */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl text-red-600 opacity-20 z-0 pointer-events-none">🍁</div>
             {/* Pine Trees */}
             <div className="absolute bottom-12 right-10 text-6xl text-green-900 opacity-80 z-0 pointer-events-none">🌲</div>
             <div className="absolute bottom-12 left-10 text-5xl text-green-900 opacity-80 z-0 pointer-events-none">🌲</div>
          </>
      )}
      
      {/* Weather Overlays */}
      {weather === 'RAINY' && gameMode !== 'SPACE' && (
          <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
             {Array.from({ length: 20 }).map((_, i) => (
                 <div key={i} className="absolute bg-blue-200 w-0.5 h-4 animate-rain" style={{
                     left: `${Math.random() * 100}%`,
                     top: `-20px`,
                     animationDuration: `${0.5 + Math.random() * 0.5}s`,
                     animationDelay: `${Math.random()}s`
                 }}></div>
             ))}
          </div>
      )}
      {weather === 'WINDY' && gameMode !== 'SPACE' && (
           <div className="absolute inset-0 pointer-events-none z-0 opacity-30">
              {Array.from({ length: 5 }).map((_, i) => (
                   <div key={i} className="absolute bg-white h-0.5 w-20 animate-wind" style={{
                       left: `-100px`,
                       top: `${20 + Math.random() * 60}%`,
                       animationDuration: `${2 + Math.random()}s`,
                       animationDelay: `${Math.random() * 2}s`
                   }}></div>
              ))}
           </div>
      )}
      {weather === 'SNOW' && gameMode !== 'SPACE' && (
           <div className="absolute inset-0 pointer-events-none z-0 opacity-80">
              {Array.from({ length: 30 }).map((_, i) => (
                   <div key={i} className="absolute text-white animate-rain" style={{
                       left: `${Math.random() * 100}%`,
                       top: `-20px`,
                       fontSize: `${Math.random() * 10 + 10}px`,
                       animationDuration: `${2 + Math.random() * 2}s`,
                       animationDelay: `${Math.random()}s`
                   }}></div>
              ))}
           </div>
      )}

      {/* Trajectory Line */}
      {phase === GamePhase.FLYING && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <path 
                d={`M ${5}% ${85}% Q ${position.x / 2}% ${85}%, ${position.x}% ${position.y}%`}
                fill="none"
                stroke={gameMode === 'SPACE' ? 'cyan' : 'white'}
                strokeWidth="2"
                strokeDasharray="5,5"
                className="opacity-50"
            />
        </svg>
      )}

      {/* Baba The Character */}
      <div 
        className="absolute bottom-8 left-4 z-10 cursor-pointer group"
        onClick={handleBabaClick}
      >
          {/* Interactive Speech Bubble */}
          {babaSpeech && (
              <div className="absolute -top-16 left-0 bg-white text-black p-2 rounded-xl rounded-bl-none text-xs font-bold w-32 shadow-lg animate-bounce-in z-20 pointer-events-none">
                  {babaSpeech}
              </div>
          )}

          <div className={`relative text-6xl filter drop-shadow-lg transition-transform duration-300 ${babaClass} ${drunkLevel >= 80 && gameMode === 'ORANGE' ? 'rotate-90 translate-y-4 origin-bottom-left' : ''}`} style={{ transform: phase === GamePhase.FLYING && gameMode !== 'FOOTBALL' ? 'scale(0.9) skewX(5deg)' : undefined }}>
            {babaEmoji}
            
            {/* Christmas Hat Overlay */}
            {isChristmasMode && gameMode !== 'SANTA' && gameMode !== 'SPACE' && gameMode !== 'AFCON' && gameMode !== 'USA' && gameMode !== 'MEXICO' && gameMode !== 'CANADA' && gameMode !== 'CUSTOM' && drunkLevel < 80 && (
                <div className="absolute -top-4 -right-1 text-3xl rotate-12">🎅</div>
            )}

            {/* AFCON Vuvuzela Overlay */}
            {gameMode === 'AFCON' && (
                <div className="absolute top-2 -right-4 text-4xl -rotate-12 animate-pulse origin-left">🎺</div>
            )}
            
            {/* Mexico Sombrero Overlay */}
            {gameMode === 'MEXICO' && (
                <div className="absolute -top-6 -left-3 text-5xl rotate-0 origin-bottom">👒</div>
            )}

            {/* Visual Inventory */}
            {inventory.includes('w1') && weather === 'RAINY' && gameMode !== 'SPACE' && (
                <div className="absolute -top-2 -right-2 text-3xl animate-bounce" style={{ animationDuration: '3s' }}>☂️</div>
            )}
             {inventory.includes('w3') && weather === 'SUNNY' && gameMode !== 'SPACE' && (
                <div className="absolute top-3 left-2 text-xl">🕶️</div>
            )}
          </div>
      </div>

      {/* PURCHASED ASSETS DISPLAY (Right of Baba) */}
      <div className="absolute bottom-8 left-32 z-10 flex items-end gap-2 pointer-events-none">
          {/* Cows */}
          {farmStats.cows > 0 && (
              <div className="relative group">
                  <div className="text-4xl animate-bounce" style={{ animationDuration: '3s' }}>🐄</div>
                  {farmStats.cows > 1 && (
                      <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] font-bold px-1.5 rounded-full border border-white">
                          x{farmStats.cows}
                      </span>
                  )}
              </div>
          )}
          
          {/* Chickens */}
          {farmStats.chickens > 0 && (
              <div className="relative group">
                  <div className="text-2xl animate-bounce" style={{ animationDuration: '1.5s' }}>🐔</div>
                  {farmStats.chickens > 1 && (
                      <span className="absolute -top-2 -right-2 bg-yellow-600 text-white text-[10px] font-bold px-1.5 rounded-full border border-white">
                          x{farmStats.chickens}
                      </span>
                  )}
              </div>
          )}

          {/* Drinks */}
          {(inventory.includes('m1') || inventory.includes('m2') || drunkLevel > 0) && (
              <div className="text-3xl animate-pulse">🍺</div>
          )}
          
          {/* Hot Cocoa (Snow) */}
          {inventory.includes('w4') && weather === 'SNOW' && (
              <div className="text-3xl">☕</div>
          )}

          {/* Magic Lamp */}
          {inventory.includes('m_lamp') && (
              <div className="text-3xl filter drop-shadow-[0_0_10px_gold]">🧞</div>
          )}
          
          {/* Wheelbarrow (Hustler) */}
          {inventory.includes('m_wheel') && (
              <div className="text-3xl filter drop-shadow-[0_0_10px_yellow]">🛒</div>
          )}
      </div>

      {/* The Projectile (Orange/Ball/Comet/Bee) */}
      <div 
        className="absolute z-20 transition-all duration-75 ease-linear will-change-transform"
        style={{ 
            left: `${position.x}%`, 
            top: `${position.y}%`,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`
        }}
      >
        {phase === GamePhase.CRASHED ? (
             <div className="text-6xl animate-splat relative">
                💥
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">
                    {gameMode === 'CARPET' ? '🧞' : projectileEmoji}
                </span>
             </div>
        ) : phase !== GamePhase.IDLE && phase !== GamePhase.BETTING ? (
            <div className={`text-4xl filter drop-shadow-lg ${projectileClass}`}>
                {gameMode === 'CARPET' ? '🧞' : projectileEmoji}
                {gameMode === 'CARPET' && <div className="absolute -bottom-2 -left-2 text-4xl z-[-1]">🧶</div>}
            </div>
        ) : null}
      </div>

      {/* WIN ANIMATION OVERLAY */}
      {showWinAnim && (
        <div className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center overflow-hidden">
            {/* Radial Burst */}
            <div className="absolute inset-0 bg-yellow-400/20 animate-pulse mix-blend-overlay"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent animate-spin-slow rounded-full blur-3xl"></div>
            
            {/* Dynamic Particles */}
            {particles.map((i) => (
                 <div
                    key={i}
                    className="absolute w-4 h-4 rounded-sm animate-particle-explode"
                    style={{
                        left: '50%',
                        top: '50%',
                        backgroundColor: ['#fbbf24', '#fcd34d', '#ffffff', '#22c55e'][i % 4],
                        '--tx': `${(Math.random() - 0.5) * 600}px`,
                        '--ty': `${(Math.random() - 0.5) * 600}px`,
                        '--r': `${Math.random() * 720}deg`,
                        '--d': `${Math.random() * 0.5}s`
                    } as React.CSSProperties}
                 />
            ))}

            <div className="flex flex-col items-center animate-bounce-in relative z-10">
                <div className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_5px_0_rgba(0,0,0,0.5)] rotate-[-6deg] stroke-black" style={{ WebkitTextStroke: '2px black' }}>
                    {gameMode === 'FOOTBALL' ? 'GOAL!' : gameMode === 'GOLF' ? 'HOLE IN ONE!' : gameMode === 'BEE' ? 'PERFECT FIT!' : gameMode === 'AFCON' ? 'CHAMPIONS!' : 'BIG WIN!'}
                </div>
                <div className="bg-yellow-500 text-white font-mono font-bold text-2xl px-6 py-2 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.6)] border-4 border-yellow-200 mt-4 animate-pulse">
                    +${(bet.amount * (bet.cashOutMultiplier || 0)).toFixed(2)}
                </div>
            </div>
        </div>
      )}

      {/* LOSS ANIMATION OVERLAY */}
      {showLossAnim && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-red-950/60 backdrop-blur-[2px] animate-in fade-in duration-100">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
              
              <div className="relative z-10 flex flex-col items-center animate-shake-hard">
                  <div className="text-6xl md:text-7xl font-black text-red-500 drop-shadow-[0_4px_0_black] tracking-tighter rotate-[5deg]" style={{ WebkitTextStroke: '2px black' }}>
                       {gameMode === 'FOOTBALL' ? 'MISSED!' : gameMode === 'GOLF' ? 'BOGEY!' : gameMode === 'BEE' ? 'STUNG!' : gameMode === 'AFCON' ? 'OFFSIDE!' : 'ROTTEN LUCK'}
                  </div>
                  <div className="text-white font-bold text-xl mt-4 bg-black/50 px-4 py-1 rounded border border-red-500/30">
                      Lost ${bet.amount}
                  </div>
                  <div className="text-8xl mt-6 grayscale opacity-90 drop-shadow-2xl">
                    😵
                  </div>
              </div>
          </div>
      )}

      {/* Multiplier Center Display */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
         {phase === GamePhase.FLYING && (
             <div className="text-6xl md:text-8xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tighter tabular-nums">
                 {multiplier.toFixed(2)}x
             </div>
         )}
         {phase === GamePhase.CRASHED && (
             <div className="flex flex-col items-center">
                 <div className="text-5xl md:text-7xl font-black text-red-500 drop-shadow-[0_2px_0_rgba(255,255,255,1)] rotate-[-10deg]">
                     SPLAT!
                 </div>
                 <div className="text-2xl md:text-3xl font-bold text-white mt-2 bg-red-600 px-4 py-1 rounded-lg border-2 border-red-800">
                    Crashed @ {multiplier.toFixed(2)}x
                 </div>
             </div>
         )}
         {phase === GamePhase.BETTING && (
             <div className="flex flex-col items-center animate-bounce">
                <div className="text-3xl font-bold text-white drop-shadow-md bg-black/30 px-6 py-2 rounded-full backdrop-blur-sm uppercase text-center max-w-xs leading-tight">
                    {drunkLevel >= 80 && gameMode === 'ORANGE' ? 'BABA IS WASTED...' : 
                     gameMode === 'FOOTBALL' ? 'KICK OFF SOON...' :
                     gameMode === 'GOLF' ? 'TEEING UP...' :
                     gameMode === 'SANTA' ? 'SANTA IS READY!' :
                     gameMode === 'SPACE' ? 'ROCKET FUELING...' :
                     gameMode === 'BEE' ? 'HIVE IS BUZZING...' :
                     gameMode === 'CARPET' ? 'MAGIC GATHERING...' :
                     gameMode === 'AFCON' ? 'WARMING UP...' :
                     gameMode === 'USA' ? 'KICK OFF!' :
                     gameMode === 'MEXICO' ? 'VAMOS!' :
                     gameMode === 'CANADA' ? 'FACEOFF!' :
                     gameMode === 'CUSTOM' ? 'USER MODE READY' :
                     'THROWING SOON...'}
                </div>
             </div>
         )}
      </div>

      {/* Loading bar for Betting Phase */}
      {phase === GamePhase.BETTING && (
          <div className="absolute bottom-0 left-0 h-2 bg-orange-500 w-full animate-[width_5s_linear_reverse]" style={{ animationName: 'shrink', animationDuration: '5s', animationTimingFunction: 'linear', animationFillMode: 'forwards' }}></div>
      )}
      <style>{`
        @keyframes marquee-slow {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
            animation: marquee-slow 30s linear infinite;
        }
        @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
        }
        @keyframes shake-screen {
             0%, 100% { transform: translateX(0); }
             10%, 30%, 50%, 70%, 90% { transform: translateX(-4px) rotate(-1deg); }
             20%, 40%, 60%, 80% { transform: translateX(4px) rotate(1deg); }
         }
         .animate-shake-screen {
             animation: shake-screen 0.5s cubic-bezier(.36,.07,.19,.97) both;
         }
         @keyframes shake-hard {
             0%, 100% { transform: translate(0, 0); }
             10% { transform: translate(-10px, -10px); }
             30% { transform: translate(10px, 10px); }
             50% { transform: translate(-10px, 10px); }
             70% { transform: translate(10px, -10px); }
             90% { transform: translate(-5px, 0); }
         }
         .animate-shake-hard {
             animation: shake-hard 0.4s ease-in-out;
         }
         @keyframes particle-explode {
             0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
             100% { transform: translate(var(--tx), var(--ty)) rotate(var(--r)) scale(0); opacity: 0; }
         }
         .animate-particle-explode {
             animation: particle-explode 1s ease-out forwards;
             animation-delay: var(--d);
         }
         @keyframes bounce-in {
             0% { transform: scale(0); }
             50% { transform: scale(1.2); }
             70% { transform: scale(0.9); }
             100% { transform: scale(1); }
         }
         .animate-bounce-in {
             animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
         }
        @keyframes rain {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(300px); opacity: 0; }
        }
        .animate-rain {
            animation: rain 1s linear infinite;
        }
        @keyframes wind {
             0% { transform: translateX(0); opacity: 0; }
             20% { opacity: 0.5; }
             80% { opacity: 0.5; }
             100% { transform: translateX(1200px); opacity: 0; }
        }
        .animate-wind {
            animation: wind 2s linear infinite;
        }
        @keyframes sway-light {
            0%, 100% { transform: rotate(-1deg); }
            50% { transform: rotate(1deg); }
        }
        .animate-sway-light {
            animation: sway-light 4s ease-in-out infinite;
        }
        @keyframes sway-heavy {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
        }
        .animate-sway-heavy {
            animation: sway-heavy 2s ease-in-out infinite;
        }
        @keyframes fade-in-out {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
        }
        .animate-fade-in-out {
            animation: fade-in-out 3s linear infinite;
        }
        /* Football Specific Animations */
        @keyframes warmup {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        .animate-warmup {
            animation: warmup 0.6s ease-in-out infinite;
        }
        @keyframes kick {
             0% { transform: rotate(0deg) translateX(0); }
             30% { transform: rotate(-15deg) translateX(-5px); } /* Wind up */
             60% { transform: rotate(30deg) translateX(10px) translateY(-5px); } /* Kick/Jump */
             100% { transform: rotate(0deg) translateX(0); }
        }
        .animate-kick {
            animation: kick 0.4s ease-out;
        }
        @keyframes celebrate {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.1); }
        }
        .animate-celebrate {
            animation: celebrate 0.5s ease-in-out infinite;
        }
        @keyframes disappointment {
             0%, 100% { transform: rotate(0deg); }
             25% { transform: rotate(-10deg); }
             75% { transform: rotate(10deg); }
        }
        .animate-disappointment {
            animation: disappointment 1s ease-in-out;
        }
        /* Sleigh Animation */
        @keyframes sleigh {
            0% { transform: translateX(-100px) translateY(0); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateX(1000px) translateY(-100px); opacity: 0; }
        }
        .animate-sleigh {
            animation: sleigh 15s linear infinite;
            animation-delay: 5s;
        }
        /* Buzz Animation for Bee */
        @keyframes buzz {
            0% { transform: translateX(0) translateY(0) rotate(0); }
            25% { transform: translateX(-2px) translateY(2px) rotate(-5deg); }
            50% { transform: translateX(2px) translateY(-2px) rotate(5deg); }
            75% { transform: translateX(-2px) translateY(-2px) rotate(-5deg); }
            100% { transform: translateX(0) translateY(0) rotate(0); }
        }
        .animate-buzz {
            animation: buzz 0.2s linear infinite;
        }
        /* Float Animation for Carpet */
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-float {
            animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GameCanvas;
