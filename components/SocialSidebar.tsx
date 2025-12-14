
import React, { useState, useRef, useEffect } from 'react';
import { BotPlayer, ChatMessage, Bet, GamePhase, MarketItem, WeatherType, FarmStats, PoliticalEvent, PoliticalFigure, GameMode, CustomTheme } from '../types';
import { Users, MessageSquare, Send, ShoppingBag, Beer, Clover, Trophy, AlertCircle, CloudRain, Sun, Wind, Tractor, Map, Milk, Egg, Gamepad2, PlayCircle, BarChart2, Gift, Snowflake, Rocket, Sparkles, Shirt, Palette, X, Coins, Lock, Smartphone, Laptop, Diamond, Brush, Eraser, Trash2, Save, Plus, MousePointer2, Loader2, Image as ImageIcon, Printer, Download, MessageCircle, Key, Upload, ImagePlus, Wand2, Type, ChevronLeft, ChevronRight, Plane } from 'lucide-react';
import { generateMerchSlogan, generateModeName, generateModeSlogan, generateBabaImage, generateBackgroundImage } from '../services/geminiService';

interface SocialSidebarProps {
  phase: GamePhase;
  bots: BotPlayer[];
  currentBet: Bet;
  currentMultiplier: number;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  balance: number;
  onBuyItem: (item: MarketItem) => void;
  inventory: string[];
  weather: WeatherType;
  farmStats: FarmStats;
  politicalEvent: PoliticalEvent | null;
  onBuyAsset: (asset: 'cows' | 'land' | 'tractors' | 'chickens' | 'burgers' | 'pizza') => void;
  gameMode: GameMode;
  onSetGameMode: (mode: GameMode, customTheme?: CustomTheme) => void;
  onNavigateToSim?: () => void;
  isChristmasMode?: boolean;
  onOpenSpinner?: () => void;
  isLightMode?: boolean;
}

