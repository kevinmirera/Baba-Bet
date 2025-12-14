
import React, { useMemo } from 'react';
import { UserBetHistoryItem } from '../types';
import { ArrowLeft, Clock, TrendingUp, TrendingDown, Activity, PieChart, BarChart3 } from 'lucide-react';

interface BabaAnalyticsProps {
  userHistory: UserBetHistoryItem[];
  balance: number;
  totalTimePlayed: number; // in seconds
  onBack: () => void;
  isLightMode?: boolean;
}

const BabaAnalytics: React.FC<BabaAnalyticsProps> = ({ userHistory, balance, totalTimePlayed, onBack, isLightMode }) => {
  
  // derived stats
  const stats = useMemo(() => {
      const totalBets = userHistory.length;
      const wins = userHistory.filter(h => h.cashedOut).length;
      const losses = totalBets - wins;
      const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;
      
      const totalWagered = userHistory.reduce((acc, h) => acc + h.amount, 0);
      const totalWon = userHistory.reduce((acc, h) => acc + (h.cashedOut ? h.amount * (h.cashOutMultiplier || 0) : 0), 0);
      const profit = totalWon - totalWagered;
      
      const bestWin = userHistory.reduce((max, h) => h.cashedOut ? Math.max(max, h.amount * (h.cashOutMultiplier || 0)) : max, 0);
      
      // Profit History for Graph
      let runningBalance = 0;
      const graphData = userHistory.slice().reverse().map(h => {
          const change = h.cashedOut ? (h.amount * (h.cashOutMultiplier || 0)) - h.amount : -h.amount;
          runningBalance += change;
          return runningBalance;
      });

      return { totalBets, wins, losses, winRate, totalWagered, totalWon, profit, bestWin, graphData };
  }, [userHistory]);

  const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h}h ${m}m ${s}s`;
  };

  // SVG Chart Generators
  const renderLineChart = () => {
      if (stats.graphData.length < 2) return null;
      
      const data = stats.graphData;
      const maxVal = Math.max(...data, 10);
      const minVal = Math.min(...data, -10);
      const range = maxVal - minVal;
      const width = 300;
      const height = 100;
      
      const points = data.map((val, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((val - minVal) / range) * height;
          return `${x},${y}`;
      }).join(' ');

      return (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              {/* Zero Line */}
              <line x1="0" y1={height - ((0 - minVal) / range) * height} x2={width} y2={height - ((0 - minVal) / range) * height} stroke="rgba(255,255,255,0.2)" strokeDasharray="4" />
              <polyline fill="none" stroke={stats.profit >= 0 ? '#22c55e' : '#ef4444'} strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
          </svg>
      );
  };

  const textColor = isLightMode ? 'text-black' : 'text-white';
  const mutedColor = isLightMode ? 'text-gray-500' : 'text-slate-400';
  const cardBg = isLightMode ? 'bg-white border-gray-200' : 'bg-slate-900 border-slate-700';

  return (
    <div className={`min-h-screen p-6 flex flex-col items-center ${isLightMode ? 'bg-gray-100' : 'bg-slate-950'}`}>
        <div className="w-full max-w-4xl">
            <button 
                onClick={onBack}
                className={`mb-6 flex items-center gap-2 font-bold transition-colors ${isLightMode ? 'text-gray-600 hover:text-black' : 'text-slate-400 hover:text-white'}`}
            >
                <ArrowLeft className="w-5 h-5" /> Back to Farm
            </button>

            <header className="mb-8">
                <h1 className={`text-4xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3 ${textColor}`}>
                    <Activity className="w-8 h-8 text-orange-500" /> Baba Analytics
                </h1>
                <p className={`${mutedColor}`}>Deep dive into your farming performance.</p>
            </header>

            {/* Time Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className={`p-6 rounded-2xl border shadow-lg ${cardBg} relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className={`w-16 h-16 ${textColor}`} />
                    </div>
                    <div className={`text-sm font-bold uppercase ${mutedColor} mb-1`}>Time Spent Harvesting</div>
                    <div className={`text-3xl font-mono font-black ${textColor}`}>{formatTime(totalTimePlayed)}</div>
                    <div className="text-xs text-green-500 mt-2 font-bold">+1s every second</div>
                </div>

                <div className={`p-6 rounded-2xl border shadow-lg ${cardBg} relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-16 h-16 text-green-500" />
                    </div>
                    <div className={`text-sm font-bold uppercase ${mutedColor} mb-1`}>Net Profit</div>
                    <div className={`text-3xl font-mono font-black ${stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stats.profit >= 0 ? '+' : ''}${stats.profit.toFixed(2)}
                    </div>
                    <div className={`text-xs ${mutedColor} mt-2`}>Current Balance: <span className="text-green-500 font-bold">${balance.toFixed(0)}</span></div>
                </div>

                <div className={`p-6 rounded-2xl border shadow-lg ${cardBg} relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BarChart3 className="w-16 h-16 text-orange-500" />
                    </div>
                    <div className={`text-sm font-bold uppercase ${mutedColor} mb-1`}>Win Rate</div>
                    <div className={`text-3xl font-mono font-black ${stats.winRate > 50 ? 'text-green-500' : 'text-orange-500'}`}>
                        {stats.winRate.toFixed(1)}%
                    </div>
                    <div className={`text-xs ${mutedColor} mt-2`}>{stats.wins} Wins / {stats.losses} Splats</div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Profit Graph */}
                <div className={`md:col-span-2 p-6 rounded-2xl border shadow-lg ${cardBg}`}>
                    <h3 className={`text-lg font-bold uppercase mb-6 flex items-center gap-2 ${textColor}`}>
                        <TrendingUp className="w-5 h-5" /> Recent Performance (Last 50)
                    </h3>
                    <div className="h-64 w-full bg-black/5 rounded-lg p-4 relative flex items-center justify-center">
                        {stats.totalBets > 1 ? renderLineChart() : (
                            <div className="text-slate-500 text-sm">Not enough data to graph</div>
                        )}
                    </div>
                </div>

                {/* Donut Chart */}
                <div className={`p-6 rounded-2xl border shadow-lg ${cardBg} flex flex-col items-center justify-center`}>
                    <h3 className={`text-lg font-bold uppercase mb-6 flex items-center gap-2 ${textColor}`}>
                        <PieChart className="w-5 h-5" /> Outcome Ratio
                    </h3>
                    
                    <div className="relative w-48 h-48 rounded-full flex items-center justify-center mb-6"
                        style={{
                            background: `conic-gradient(#22c55e ${stats.winRate}%, #ef4444 0)`
                        }}
                    >
                        <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center ${isLightMode ? 'bg-white' : 'bg-slate-900'}`}>
                            <span className={`text-3xl font-black ${textColor}`}>{stats.totalBets}</span>
                            <span className={`text-xs font-bold uppercase ${mutedColor}`}>Total Rounds</span>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className={`text-sm font-bold ${textColor}`}>Wins</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className={`text-sm font-bold ${textColor}`}>Losses</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default BabaAnalytics;
