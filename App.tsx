import React, { useState, useEffect } from 'react';
import { DreamEntry, ViewState } from './types';
import DreamRecorder from './components/DreamRecorder';
import DreamList from './components/DreamList';
import DreamInsights from './components/DreamInsights';
import { Moon, Plus, BarChart2, BookHeart, ArrowLeft, Sparkles, Wind } from 'lucide-react';

// Ambient Background Component
const EnchantedBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* Glowing Orbs / Moons */}
    <div className="absolute top-10 right-[10%] w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] animate-pulse-glow"></div>
    <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-forest-700/20 rounded-full blur-[100px] animate-float"></div>
    
    {/* Water Ripples Simulation */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-teal-500/5 rounded-full animate-ripple"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-lotus-400/5 rounded-full animate-ripple" style={{ animationDelay: '2s' }}></div>
    
    {/* Fireflies */}
    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-lotus-200 rounded-full shadow-[0_0_10px_#fbcfe8] animate-float" style={{ animationDuration: '10s' }}></div>
    <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-teal-200 rounded-full shadow-[0_0_10px_#99f6e4] animate-float-delayed" style={{ animationDuration: '15s' }}></div>
    <div className="absolute bottom-10 left-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white] animate-float" style={{ animationDuration: '12s', animationDelay: '1s' }}></div>
  </div>
);

const App: React.FC = () => {
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('dreamweaver_entries');
    if (saved) {
      try {
        setDreams(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse dreams", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('dreamweaver_entries', JSON.stringify(dreams));
  }, [dreams]);

  const handleSaveDream = (dream: DreamEntry) => {
    setDreams(prev => [dream, ...prev]);
    setView(ViewState.HOME);
  };

  const handleSelectDream = (dream: DreamEntry) => {
    setSelectedDream(dream);
    setView(ViewState.DETAILS);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-lotus-500/30 selection:text-white pb-12 relative">
      
      <EnchantedBackground />

      {/* Navbar */}
      <nav className={`sticky top-0 z-40 transition-all duration-500 ${view === ViewState.HOME ? 'bg-forest-950/50' : 'bg-transparent'} backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-teal-500/10`}>
        <div className="flex items-center gap-3 text-starlight-100 cursor-pointer group" onClick={() => setView(ViewState.HOME)}>
          <div className="relative animate-sway-slow">
            <Moon className="fill-starlight-100 text-starlight-100 group-hover:text-lotus-300 transition-colors duration-500" size={24} />
            <Sparkles className="absolute -top-2 -right-2 text-lotus-300 animate-pulse" size={12} fill="currentColor" />
          </div>
          <h1 className="text-xl font-serif font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-starlight-100 to-teal-200">织梦者</h1>
        </div>
        
        {view === ViewState.HOME && (
          <div className="flex gap-4">
             <button 
              onClick={() => setView(ViewState.INSIGHTS)}
              className="text-teal-200 hover:text-lotus-300 transition p-2 hover:bg-forest-800/50 rounded-full"
              title="梦境模式"
            >
              <BarChart2 size={24} />
            </button>
          </div>
        )}
         {view === ViewState.INSIGHTS && (
             <button onClick={() => setView(ViewState.HOME)} className="text-teal-200 hover:text-lotus-300 font-serif font-semibold text-sm flex items-center gap-1">
                 <ArrowLeft size={16} /> 返回
             </button>
         )}
      </nav>

      <main className="container mx-auto px-4 py-4 md:py-8 relative z-10">
        
        {/* VIEW: HOME (List) */}
        {view === ViewState.HOME && (
          <div className="space-y-8 animate-fade-in">
            <header className="text-center space-y-4 mb-12 mt-8">
              <div className="inline-block animate-sway-slow">
                 <h2 className="text-3xl md:text-5xl font-serif text-starlight-50 tracking-tight drop-shadow-[0_0_15px_rgba(94,234,212,0.3)]">
                  早安，梦旅人。
                </h2>
              </div>
              <p className="text-teal-200/80 max-w-md mx-auto font-serif text-lg italic opacity-80">
                "在这片静谧的森林里，倾听灵魂的低语。"
              </p>
            </header>

            <DreamList dreams={dreams} onSelectDream={handleSelectDream} />
            
            {/* Floating Action Button */}
            <button 
              onClick={() => setView(ViewState.RECORD)}
              className="fixed bottom-8 right-8 bg-teal-600 hover:bg-lotus-500 text-white p-5 rounded-full shadow-[0_0_30px_rgba(45,212,191,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] hover:scale-110 transition-all duration-500 group z-40 animate-float"
              aria-label="记录新梦境"
            >
              <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="absolute right-full mr-4 bg-forest-900/80 backdrop-blur-md text-teal-100 text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap top-1/2 -translate-y-1/2 font-serif tracking-widest border border-teal-500/30">
                记录新梦境
              </span>
            </button>
          </div>
        )}

        {/* VIEW: RECORD */}
        {view === ViewState.RECORD && (
          <DreamRecorder 
            onSave={handleSaveDream} 
            onCancel={() => setView(ViewState.HOME)} 
          />
        )}

        {/* VIEW: INSIGHTS */}
        {view === ViewState.INSIGHTS && (
            <div className="animate-fade-in">
                 <header className="mb-8 text-center">
                    <h2 className="text-3xl font-serif text-starlight-50 mb-2 drop-shadow-md">内心世界</h2>
                    <p className="text-teal-200/70 font-serif">探索潜意识中反复出现的旋律</p>
                </header>
                <DreamInsights dreams={dreams} />
            </div>
        )}

        {/* VIEW: DETAILS */}
        {view === ViewState.DETAILS && selectedDream && (
          <div className="max-w-3xl mx-auto glass-panel-dark rounded-3xl overflow-hidden animate-fade-in pb-8">
            <div className="bg-gradient-to-b from-teal-900/40 to-forest-950/40 p-8 md:p-12 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 text-teal-500 opacity-10 animate-pulse-slow">
                  <Moon size={200} />
               </div>
               <button onClick={() => setView(ViewState.HOME)} className="mb-8 text-teal-300 hover:text-white flex items-center gap-2 transition font-serif group">
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> 返回列表
               </button>
               <div className="relative z-10 animate-sway-slow origin-left">
                 <div className="flex items-center gap-3 text-lotus-300 mb-4 text-sm font-serif tracking-widest uppercase opacity-90">
                   <Sparkles size={14}/>
                   {new Date(selectedDream.timestamp).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                 </div>
                 <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight text-white drop-shadow-lg">"{selectedDream.decoding.movieTheme}"</h2>
               </div>
            </div>

            <div className="p-8 md:p-12 space-y-10">
              
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-4 font-serif flex items-center gap-2">
                    <Wind size={14} /> 碎片与象征
                </h3>
                <div className="flex flex-wrap gap-3">
                   {selectedDream.keywords.scenes.map(k => <span key={k} className="bg-forest-800/50 border border-teal-500/20 px-4 py-1.5 rounded-full text-starlight-100 text-sm font-serif hover:bg-teal-900/50 transition">场景: {k}</span>)}
                   {selectedDream.keywords.characters.map(k => <span key={k} className="bg-forest-800/50 border border-teal-500/20 px-4 py-1.5 rounded-full text-starlight-100 text-sm font-serif hover:bg-teal-900/50 transition">人物: {k}</span>)}
                   {selectedDream.keywords.objects.map(k => <span key={k} className="bg-lotus-500/10 border border-lotus-400/30 px-4 py-1.5 rounded-full text-lotus-200 text-sm font-serif hover:bg-lotus-500/20 transition">物件: {k}</span>)}
                   {selectedDream.keywords.emotions.map(k => <span key={k} className="bg-teal-500/10 border border-teal-400/30 px-4 py-1.5 rounded-full text-teal-200 text-sm font-serif hover:bg-teal-500/20 transition">情绪: {k}</span>)}
                </div>
              </section>

              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                <section className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2 font-serif">情感解码</h3>
                    <div className="space-y-6">
                        <div>
                            <span className="block text-sm text-lotus-300 font-serif mb-1 opacity-80">最强烈的情绪</span>
                            <p className="text-starlight-50 text-lg border-l-2 border-lotus-400/50 pl-4">{selectedDream.decoding.strongestEmotion}</p>
                        </div>
                        <div>
                            <span className="block text-sm text-lotus-300 font-serif mb-1 opacity-80">现实生活的回响</span>
                            <p className="text-starlight-50 text-lg border-l-2 border-lotus-400/50 pl-4">{selectedDream.decoding.recentLifeLink}</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-4 font-serif">自由联想</h3>
                    <div className="bg-forest-900/30 border border-teal-500/10 p-6 rounded-2xl italic text-teal-100 font-serif leading-loose relative backdrop-blur-sm">
                        <span className="absolute top-2 left-3 text-4xl text-teal-500/20 font-serif">“</span>
                        {selectedDream.association}
                    </div>
                </section>
              </div>

              {selectedDream.aiReflection && (
                <section className="bg-gradient-to-br from-forest-800/40 to-teal-900/20 border border-teal-500/20 p-8 rounded-3xl relative shadow-lg mt-8 backdrop-blur-md">
                  <BookHeart className="absolute top-8 right-8 text-lotus-400 opacity-50" size={32} />
                  <h3 className="text-xl font-serif text-starlight-50 mb-6 font-semibold flex items-center gap-2">
                    <Sparkles size={20} className="text-lotus-400 animate-pulse"/> 解读与回响
                  </h3>
                  <p className="text-starlight-100/90 font-serif leading-loose whitespace-pre-line text-lg">
                    {selectedDream.aiReflection}
                  </p>
                </section>
              )}
              
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;