const MARKET_ITEMS: MarketItem[] = [
    { id: 'm1', name: "Baba's Brew", description: "Home-brewed in a bathtub.", price: 25, icon: <Beer className="w-5 h-5 text-amber-500" />, category: 'BOOZ' },
    { id: 'm2', name: "Zesty Lager", description: "Made with 100% orange peel.", price: 40, icon: <Beer className="w-5 h-5 text-orange-400" />, category: 'BOOZ' },
    { id: 'xm1', name: "Eggnog", description: "Baba's secret Xmas recipe.", price: 60, icon: <Beer className="w-5 h-5 text-yellow-200" />, category: 'BOOZ' }, 
    { id: 'food_burger', name: "Delicious Burger", description: "Fuel for farming.", price: 15, icon: <span className="text-xl">🍔</span>, category: 'LUCK' },
    { id: 'food_pizza', name: "Pizza Slice", description: "Cheesy goodness.", price: 20, icon: <span className="text-xl">🍕</span>, category: 'LUCK' },
    { id: 'm_ticket', name: "Economy Ticket", description: "Get out of the farm for a bit.", price: 250, icon: <span className="text-xl">🎫</span>, category: 'LUCK' },
    { id: 'm_tp', name: "Toilet Roll", description: "For messy situations.", price: 10, icon: <span className="text-xl">🧻</span>, category: 'LUCK' },
    { id: 'm3', name: "Lucky Clover", description: "Might help. Probably won't.", price: 100, icon: <Clover className="w-5 h-5 text-green-500" />, category: 'LUCK' },
    { id: 'm_honey', name: "Honey Comb", description: "Required for Bee Hive.", price: 150, icon: <span className="text-xl">🍯</span>, category: 'LUCK' },
    { id: 'm_vuvuzela', name: "Vuvuzela", description: "BZZZZZT! Required for AFCON.", price: 250, icon: <span className="text-xl">🎺</span>, category: 'LUCK' },
    { id: 'm_usa', name: "Eagle Feather", description: "Freedom! Required for USA.", price: 300, icon: <span className="text-xl">🦅</span>, category: 'LUCK' },
    { id: 'm_mex', name: "Sombrero", description: "Fiesta! Required for Mexico.", price: 300, icon: <span className="text-xl">🌮</span>, category: 'LUCK' },
    { id: 'm_can', name: "Maple Syrup", description: "Sweet! Required for Canada.", price: 300, icon: <span className="text-xl">🍁</span>, category: 'LUCK' },
    { id: 'm_space', name: "Space Helmet", description: "Required for Space.", price: 500, icon: <span className="text-xl">🧑‍🚀</span>, category: 'FLEX' },
    { id: 'm_lamp', name: "Magic Lamp", description: "Required for Carpet.", price: 1000, icon: <span className="text-xl">🧞</span>, category: 'FLEX' },
    { id: 'm_wheel', name: "Wheelbarrow", description: "Hustler essential.", price: 150, icon: <span className="text-xl">🛒</span>, category: 'FLEX' },
    { id: 'm_gourd', name: "Mystic Gourd", description: "Ward off bad spells.", price: 400, icon: <span className="text-xl">🧉</span>, category: 'LUCK' },
    { id: 'm_boots', name: "Golden Boots", description: "Required for Football.", price: 250, icon: <span className="text-xl">👟</span>, category: 'LUCK' },
    { id: 'm_club', name: "Pro Golf Club", description: "Required for Golf.", price: 300, icon: <span className="text-xl">🏌️‍♂️</span>, category: 'LUCK' },
    { id: 'xm2', name: "Xmas Hamper", description: "A bundle of festive joy.", price: 500, icon: <Gift className="w-5 h-5 text-red-400" />, category: 'FLEX' },
    { id: 'm_phone', name: "iPhone 16", description: "Check bets on the go.", price: 1200, icon: <Smartphone className="w-5 h-5 text-blue-400" />, category: 'FLEX' },
    { id: 'shirt_club', name: "Official Kit", description: "Signed by Baba.", price: 2000, icon: <span className="text-xl">👕</span>, category: 'FLEX' },
    { id: 'm_laptop', name: "Pro Laptop", description: "Run simulations in 8K.", price: 2500, icon: <Laptop className="w-5 h-5 text-slate-300" />, category: 'FLEX' },
    { id: 'm_car', name: "Toyota Premio", description: "Reliable transport.", price: 8000, icon: <span className="text-xl">🚗</span>, category: 'FLEX' },
    { id: 'm_coke', name: "Coca-Cola", description: "Premium refreshment. Very pricey.", price: 10000, icon: <span className="text-xl">🥤</span>, category: 'FLEX' },
    { id: 'm_lambo', name: "Lambo Urus", description: "Farmer's dream. Pure speed.", price: 50000, icon: <span className="text-xl">🏎️</span>, category: 'FLEX' },
    { id: 'm_jet', name: "Private Jet", description: "Fly over the farm in style.", price: 100000, icon: <Plane className="w-5 h-5 text-white" />, category: 'FLEX' },
    { id: 'm_diamond', name: "Diamond", description: "Pure luxury. Shows you made it.", price: 50000, icon: <Diamond className="w-5 h-5 text-cyan-400" />, category: 'FLEX' },
    { id: 'm4', name: "Golden Pitchfork", description: "Flex on the poor farmers.", price: 2500, icon: <Trophy className="w-5 h-5 text-yellow-400" />, category: 'FLEX' },
    { id: 'w1', name: "Umbrella", description: "Stay dry when it rains.", price: 300, icon: <CloudRain className="w-5 h-5 text-blue-400" />, category: 'WEATHER', weatherPairing: 'RAINY' },
    { id: 'w2', name: "Goggles", description: "See clearly in the wind.", price: 450, icon: <Wind className="w-5 h-5 text-slate-300" />, category: 'WEATHER', weatherPairing: 'WINDY' },
    { id: 'w3', name: "Cool Shades", description: "Look cool in the sun.", price: 200, icon: <Sun className="w-5 h-5 text-yellow-500" />, category: 'WEATHER', weatherPairing: 'SUNNY' },
    { id: 'w4', name: "Hot Cocoa", description: "Warm up in the snow.", price: 15, icon: <Snowflake className="w-5 h-5 text-white" />, category: 'WEATHER', weatherPairing: 'SNOW' },
];

const POLITICAL_FIGURES: PoliticalFigure[] = [
    { id: 'p1', name: 'Mayor McSqueeze', role: 'Mayor', mood: 'Neutral', avatar: '🎩' },
    { id: 'p2', name: 'Bessie', role: 'Union Leader', mood: 'Angry', avatar: '🐮' },
    { id: 'p3', name: 'Mama Mboga', role: 'Vendor Union', mood: 'Happy', avatar: '🧺' },
    { id: 'p4', name: 'The Hustler', role: 'Street Rep', mood: 'Neutral', avatar: '🛠️' },
    { id: 'p_zoo', name: 'Keeper Ken', role: 'Zoo Keeper', mood: 'Worried', avatar: '🤠' },
    { id: 'p_lion', name: 'King Leo', role: 'Local Lion', mood: 'Hungry', avatar: '🦁' },
    { id: 'p_dragon', name: 'Smaug', role: 'Gold Hoarder', mood: 'Greedy', avatar: '🐉' },
    { id: 'p_dog1', name: 'Rex', role: 'Police Dog', mood: 'Loyal', avatar: '🐕' },
    { id: 'p_dog2', name: 'Fifi', role: 'Show Dog', mood: 'Happy', avatar: '🐩' },
    { id: 'p_dog3', name: 'Spike', role: 'Guard Dog', mood: 'Angry', avatar: '🐶' },
    { id: 'p5', name: 'The Wizard', role: 'Mystic', mood: 'Angry', avatar: '🧙‍♂️' },
];

