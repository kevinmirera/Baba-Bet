
import React, { useState } from 'react';
import { Trophy, Globe, AlertTriangle, ArrowLeft, HeartCrack, Wallet, Goal, Flag, Flame, MapPin, TrendingUp, X, CheckCircle2, XCircle, HelpCircle, Heart, PenTool, Briefcase, Copy, Check, Smartphone, Bitcoin } from 'lucide-react';

interface ResponsibleGamblingProps {
  onBack: () => void;
}

interface TriviaQuestion {
    q: string;
    options: string[];
    answer: string;
}

const LEAGUE_TRIVIA: Record<string, TriviaQuestion[]> = {
    'WORLDCUP': [
        { q: "Which country has won the most World Cups?", options: ["Germany", "Brazil", "Italy", "Argentina"], answer: "Brazil" },
        { q: "Who hosted the first World Cup in Africa (2010)?", options: ["Egypt", "Nigeria", "South Africa", "Morocco"], answer: "South Africa" },
        { q: "Which player has the most goals in World Cup history?", options: ["Ronaldo (R9)", "Miroslav Klose", "Lionel Messi", "Pele"], answer: "Miroslav Klose" }
    ],
    'CAF': [
        { q: "Which club has the most CAF Champions League titles?", options: ["Zamalek", "TP Mazembe", "Al Ahly", "Espérance"], answer: "Al Ahly" },
        { q: "Which country's clubs have won the most titles?", options: ["Egypt", "Tunisia", "Morocco", "DR Congo"], answer: "Egypt" },
        { q: "Who is the top scorer in CAF Champions League history?", options: ["Trésor Mputu", "Mohamed Aboutrika", "Mbwana Samatta", "Flávio Amado"], answer: "Trésor Mputu" }
    ],
    'EPL': [
        { q: "Which is the only team to go an entire EPL season unbeaten?", options: ["Man City", "Man Utd", "Arsenal", "Liverpool"], answer: "Arsenal" },
        { q: "Who is the all-time top scorer of the Premier League?", options: ["Wayne Rooney", "Alan Shearer", "Harry Kane", "Thierry Henry"], answer: "Alan Shearer" },
        { q: "Which manager has won the most EPL titles?", options: ["Pep Guardiola", "Arsene Wenger", "Jose Mourinho", "Alex Ferguson"], answer: "Alex Ferguson" }
    ],
    'TURKISH': [
        { q: "Which derby is played between Galatasaray and Fenerbahçe?", options: ["The Intercontinental Derby", "The Bosphorus Clash", "The Istanbul War", "The Anatolian Derby"], answer: "The Intercontinental Derby" },
        { q: "Which team has the most Süper Lig championships?", options: ["Beşiktaş", "Fenerbahçe", "Galatasaray", "Trabzonspor"], answer: "Galatasaray" },
        { q: "What is the nickname of the Turkish National Team?", options: ["The Crescent Stars", "The Ottoman Warriors", "The Sultans", "The Anatolian Eagles"], answer: "The Crescent Stars" }
    ],
    'KPL': [
        { q: "The 'Mashemeji Derby' is contested by which two teams?", options: ["Tusker & Mathare", "Gor Mahia & AFC Leopards", "Bandari & Ulinzi", "Sofapaka & KCB"], answer: "Gor Mahia & AFC Leopards" },
        { q: "Which team is known as 'K'Ogalo'?", options: ["AFC Leopards", "Tusker FC", "Gor Mahia", "Kakamega Homeboyz"], answer: "Gor Mahia" },
        { q: "Who sponsors the current Kenya Premier League?", options: ["SportPesa", "BetKing", "FKF", "Azam"], answer: "FKF" }
    ],
    'PSL': [
        { q: "Which match is known as the 'Soweto Derby'?", options: ["Chiefs vs Pirates", "Sundowns vs SuperSport", "Amazulu vs Arrows", "Ajax vs City"], answer: "Chiefs vs Pirates" },
        { q: "Which team is nicknamed 'Masandawana'?", options: ["Orlando Pirates", "Kaizer Chiefs", "Mamelodi Sundowns", "Cape Town City"], answer: "Mamelodi Sundowns" },
        { q: "Who is the all-time top scorer in the PSL era?", options: ["Benni McCarthy", "Siyabonga Nomvethe", "Katlego Mphela", "Collins Mbesuma"], answer: "Siyabonga Nomvethe" }
    ]
};