const SHIRT_COLORS = [
    { name: 'Red', hex: '#ef4444', text: 'white' },
    { name: 'Blue', hex: '#3b82f6', text: 'white' },
    { name: 'Green', hex: '#22c55e', text: 'white' },
    { name: 'Yellow', hex: '#eab308', text: 'black' },
    { name: 'Black', hex: '#171717', text: 'white' },
    { name: 'White', hex: '#ffffff', text: 'black' },
    { name: 'Purple', hex: '#a855f7', text: 'white' },
    { name: 'Orange', hex: '#f97316', text: 'white' },
];

const CLOTHING_TYPES = [
    { 
        id: 'tee', 
        name: 'Classic Tee', 
        price: 500, 
        render: (color: string) => <Shirt className="w-48 h-48 drop-shadow-xl transition-colors duration-300" style={{ color: color, fill: color }} />
    },
    { 
        id: 'hoodie', 
        name: 'Street Hoodie', 
        price: 800, 
        render: (color: string) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-48 h-48 drop-shadow-xl transition-colors duration-300" style={{ color: color, fill: color }}>
                {/* Hood shape approximation */}
                <path d="M12 3a5 5 0 0 0-5 5v2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-3V8a5 5 0 0 0-5-5z" />
                {/* Pocket/Detail */}
                <path d="M9 14h6" stroke="rgba(0,0,0,0.2)" />
                <path d="M12 3v5" stroke="rgba(255,255,255,0.5)" />
            </svg>
        )
    },
    { 
        id: 'cap', 
        name: 'Dad Cap', 
        price: 300, 
        render: (color: string) => (
            <div className="relative w-48 h-48 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-32 h-32 drop-shadow-xl transition-colors duration-300" style={{ color: color, fill: color }}>
                    <path d="M2 14h20" />
                    <path d="M5 14v-4a7 7 0 0 1 14 0v4" />
                    <path d="M12 14v-2" stroke="white" strokeWidth="1" />
                </svg>
            </div>
        )
    },
    { 
        id: 'jersey', 
        name: 'Pro Jersey', 
        price: 1200, 
        render: (color: string) => (
            <div className="relative">
                <Shirt className="w-48 h-48 drop-shadow-xl transition-colors duration-300" style={{ color: color, fill: color }} />
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-20">
                    <div className="w-full h-full border-l-8 border-r-8 border-white mx-auto" style={{ width: '40%' }}></div>
                </div>
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-white/30 text-[8px] font-bold px-1 rounded">SPONSOR</div>
            </div>
        )
    }
];

const SocialSidebar: React.FC<SocialSidebarProps> = ({ 
    phase, 
    bots, 
    currentBet, 
    currentMultiplier, 
    messages, 
    onSendMessage,
    balance,
    onBuyItem,
    inventory,
    weather,
    farmStats,
    politicalEvent,
    onBuyAsset,
    gameMode,
    onSetGameMode,
    onNavigateToSim,
    isChristmasMode,
    onOpenSpinner,
    isLightMode
}) => {
    const [activeTab, setActiveTab] = useState<'CHAT' | 'MARKET' | 'FARM' | 'MODES' | 'MERCH'>('MERCH');
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Custom Mode State
    const [customModePrompt, setCustomModePrompt] = useState('');
    const [isGeneratingMode, setIsGeneratingMode] = useState(false);

    // Merch State
    const [clothingIndex, setClothingIndex] = useState(0);
    const [shirtColor, setShirtColor] = useState(SHIRT_COLORS[0]);
    const [shirtText, setShirtText] = useState('BABA FC');
    const [isGeneratingSlogan, setIsGeneratingSlogan] = useState(false);

    // NFT State
    const [nftPrompt, setNftPrompt] = useState('');
    const [nftImage, setNftImage] = useState<string | null>(null);
    const [isGeneratingNft, setIsGeneratingNft] = useState(false);

    useEffect(() => {
        if (activeTab === 'CHAT' && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

    const handleSend = () => {
        if (chatInput.trim()) {
            onSendMessage(chatInput);
            setChatInput('');
        }
    };

    const handleGenerateCustomMode = async () => {
        if (!customModePrompt.trim()) return;
        setIsGeneratingMode(true);
        
        try {
            const name = await generateModeName();
            const slogan = await generateModeSlogan();
            // In a real app we would use the user prompt for image gen
            const bgImage = await generateBackgroundImage(customModePrompt);
            
            if (bgImage) {
                const newTheme: CustomTheme = {
                    id: Date.now().toString(),
                    name: name,
                    slogan: slogan,
                    backgroundImage: bgImage,
                    createdAt: Date.now()
                };
                onSetGameMode('CUSTOM', newTheme);
                setCustomModePrompt('');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingMode(false);
        }
    };

    const handleGenerateSlogan = async () => {
        setIsGeneratingSlogan(true);
        try {
            const slogan = await generateMerchSlogan();
            setShirtText(slogan);
        } catch (e) {
            setShirtText("Baba Lives");
        } finally {
            setIsGeneratingSlogan(false);
        }
    };

    const nextClothingItem = () => {
        setClothingIndex((prev) => (prev + 1) % CLOTHING_TYPES.length);
    };

    const prevClothingItem = () => {
        setClothingIndex((prev) => (prev - 1 + CLOTHING_TYPES.length) % CLOTHING_TYPES.length);
    };

    const handleBuyCustomMerch = () => {
        const itemType = CLOTHING_TYPES[clothingIndex];
        const cost = itemType.price;
        
        if (balance >= cost) {
            const customItem: MarketItem = {
                id: `custom_${itemType.id}_${Date.now()}`,
                name: `Custom ${itemType.name}`,
                description: `${shirtText} (${shirtColor.name})`,
                price: cost,
                icon: <Shirt className="w-5 h-5" style={{ color: shirtColor.hex }} />,
                category: 'FLEX'
            };
            onBuyItem(customItem);
            // Visual feedback handled by App's handleBuyItem via chat, but let's reset to show action
            setShirtText('BABA FC');
        }
    };

    const handleGenerateNft = async () => {
        if (!nftPrompt.trim()) return;
        setIsGeneratingNft(true);
        setNftImage(null);
        try {
            const image = await generateBabaImage(nftPrompt);
            if (image) setNftImage(image);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingNft(false);
        }
    };

    const handleMintNft = () => {
        const cost = 1000;
        if (balance >= cost && nftImage) {
            const nftItem: MarketItem = {
                id: `nft_${Date.now()}`,
                name: "Baba NFT",
                description: `Rare Mint: ${nftPrompt}`,
                price: cost,
                icon: <div className="w-5 h-5 rounded overflow-hidden bg-slate-900 border border-white/20"><img src={nftImage} alt="NFT" className="w-full h-full object-cover" /></div>,
                category: 'FLEX'
            };
            onBuyItem(nftItem);
            setNftImage(null); 
            setNftPrompt('');
        }
    };

    const tabBaseClass = `flex-1 py-3 flex justify-center items-center gap-1 text-xs font-bold transition-colors border-b-2`;
    const getTabClass = (tab: string) => {
        const isActive = activeTab === tab;
        if (isLightMode) {
            return `${tabBaseClass} ${isActive ? 'bg-gray-100 text-black border-red-500' : 'text-gray-500 hover:text-black border-transparent'}`;
        }
        return `${tabBaseClass} ${isActive ? 'bg-slate-700 text-white border-orange-500' : 'text-slate-400 hover:text-slate-200 border-transparent'}`;
    };

    const containerClass = isLightMode 
        ? 'bg-white border-black text-black' 
        : 'bg-slate-800 border-slate-700 text-white';
        
    const innerBgClass = isLightMode ? 'bg-gray-50' : 'bg-slate-900/50';
    const cardClass = isLightMode ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700';
    const subCardClass = isLightMode ? 'bg-gray-100' : 'bg-slate-900';

    const getMoodColor = (mood: string) => {
        switch (mood) {
            case 'Happy':
            case 'Loyal':
                return 'bg-green-500/20 text-green-500';
            case 'Angry':
            case 'Hungry':
                return 'bg-red-500/20 text-red-500';
            case 'Greedy':
                return 'bg-yellow-500/20 text-yellow-500';
            case 'Neutral':
            case 'Worried':
            default:
                return isLightMode ? 'bg-gray-200 text-gray-500' : 'bg-slate-700 text-slate-400';
        }
    };

    return (
        <div className={`flex flex-col h-full rounded-xl overflow-hidden border shadow-xl ${containerClass}`}>
            {/* Tabs */}
            <div className={`flex ${isLightMode ? 'border-gray-200' : 'border-slate-700'} overflow-x-auto scrollbar-hide`}>
                <button onClick={() => setActiveTab('CHAT')} className={getTabClass('CHAT')}>
                    <MessageSquare className="w-4 h-4 shrink-0" />
                </button>
                <button onClick={() => setActiveTab('MARKET')} className={getTabClass('MARKET')}>
                    <ShoppingBag className="w-4 h-4 shrink-0" />
                </button>
                <button onClick={() => setActiveTab('FARM')} className={getTabClass('FARM')}>
                    <Tractor className="w-4 h-4 shrink-0" />
                </button>
                <button onClick={() => setActiveTab('MODES')} className={getTabClass('MODES')}>
                    <Gamepad2 className="w-4 h-4 shrink-0" />
                </button>
                <button onClick={() => setActiveTab('MERCH')} className={getTabClass('MERCH')}>
                    <Shirt className="w-4 h-4 shrink-0" />
                </button>
            </div>

            <div className={`flex-1 overflow-y-auto min-h-0 ${innerBgClass}`}>
                {activeTab === 'CHAT' && (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                            {/* Live Bet Status in Chat */}
                            {currentBet.amount > 0 && (
                                <div className={`border rounded p-2 mb-2 text-xs ${isLightMode ? 'bg-white border-gray-300' : 'bg-slate-800/50 border-slate-700'}`}>
                                    <div className={`flex justify-between mb-1 ${isLightMode ? 'text-gray-500' : 'text-slate-400'}`}>
                                        <span>Current Bet</span>
                                        <span className={currentBet.cashedOut ? "text-green-500 font-bold" : (isLightMode ? "text-black" : "text-white")}>
                                            {currentBet.cashedOut ? "Cashed Out" : "Active"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className={isLightMode ? 'text-black' : 'text-white'}>${currentBet.amount}</span>
                                        <span className={isLightMode ? 'text-red-600' : 'text-orange-400'}>@ {currentMultiplier.toFixed(2)}x</span>
                                    </div>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div key={msg.id} className={`text-xs p-2 rounded border ${msg.user === 'You' ? (isLightMode ? 'bg-red-50 text-red-900 border-red-200 ml-4' : 'bg-orange-500/20 text-orange-100 ml-4 border-orange-500/30') : (isLightMode ? 'bg-white text-black border-gray-200 mr-4' : 'bg-slate-800 text-slate-300 mr-4 border-slate-700')}`}>
                                    <span className={`font-bold mr-1 ${msg.user === 'You' ? (isLightMode ? 'text-red-600' : 'text-orange-400') : (isLightMode ? 'text-blue-600' : 'text-slate-400')}`}>{msg.user}:</span>
                                    {msg.text}
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className={`p-3 border-t flex gap-2 ${isLightMode ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'}`}>
                            <input 
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Say something..."
                                className={`flex-1 border rounded px-3 py-2 text-xs focus:outline-none ${isLightMode ? 'bg-gray-50 border-gray-300 text-black focus:border-red-500' : 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'}`}
                            />
                            <button 
                                onClick={handleSend}
                                className={`text-white p-2 rounded transition-colors ${isLightMode ? 'bg-red-600 hover:bg-red-500' : 'bg-orange-600 hover:bg-orange-500'}`}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'MARKET' && (
                    <div className="p-3 grid grid-cols-2 gap-2">
                         {/* Wheel Spinner Banner */}
                         <button 
                            onClick={onOpenSpinner}
                            className={`col-span-2 p-3 rounded-lg text-white font-bold flex items-center justify-center gap-2 shadow-lg mb-2 hover:scale-[1.02] transition-transform ${isLightMode ? 'bg-gradient-to-r from-yellow-400 to-red-500' : 'bg-gradient-to-r from-yellow-500 to-orange-600'}`}
                         >
                            <Gift className="w-5 h-5 animate-bounce" />
                            SPIN THE WHEEL
                         </button>

                         {MARKET_ITEMS.map((item) => {
                             const isOwned = item.category !== 'BOOZ' && inventory.includes(item.id);
                             const isAffordable = balance >= item.price;
                             
                             return (
                                 <button
                                    key={item.id}
                                    onClick={() => onBuyItem(item)}
                                    disabled={!isAffordable || isOwned}
                                    className={`flex flex-col items-center p-2 rounded border transition-all ${
                                        isOwned 
                                        ? (isLightMode ? 'bg-green-50 border-green-300 opacity-70' : 'bg-slate-800 border-green-500/50 opacity-70')
                                        : isAffordable 
                                        ? (isLightMode ? 'bg-white border-gray-300 hover:border-red-500 hover:shadow-md' : 'bg-slate-800 border-slate-700 hover:border-orange-500 hover:bg-slate-700')
                                        : (isLightMode ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed' : 'bg-slate-800/50 border-slate-800 opacity-50 cursor-not-allowed')
                                    }`}
                                 >
                                     <div className="mb-1">{item.icon}</div>
                                     <div className={`text-[10px] font-bold text-center leading-tight mb-1 ${isLightMode ? 'text-black' : 'text-white'}`}>{item.name}</div>
                                     <div className={`text-[9px] text-center leading-none mb-1 h-6 overflow-hidden ${isLightMode ? 'text-gray-500' : 'text-slate-400'}`}>{item.description}</div>
                                     {isOwned ? (
                                         <span className="text-[9px] font-bold text-green-500 uppercase">Owned</span>
                                     ) : (
                                         <span className={`text-[10px] font-mono font-bold ${isAffordable ? 'text-green-500' : 'text-red-500'}`}>${item.price}</span>
                                     )}
                                 </button>
                             );
                         })}
                    </div>
                )}

                {activeTab === 'MERCH' && (
                    <div className="p-4 flex flex-col gap-6">
                        <div className={`text-center ${isLightMode ? 'text-black' : 'text-white'}`}>
                            <h2 className="text-xl font-black uppercase tracking-wider">Design Your Drip</h2>
                            <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-slate-400'}`}>Customize your own Baba Merch.</p>
                        </div>

                        {/* Custom Clothing Carousel */}
                        <div className={`p-4 rounded-xl border ${cardClass}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Shirt className={`w-5 h-5 ${isLightMode ? 'text-black' : 'text-white'}`} />
                                    <h3 className={`text-sm font-bold uppercase ${isLightMode ? 'text-black' : 'text-white'}`}>{CLOTHING_TYPES[clothingIndex].name}</h3>
                                </div>
                                <div className={`text-sm font-bold ${isLightMode ? 'text-green-600' : 'text-green-400'}`}>
                                    ${CLOTHING_TYPES[clothingIndex].price}
                                </div>
                            </div>

                            {/* Preview Area with Carousel Controls */}
                            <div className={`relative w-full aspect-square rounded-2xl flex items-center justify-center shadow-inner border mb-4 group ${isLightMode ? 'bg-gray-100 border-gray-300' : 'bg-slate-950 border-slate-800'}`}>
                                {/* Navigation Buttons */}
                                <button 
                                    onClick={prevClothingItem}
                                    className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full z-10 hover:bg-black/10 transition-colors ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button 
                                    onClick={nextClothingItem}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full z-10 hover:bg-black/10 transition-colors ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>

                                {/* Render Selected Item */}
                                <div className="transition-all duration-300 transform scale-100 group-hover:scale-105">
                                    {CLOTHING_TYPES[clothingIndex].render(shirtColor.hex)}
                                </div>

                                {/* Text Overlay (only for tops, hidden for caps if needed but we show it for fun) */}
                                <div 
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-32 font-black uppercase tracking-tighter leading-none break-words pointer-events-none"
                                    style={{ color: shirtColor.text, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                                >
                                    {shirtText || 'YOUR TEXT'}
                                </div>
                                
                                {/* Brand Tag */}
                                <div className="absolute bottom-4 right-4 bg-black text-white text-[8px] font-bold px-2 py-0.5 rounded rotate-[-5deg]">
                                    BABA AUTHENTIC
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="mb-4">
                                <label className={`text-xs font-bold uppercase mb-2 flex items-center gap-2 ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
                                    <Palette className="w-3 h-3" /> Select Color
                                </label>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {SHIRT_COLORS.map(c => (
                                        <button
                                            key={c.name}
                                            onClick={() => setShirtColor(c)}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${shirtColor.name === c.name ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-blue-500' : 'border-transparent'}`}
                                            style={{ backgroundColor: c.hex }}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className={`text-xs font-bold uppercase mb-2 flex items-center gap-2 ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
                                    <Type className="w-3 h-3" /> Custom Slogan
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        maxLength={15}
                                        value={shirtText}
                                        onChange={(e) => setShirtText(e.target.value)}
                                        className={`flex-1 border rounded px-3 py-2 text-sm font-bold uppercase focus:outline-none ${isLightMode ? 'bg-gray-50 border-gray-300 text-black focus:border-red-500' : 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'}`}
                                        placeholder="MAX 15 CHARS"
                                    />
                                    <button 
                                        onClick={handleGenerateSlogan}
                                        disabled={isGeneratingSlogan}
                                        className={`p-2 rounded border transition-colors ${isLightMode ? 'bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200' : 'bg-purple-900/30 text-purple-400 border-purple-500/30 hover:bg-purple-900/50'}`}
                                        title="Generate AI Slogan"
                                    >
                                        {isGeneratingSlogan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={handleBuyCustomMerch}
                                disabled={balance < CLOTHING_TYPES[clothingIndex].price}
                                className={`w-full py-3 font-bold uppercase rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isLightMode ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}
                            >
                                <ShoppingBag className="w-4 h-4" /> Buy {CLOTHING_TYPES[clothingIndex].name} (${CLOTHING_TYPES[clothingIndex].price})
                            </button>
                        </div>

                        {/* Baba NFT Section */}
                        <div className={`p-4 rounded-xl border ${cardClass}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <ImageIcon className={`w-5 h-5 ${isLightMode ? 'text-black' : 'text-white'}`} />
                                <h3 className={`text-sm font-bold uppercase ${isLightMode ? 'text-black' : 'text-white'}`}>Mint Baba NFT</h3>
                            </div>

                            <div className="mb-4">
                                <label className={`text-xs font-bold uppercase mb-2 block ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
                                    Description
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={nftPrompt}
                                        onChange={(e) => setNftPrompt(e.target.value)}
                                        className={`flex-1 border rounded px-3 py-2 text-xs focus:outline-none ${isLightMode ? 'bg-gray-50 border-gray-300 text-black focus:border-red-500' : 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'}`}
                                        placeholder="e.g. Baba as an astronaut on Mars"
                                    />
                                    <button 
                                        onClick={handleGenerateNft}
                                        disabled={isGeneratingNft || !nftPrompt}
                                        className={`p-2 rounded border transition-colors ${isLightMode ? 'bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200' : 'bg-purple-900/30 text-purple-400 border-purple-500/30 hover:bg-purple-900/50'} disabled:opacity-50`}
                                        title="Generate Image"
                                    >
                                        {isGeneratingNft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {nftImage ? (
                                <div className="mb-4 animate-in fade-in zoom-in-95">
                                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] mb-2 relative group">
                                        <img src={nftImage} alt="Generated NFT" className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded">RARE</div>
                                    </div>
                                    <button 
                                        onClick={handleMintNft}
                                        disabled={balance < 1000}
                                        className={`w-full py-3 font-bold uppercase rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isLightMode ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-purple-600 text-white hover:bg-purple-500'}`}
                                    >
                                        <Diamond className="w-4 h-4" /> Mint NFT ($1,000)
                                    </button>
                                </div>
                            ) : (
                                <div className={`aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center p-4 mb-4 ${isLightMode ? 'border-gray-300 bg-gray-50' : 'border-slate-700 bg-slate-900/50'}`}>
                                    <ImageIcon className={`w-8 h-8 mb-2 ${isLightMode ? 'text-gray-400' : 'text-slate-600'}`} />
                                    <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-slate-500'}`}>
                                        Enter a prompt and generate your unique Baba art.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'FARM' && (
                    <div className="p-3 space-y-4">
                        <div className={`rounded-lg p-3 border ${cardClass}`}>
                            <h3 className={`text-xs font-bold uppercase mb-2 flex items-center gap-1 ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
                                <Tractor className="w-3 h-3" /> Farm Assets
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                <div className={`${subCardClass} p-2 rounded text-center`}>
                                    <div className="text-xl">🐄</div>
                                    <div className={`text-[10px] ${isLightMode ? 'text-gray-500' : 'text-slate-400'}`}>Cows</div>
                                    <div className={`font-bold ${isLightMode ? 'text-black' : 'text-white'}`}>{farmStats.cows}</div>
                                </div>
                                <div className={`${subCardClass} p-2 rounded text-center`}>
                                    <div className="text-xl">🚜</div>
                                    <div className={`text-[10px] ${isLightMode ? 'text-gray-500' : 'text-slate-400'}`}>Tractors</div>
                                    <div className={`font-bold ${isLightMode ? 'text-black' : 'text-white'}`}>{farmStats.tractors}</div>
                                </div>
                                <div className={`${subCardClass} p-2 rounded text-center`}>
                                    <div className="text-xl">🏞️</div>
                                    <div className={`text-[10px] ${isLightMode ? 'text-gray-500' : 'text-slate-400'}`}>Land</div>
                                    <div className={`font-bold ${isLightMode ? 'text-black' : 'text-white'}`}>{farmStats.land}</div>
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-lg p-3 border ${cardClass}`}>
                            <h3 className={`text-xs font-bold uppercase mb-2 flex items-center gap-1 ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
                                <ShoppingBag className="w-3 h-3" /> Buy Assets
                            </h3>
                            <div className="space-y-2">
                                <button onClick={() => onBuyAsset('chickens')} disabled={balance < 300} className={`w-full flex justify-between items-center p-2 rounded border disabled:opacity-50 ${isLightMode ? 'bg-white hover:bg-gray-50 border-gray-300' : 'bg-slate-900 hover:bg-slate-950 border-slate-700'}`}>
                                    <span className="text-xs flex items-center gap-2">🐔 Chickens (+$5/rnd)</span>
                                    <span className="text-xs font-mono text-green-500">$300</span>
                                </button>
                                <button onClick={() => onBuyAsset('cows')} disabled={balance < 200} className={`w-full flex justify-between items-center p-2 rounded border disabled:opacity-50 ${isLightMode ? 'bg-white hover:bg-gray-50 border-gray-300' : 'bg-slate-900 hover:bg-slate-950 border-slate-700'}`}>
                                    <span className="text-xs flex items-center gap-2">🐄 Cow (+$2/rnd)</span>
                                    <span className="text-xs font-mono text-green-500">$200</span>
                                </button>
                                <button onClick={() => onBuyAsset('tractors')} disabled={balance < 5000} className={`w-full flex justify-between items-center p-2 rounded border disabled:opacity-50 ${isLightMode ? 'bg-white hover:bg-gray-50 border-gray-300' : 'bg-slate-900 hover:bg-slate-950 border-slate-700'}`}>
                                    <span className="text-xs flex items-center gap-2">🚜 Tractor (+$100/rnd)</span>
                                    <span className="text-xs font-mono text-green-500">$5000</span>
                                </button>
                            </div>
                        </div>

                        <div className={`rounded-lg p-3 border ${cardClass}`}>
                             <h3 className={`text-xs font-bold uppercase mb-2 flex items-center gap-1 ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
                                <Users className="w-3 h-3" /> Local Politics
                            </h3>
                            <div className="space-y-2">
                                {POLITICAL_FIGURES.map(fig => (
                                    <div key={fig.id} className={`flex items-center justify-between text-xs p-2 rounded border ${subCardClass} ${isLightMode ? 'border-gray-200' : 'border-slate-800'}`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{fig.avatar}</span>
                                            <div>
                                                <div className="font-bold">{fig.name}</div>
                                                <div className={`text-[9px] ${isLightMode ? 'text-gray-500' : 'text-slate-500'}`}>{fig.role}</div>
                                            </div>
                                        </div>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getMoodColor(fig.mood)}`}>
                                            {fig.mood}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'MODES' && (
                    <div className="p-3 space-y-3">
                        {/* Football Sim Card */}
                        <div 
                            onClick={onNavigateToSim}
                            className={`p-3 rounded-xl border cursor-pointer transition-all group ${isLightMode ? 'bg-green-50 border-green-200 hover:border-green-500' : 'bg-green-900/40 border-green-500/30 hover:border-green-500'}`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                                    <Trophy className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className={`text-sm font-black uppercase ${isLightMode ? 'text-green-900' : 'text-white'}`}>Football Manager</h3>
                                    <p className={`text-[10px] ${isLightMode ? 'text-green-700' : 'text-green-200'}`}>Simulate matches & win cups.</p>
                                </div>
                            </div>
                        </div>

                        {/* Standard Mode Selectors */}
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => onSetGameMode('ORANGE')}
                                className={`p-2 rounded border text-xs font-bold transition-all ${gameMode === 'ORANGE' ? 'bg-orange-600 border-orange-400 text-white' : (isLightMode ? 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50' : 'bg-slate-800 border-slate-700 text-slate-400')}`}
                            >
                                🍊 Classic
                            </button>
                            <button 
                                onClick={() => onSetGameMode('FOOTBALL')}
                                className={`p-2 rounded border text-xs font-bold transition-all ${gameMode === 'FOOTBALL' ? 'bg-green-600 border-green-400 text-white' : (isLightMode ? 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50' : 'bg-slate-800 border-slate-700 text-slate-400')}`}
                            >
                                ⚽ Football
                            </button>
                            <button 
                                onClick={() => onSetGameMode('GOLF')}
                                className={`p-2 rounded border text-xs font-bold transition-all ${gameMode === 'GOLF' ? 'bg-emerald-600 border-emerald-400 text-white' : (isLightMode ? 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50' : 'bg-slate-800 border-slate-700 text-slate-400')}`}
                            >
                                ⛳ Golf
                            </button>
                            <button 
                                onClick={() => onSetGameMode('SPACE')}
                                disabled={!inventory.includes('m_space')}
                                className={`p-2 rounded border text-xs font-bold transition-all ${gameMode === 'SPACE' ? 'bg-indigo-600 border-indigo-400 text-white' : (isLightMode ? 'bg-white border-gray-300 text-gray-400 opacity-50' : 'bg-slate-800 border-slate-700 text-slate-400 opacity-50')}`}
                            >
                                {inventory.includes('m_space') ? '🚀 Space' : '🔒 Space (Need Helmet)'}
                            </button>
                            <button 
                                onClick={() => onSetGameMode('AFCON')}
                                disabled={!inventory.includes('m_vuvuzela')}
                                className={`p-2 rounded border text-xs font-bold transition-all ${gameMode === 'AFCON' ? 'bg-yellow-600 border-yellow-400 text-white' : (isLightMode ? 'bg-white border-gray-300 text-gray-400 opacity-50' : 'bg-slate-800 border-slate-700 text-slate-400 opacity-50')}`}
                            >
                                {inventory.includes('m_vuvuzela') ? '🏆 AFCON' : '🔒 AFCON (Need Vuvuzela)'}
                            </button>
                             <button 
                                onClick={() => onSetGameMode('USA')}
                                disabled={!inventory.includes('m_usa')}
                                className={`p-2 rounded border text-xs font-bold transition-all ${gameMode === 'USA' ? 'bg-blue-600 border-red-400 text-white' : (isLightMode ? 'bg-white border-gray-300 text-gray-400 opacity-50' : 'bg-slate-800 border-slate-700 text-slate-400 opacity-50')}`}
                            >
                                {inventory.includes('m_usa') ? '🦅 USA' : '🔒 USA (Need Feather)'}
                            </button>
                        </div>

                        {/* Custom Mode Generator */}
                        <div className={`rounded-xl p-3 border mt-4 ${cardClass}`}>
                            <h3 className={`text-xs font-bold uppercase mb-2 flex items-center gap-1 ${isLightMode ? 'text-gray-600' : 'text-slate-400'}`}>
                                <Sparkles className="w-3 h-3 text-purple-400" /> AI Custom Mode
                            </h3>
                            <div className="space-y-2">
                                <input 
                                    type="text" 
                                    value={customModePrompt}
                                    onChange={(e) => setCustomModePrompt(e.target.value)}
                                    placeholder="e.g., A cyberpunk city with neon lights..."
                                    className={`w-full border rounded p-2 text-xs focus:border-purple-500 focus:outline-none ${isLightMode ? 'bg-white border-gray-300 text-black' : 'bg-slate-900 border-slate-700 text-white'}`}
                                />
                                <button 
                                    onClick={handleGenerateCustomMode}
                                    disabled={isGeneratingMode || !customModePrompt}
                                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded text-xs flex items-center justify-center gap-2"
                                >
                                    {isGeneratingMode ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brush className="w-3 h-3" />}
                                    Generate Theme
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialSidebar;