const ResponsibleGambling: React.FC<ResponsibleGamblingProps> = ({ onBack }) => {
  const [activeTriviaLeague, setActiveTriviaLeague] = useState<string | null>(null);
  const [triviaStep, setTriviaStep] = useState(0);
  const [triviaScore, setTriviaScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Monetization Modal State
  const [supportModal, setSupportModal] = useState<'DONATE' | 'FEATURE' | 'SPONSOR' | null>(null);
  const [copied, setCopied] = useState(false);

  const startTrivia = (leagueKey: string) => {
      setActiveTriviaLeague(leagueKey);
      setTriviaStep(0);
      setTriviaScore(0);
      setShowResult(false);
      setSelectedAnswer(null);
  };

  const closeTrivia = () => {
      setActiveTriviaLeague(null);
  };

  const handleAnswer = (option: string) => {
      if (selectedAnswer || !activeTriviaLeague) return;
      
      setSelectedAnswer(option);
      const isCorrect = option === LEAGUE_TRIVIA[activeTriviaLeague][triviaStep].answer;
      
      if (isCorrect) setTriviaScore(prev => prev + 1);

      setTimeout(() => {
          if (triviaStep < 2) {
              setTriviaStep(prev => prev + 1);
              setSelectedAnswer(null);
          } else {
              setShowResult(true);
          }
      }, 1000);
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-6 md:p-12 flex flex-col items-center animate-in fade-in duration-500 relative">
      
      {/* TRIVIA MODAL */}
      {activeTriviaLeague && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                  <button onClick={closeTrivia} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                      <X className="w-6 h-6" />
                  </button>

                  <div className="bg-slate-800 p-6 text-center border-b border-slate-700">
                      <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
                          <HelpCircle className="w-6 h-6 text-orange-500" />
                          Trivia Time
                      </h3>
                  </div>

                  <div className="p-6">
                      {!showResult ? (
                          <>
                              <div className="flex justify-between text-xs font-bold text-slate-500 mb-4">
                                  <span>Question {triviaStep + 1}/3</span>
                                  <span>Score: {triviaScore}</span>
                              </div>
                              
                              <h4 className="text-lg font-bold text-white mb-6 leading-relaxed">
                                  {LEAGUE_TRIVIA[activeTriviaLeague][triviaStep].q}
                              </h4>

                              <div className="space-y-3">
                                  {LEAGUE_TRIVIA[activeTriviaLeague][triviaStep].options.map((opt, idx) => {
                                      const isSelected = selectedAnswer === opt;
                                      const isCorrect = opt === LEAGUE_TRIVIA[activeTriviaLeague][triviaStep].answer;
                                      
                                      let btnClass = "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300";
                                      if (selectedAnswer) {
                                          if (isCorrect) btnClass = "bg-green-600 border-green-500 text-white";
                                          else if (isSelected) btnClass = "bg-red-600 border-red-500 text-white";
                                          else btnClass = "bg-slate-800 border-slate-700 opacity-50";
                                      }

                                      return (
                                          <button
                                              key={idx}
                                              onClick={() => handleAnswer(opt)}
                                              disabled={!!selectedAnswer}
                                              className={`w-full p-4 rounded-xl border font-bold text-left transition-all flex justify-between items-center ${btnClass}`}
                                          >
                                              {opt}
                                              {selectedAnswer && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                                              {selectedAnswer && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-white" />}
                                          </button>
                                      );
                                  })}
                              </div>
                          </>
                      ) : (
                          <div className="text-center py-8">
                              <div className="text-6xl mb-4">
                                  {triviaScore === 3 ? '🏆' : triviaScore === 2 ? '🥈' : '📚'}
                              </div>
                              <h2 className="text-3xl font-black text-white mb-2">
                                  You scored {triviaScore}/3
                              </h2>
                              <p className="text-slate-400 mb-8">
                                  {triviaScore === 3 ? "You're a football encyclopedia!" : "Good effort! Keep studying the game."}
                              </p>
                              <button 
                                  onClick={closeTrivia}
                                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors"
                              >
                                  Close Trivia
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* SUPPORT / MONETIZATION MODAL */}
      {supportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-slate-900 border-2 border-slate-600 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                  <button onClick={() => setSupportModal(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                      <X className="w-6 h-6" />
                  </button>
                  
                  <div className="p-8">
                      {supportModal === 'DONATE' && (
                          <div className="text-center">
                              <div className="inline-flex p-4 bg-orange-500/20 rounded-full mb-4">
                                  <Heart className="w-10 h-10 text-orange-500" />
                              </div>
                              <h3 className="text-2xl font-black text-white mb-2">Buy Baba a Coffee</h3>
                              <p className="text-slate-400 mb-6">Keeping the oranges flying costs money. Your donation helps us maintain servers and build new features like "Baba's Space Program".</p>
                              
                              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left mb-4">
                                  <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-bold mb-2">
                                    <Smartphone className="w-3 h-3" /> Mobile Money / M-Pesa
                                  </div>
                                  <div className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                                      <code className="text-orange-400 font-mono text-lg font-bold">0782813854</code>
                                      <button onClick={() => handleCopy("0782813854")} className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
                                          {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                      </button>
                                  </div>
                                  <div className="text-[10px] text-slate-600 mt-2 italic">
                                      * Send contributions to this number
                                  </div>
                              </div>

                              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left mb-4">
                                  <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-bold mb-2">
                                    <Bitcoin className="w-3 h-3" /> Bitcoin (BTC) Donation
                                  </div>
                                  <div className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                                      <code className="text-orange-400 font-mono text-xs md:text-sm font-bold truncate mr-2">1EoupeVLQ3qUhEQ2bZQsduyefzLRXnwVDQ</code>
                                      <button onClick={() => handleCopy("1EoupeVLQ3qUhEQ2bZQsduyefzLRXnwVDQ")} className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0">
                                          {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                      </button>
                                  </div>
                              </div>
                          </div>
                      )}

                      {supportModal === 'FEATURE' && (
                          <div className="text-center">
                              <div className="inline-flex p-4 bg-purple-500/20 rounded-full mb-4">
                                  <PenTool className="w-10 h-10 text-purple-500" />
                              </div>
                              <h3 className="text-2xl font-black text-white mb-2">Be Featured in a Story</h3>
                              <p className="text-slate-400 mb-6">Want to be immortalized in BabaBet lore? We can name a Cow, a Rival Farmer, or a Bot after you!</p>
                              
                              <div className="space-y-3 mb-6">
                                  <div className="p-3 bg-slate-800 rounded-lg flex justify-between items-center">
                                      <span className="font-bold">Name a Cow</span>
                                      <span className="text-purple-400 font-mono">$10</span>
                                  </div>
                                  <div className="p-3 bg-slate-800 rounded-lg flex justify-between items-center">
                                      <span className="font-bold">Name a Bot Player</span>
                                      <span className="text-purple-400 font-mono">$25</span>
                                  </div>
                                  <div className="p-3 bg-slate-800 rounded-lg flex justify-between items-center">
                                      <span className="font-bold">Become a Rival Boss</span>
                                      <span className="text-purple-400 font-mono">$100</span>
                                  </div>
                              </div>
                              <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl">
                                  Contact Editorial Team
                              </button>
                          </div>
                      )}

                      {supportModal === 'SPONSOR' && (
                          <div className="text-center">
                              <div className="inline-flex p-4 bg-blue-500/20 rounded-full mb-4">
                                  <Briefcase className="w-10 h-10 text-blue-500" />
                              </div>
                              <h3 className="text-2xl font-black text-white mb-2">Club Sponsorship</h3>
                              <p className="text-slate-400 mb-6">Promote your local club. Place your badge on our virtual pitch or sponsor a tournament.</p>
                              
                              <ul className="text-left text-sm text-slate-300 space-y-2 mb-6 bg-slate-800 p-4 rounded-xl">
                                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Logo placement in Football Sim</li>
                                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> "Sponsored by" messages in chat</li>
                                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Custom tournament naming rights</li>
                              </ul>
                              
                              <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl">
                                  Request Sponsorship Deck
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      <div className="max-w-6xl w-full space-y-12">
        <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8"
        >
            <div className="bg-slate-800 p-2 rounded-full group-hover:bg-slate-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-bold">Back to BabaBet</span>
        </button>

        <header className="text-center space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-tight">
                When the <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">Whistle Blows</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                The hidden cost of betting on the beautiful game. 
                <span className="block mt-2 text-slate-500 text-lg">From the Global Stage to Local Leagues</span>
            </p>
        </header>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

        <div className="text-center mb-4">
             <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full animate-pulse border border-slate-600">
                 TIP: Click a banner to play league trivia!
             </span>
        </div>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* World Cup Section */}
            <div 
                onClick={() => startTrivia('WORLDCUP')}
                className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 hover:border-blue-500 hover:bg-slate-900 transition-all group cursor-pointer active:scale-95"
            >
                <div className="bg-blue-500/10 w-12 h-12 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <Globe className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">The World Cup Illusion</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    The spectacle unites the globe, but betting platforms market it as a "gold rush". In football, giants fall, and 'sure things' destroy savings.
                </p>
                <div className="p-3 bg-slate-950/50 rounded-xl text-xs border-l-2 border-blue-500/50">
                    <p className="italic text-slate-500">"I lost my savings chasing a win in the group stages."</p>
                </div>
            </div>

            {/* African Champions League Section */}
            <div 
                onClick={() => startTrivia('CAF')}
                className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 hover:border-yellow-500 hover:bg-slate-900 transition-all group cursor-pointer active:scale-95"
            >
                <div className="bg-yellow-500/10 w-12 h-12 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">African Champions League</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    From Cairo to Pretoria, passion fuels the CAF CL. But when loyalty turns to gambling, the love for your local club is exploited for profit.
                </p>
                <div className="p-3 bg-slate-950/50 rounded-xl text-xs border-l-2 border-yellow-500/50">
                    <p className="italic text-slate-500">"I can't even watch a match without thinking about the odds."</p>
                </div>
            </div>

            {/* EPL Section */}
            <div 
                onClick={() => startTrivia('EPL')}
                className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 hover:border-indigo-500 hover:bg-slate-900 transition-all group cursor-pointer active:scale-95"
            >
                <div className="bg-indigo-500/10 w-12 h-12 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">English Premier League</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    The most marketed league in the world. The constant barrage of fixtures creates a "fear of missing out" (FOMO) that drives impulsive, 24/7 betting cycles.
                </p>
                <div className="p-3 bg-slate-950/50 rounded-xl text-xs border-l-2 border-indigo-500/50">
                    <p className="italic text-slate-500">"There is always another match to 'win it back' on."</p>
                </div>
            </div>

            {/* Turkish League */}
            <div 
                onClick={() => startTrivia('TURKISH')}
                className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 hover:border-red-500 hover:bg-slate-900 transition-all group cursor-pointer active:scale-95"
            >
                <div className="bg-red-500/10 w-12 h-12 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">Turkish Süper Lig</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Known for high volatility and intense atmosphere. Betting on emotion in a league defined by unpredictability is a recipe for financial disaster.
                </p>
                <div className="p-3 bg-slate-950/50 rounded-xl text-xs border-l-2 border-red-500/50">
                    <p className="italic text-slate-500">"Passion clouds judgment. The volatility is dangerous."</p>
                </div>
            </div>

            {/* Kenya Premier League */}
            <div 
                onClick={() => startTrivia('KPL')}
                className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 hover:border-green-500 hover:bg-slate-900 transition-all group cursor-pointer active:scale-95"
            >
                <div className="bg-green-500/10 w-12 h-12 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Kenya Premier League (KPL)</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    The "Local Trap". Betting shops in neighborhoods make it easy to gamble money needed for daily essentials on local derbies like Mashemeji.
                </p>
                <div className="p-3 bg-slate-950/50 rounded-xl text-xs border-l-2 border-green-500/50">
                    <p className="italic text-slate-500">"It felt harmless because it's our league. It wasn't."</p>
                </div>
            </div>

            {/* South African League */}
            <div 
                onClick={() => startTrivia('PSL')}
                className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 hover:border-orange-500 hover:bg-slate-900 transition-all group cursor-pointer active:scale-95"
            >
                <div className="bg-orange-500/10 w-12 h-12 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <Flag className="w-6 h-6 text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">South African PSL</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    "Diski" dreams. The flair and skill of the PSL attract millions, but the promise of quick wealth via betting often leads to a cycle of debt in the township economy.
                </p>
                <div className="p-3 bg-slate-950/50 rounded-xl text-xs border-l-2 border-orange-500/50">
                    <p className="italic text-slate-500">"Chasing the jackpot turned the beautiful game ugly."</p>
                </div>
            </div>
        </section>

        <section className="bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-900/30 rounded-3xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 opacity-10">
                <Goal className="w-96 h-96 text-red-500" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 text-red-400 font-bold uppercase tracking-wider mb-6">
                    <AlertTriangle className="w-6 h-6" />
                    <span>The Adverse Effects</span>
                </div>
                
                <h3 className="text-3xl font-black text-white mb-8">Don't Let the Game Play You</h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-black/20 backdrop-blur-sm p-5 rounded-xl border border-white/5">
                        <Wallet className="w-8 h-8 text-red-400 mb-4" />
                        <h4 className="font-bold text-white mb-2">Financial Ruin</h4>
                        <p className="text-sm text-slate-400">Betting money meant for rent, school fees, or food destroys stability.</p>
                    </div>
                    <div className="bg-black/20 backdrop-blur-sm p-5 rounded-xl border border-white/5">
                        <HeartCrack className="w-8 h-8 text-red-400 mb-4" />
                        <h4 className="font-bold text-white mb-2">Relationship Breakdown</h4>
                        <p className="text-sm text-slate-400">Secrecy and debt caused by gambling strain relationships with family and friends.</p>
                    </div>
                    <div className="bg-black/20 backdrop-blur-sm p-5 rounded-xl border border-white/5">
                        <Goal className="w-8 h-8 text-red-400 mb-4" />
                        <h4 className="font-bold text-white mb-2">Loss of Interest</h4>
                        <p className="text-sm text-slate-400">You stop enjoying the beauty of the sport. A goal is no longer joy; it's just a statistic.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* SUPPORT & PARTNERSHIPS SECTION */}
        <section className="border-t border-slate-800 pt-12">
            <div className="flex flex-col items-center text-center mb-10">
                <h2 className="text-3xl font-black text-white mb-4">Support & Partnerships</h2>
                <p className="text-slate-400 max-w-xl">
                    Bababet is an independent educational simulation. Help us keep the servers running or partner with us to reach our growing community.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Donate Card */}
                <div 
                    onClick={() => setSupportModal('DONATE')}
                    className="bg-slate-900 p-6 rounded-2xl border border-slate-700 hover:border-orange-500 hover:bg-slate-800 transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Heart className="w-6 h-6 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Donate</h3>
                    <p className="text-sm text-slate-400">Support the developers. Buy Baba a virtual coffee or a real bag of fertilizer.</p>
                </div>

                {/* Featured in Story Card */}
                <div 
                    onClick={() => setSupportModal('FEATURE')}
                    className="bg-slate-900 p-6 rounded-2xl border border-slate-700 hover:border-purple-500 hover:bg-slate-800 transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <PenTool className="w-6 h-6 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Be Featured</h3>
                    <p className="text-sm text-slate-400">Get your name in the game! Name a Cow, a Rival Farmer, or a Bot after you.</p>
                </div>

                {/* Sponsorship Card */}
                <div 
                    onClick={() => setSupportModal('SPONSOR')}
                    className="bg-slate-900 p-6 rounded-2xl border border-slate-700 hover:border-blue-500 hover:bg-slate-800 transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Club Sponsorship</h3>
                    <p className="text-sm text-slate-400">Promote your local club. Place your badge on our virtual pitch or sponsor a tournament.</p>
                </div>
            </div>
        </section>
        
        <footer className="text-center space-y-4 pt-8 border-t border-slate-800">
            <p className="text-slate-500">
                Gambling is not a way to make money. It is a form of entertainment with a high risk of losing.
            </p>
            <div className="inline-block bg-slate-900 text-slate-400 px-6 py-3 rounded-full text-sm font-mono border border-slate-700">
                Need help? Call your local problem gambling helpline.
            </div>
        </footer>
      </div>
    </div>
  );
};

export default ResponsibleGambling;
