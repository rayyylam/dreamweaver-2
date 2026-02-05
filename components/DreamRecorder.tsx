import React, { useState } from 'react';
import { DreamEntry } from '../types';
import { Plus, X, ArrowRight, Save, Sparkles, Moon, CloudRain, Key } from 'lucide-react';
import { generateDreamReflection } from '../services/geminiService';

interface DreamRecorderProps {
  onSave: (dream: DreamEntry) => void;
  onCancel: () => void;
}

const steps = [
  "准备",
  "捕捉碎片",
  "情感解码",
  "自由联想",
  "回响"
];

const DreamRecorder: React.FC<DreamRecorderProps> = ({ onSave, onCancel }) => {
  // Start at -1 for the "Intro/Breathing" step
  const [currentStep, setCurrentStep] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [keywords, setKeywords] = useState({
    scenes: [] as string[],
    characters: [] as string[],
    emotions: [] as string[],
    objects: [] as string[],
  });
  
  const [decoding, setDecoding] = useState({
    strongestEmotion: '',
    recentLifeLink: '',
    movieTheme: '',
  });

  const [association, setAssociation] = useState('');
  const [aiReflection, setAiReflection] = useState('');

  // Helpers for keywords
  const [inputs, setInputs] = useState({ scenes: '', characters: '', emotions: '', objects: '' });

  const addKeyword = (category: keyof typeof keywords, value: string) => {
    if (!value.trim()) return;
    setKeywords(prev => ({ ...prev, [category]: [...prev[category], value.trim()] }));
    setInputs(prev => ({ ...prev, [category]: '' }));
  };

  const removeKeyword = (category: keyof typeof keywords, index: number) => {
    setKeywords(prev => ({ ...prev, [category]: prev[category].filter((_, i) => i !== index) }));
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      setIsGenerating(true);
      setCurrentStep(3); 
      try {
        const reflection = await generateDreamReflection({
          keywords,
          decoding,
          association
        });
        setAiReflection(reflection);
      } catch (e) {
        console.error(e);
      } finally {
        setIsGenerating(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleFinalSave = () => {
    const newDream: DreamEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      keywords,
      decoding,
      association,
      aiReflection
    };
    onSave(newDream);
  };

  // Step -1: Intro / Breathing
  if (currentStep === -1) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/90 backdrop-blur-xl text-white animate-fade-in">
         <div className="max-w-md text-center p-8 space-y-8 relative">
             {/* Decorative glow behind intro */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/20 blur-[60px] rounded-full pointer-events-none"></div>
            
            <Moon size={64} className="mx-auto text-lotus-300 animate-pulse-glow relative z-10" />
            <div className="space-y-4 font-serif relative z-10">
              <h2 className="text-3xl tracking-wide text-starlight-50">欢迎回来</h2>
              <p className="text-teal-100/80 leading-relaxed text-lg">
                深呼吸…… <br/>
                让身体沉入这片静谧的水域。<br/>
                试着不要用力去回忆，<br/>
                只是让那些残存的碎片自然浮现。
              </p>
            </div>
            <button 
              onClick={() => setCurrentStep(0)}
              className="mt-8 bg-teal-600 hover:bg-lotus-500 text-white px-8 py-3 rounded-full font-semibold transition-all hover:scale-105 shadow-[0_0_20px_rgba(45,212,191,0.4)] relative z-10"
            >
              开始记录
            </button>
            <button onClick={onCancel} className="block mx-auto mt-4 text-sm text-teal-400 hover:text-white relative z-10">
              返回
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto min-h-[85vh] flex flex-col relative">
      
      {/* Top Navigation */}
      <div className="flex justify-between items-center py-6 px-4">
        <div className="flex space-x-2">
           {steps.map((label, idx) => (
             <div key={idx} className={`h-1.5 rounded-full transition-all duration-700 ${idx <= currentStep ? 'w-8 bg-lotus-400 shadow-[0_0_10px_#f472b6]' : 'w-2 bg-teal-900'}`} />
           ))}
        </div>
        <button onClick={onCancel} className="text-teal-400 hover:text-white p-2 rounded-full transition">
          <X size={24} />
        </button>
      </div>

      {/* Main Content Card */}
      <div className="flex-1 glass-panel-dark rounded-3xl overflow-hidden flex flex-col relative animate-fade-in">
        
        <div className="flex-1 p-6 md:p-12 overflow-y-auto">
          
          {/* STEP 0: KEYWORDS */}
          {currentStep === 0 && (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="text-center space-y-2 mb-8 animate-sway-slow">
                <CloudRain size={40} className="mx-auto text-teal-400 mb-4" />
                <h2 className="text-3xl font-serif text-starlight-50">捕捉梦的碎片</h2>
                <p className="text-teal-200/60">
                   不需要连贯的故事，只需要零星的词语。
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'scenes', label: '场景', placeholder: '比如：老房子、海边...' },
                  { key: 'characters', label: '人物', placeholder: '比如：奶奶、陌生人...' },
                  { key: 'emotions', label: '情绪', placeholder: '比如：焦虑、平静...' },
                  { key: 'objects', label: '特别物件', placeholder: '比如：红色的钥匙、钟表...' }
                ].map((field) => (
                  <div key={field.key} className="bg-forest-900/40 p-4 rounded-2xl border border-teal-500/20 focus-within:border-lotus-400/50 transition-all hover:bg-forest-900/60">
                    <label className="block text-sm font-bold text-teal-300 mb-2 font-serif tracking-wide">
                      {field.label}
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3 min-h-[30px]">
                      {keywords[field.key as keyof typeof keywords].map((k, i) => (
                        <span key={i} className="bg-teal-600/20 text-teal-100 px-3 py-1 rounded-full text-sm flex items-center gap-1 animate-fade-in border border-teal-500/30">
                          {k}
                          <button onClick={() => removeKeyword(field.key as keyof typeof keywords, i)} className="text-teal-400 hover:text-lotus-300 ml-1"><X size={12}/></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 relative">
                      <input 
                        type="text" 
                        value={inputs[field.key as keyof typeof inputs]}
                        onChange={(e) => setInputs(prev => ({...prev, [field.key]: e.target.value}))}
                        onKeyDown={(e) => e.key === 'Enter' && addKeyword(field.key as keyof typeof keywords, inputs[field.key as keyof typeof inputs])}
                        className="flex-1 bg-transparent border-b border-teal-500/30 focus:border-lotus-400 outline-none text-starlight-50 py-1 placeholder:text-teal-500/50 transition-colors"
                        placeholder={field.placeholder}
                      />
                      <button 
                        onClick={() => addKeyword(field.key as keyof typeof keywords, inputs[field.key as keyof typeof inputs])}
                        className="text-lotus-400 hover:text-lotus-300 absolute right-0 bottom-1"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: DECODING */}
          {currentStep === 1 && (
            <div className="space-y-10 max-w-2xl mx-auto animate-fade-in">
               <div className="text-center space-y-2 mb-8">
                <Key size={40} className="mx-auto text-teal-400 mb-4" />
                <h2 className="text-3xl font-serif text-starlight-50">情感解码</h2>
                <p className="text-teal-200/60">
                   向内看，问自己三个问题。
                </p>
              </div>

              <div className="space-y-8">
                <div className="group">
                  <label className="block text-lg text-teal-200 font-serif mb-3 group-hover:text-lotus-300 transition-colors">
                    1. 梦里面最强烈的情绪是什么？
                  </label>
                  <input
                    value={decoding.strongestEmotion}
                    onChange={(e) => setDecoding(prev => ({ ...prev, strongestEmotion: e.target.value }))}
                    className="w-full p-4 glass-input rounded-xl outline-none text-starlight-50 transition-all placeholder:text-teal-500/50"
                    placeholder="那种感觉是..."
                  />
                </div>

                <div className="group">
                  <label className="block text-lg text-teal-200 font-serif mb-3 group-hover:text-lotus-300 transition-colors">
                    2. 最近生活里面什么时候有过一些相似的情绪？
                  </label>
                  <textarea
                    value={decoding.recentLifeLink}
                    onChange={(e) => setDecoding(prev => ({ ...prev, recentLifeLink: e.target.value }))}
                    className="w-full p-4 glass-input rounded-xl outline-none text-starlight-50 h-24 resize-none transition-all placeholder:text-teal-500/50"
                    placeholder="也许是在..."
                  />
                </div>

                <div className="group">
                  <label className="block text-lg text-teal-200 font-serif mb-3 group-hover:text-lotus-300 transition-colors">
                    3. 如果这个梦是一部电影，它的主题是什么？
                  </label>
                  <input
                    value={decoding.movieTheme}
                    onChange={(e) => setDecoding(prev => ({ ...prev, movieTheme: e.target.value }))}
                    className="w-full p-4 glass-input rounded-xl outline-none text-starlight-50 transition-all placeholder:text-teal-500/50"
                    placeholder="关于失去、关于寻找..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ASSOCIATION */}
          {currentStep === 2 && (
            <div className="space-y-8 h-full flex flex-col max-w-2xl mx-auto animate-fade-in">
              <div className="text-center">
                 <h2 className="text-3xl font-serif text-starlight-50 mb-2">自由联想</h2>
                 <p className="text-teal-200/60">
                   选一个梦中最鲜明的画面。闭上眼感受它。它让你想到了什么？<br/>
                   <span className="text-sm opacity-70">不需要逻辑，只让思绪流动。</span>
                 </p>
              </div>

              <div className="flex-1 bg-forest-900/30 p-6 rounded-2xl border border-teal-500/20 relative group focus-within:bg-forest-900/50 transition-all duration-500">
                <Sparkles size={24} className="absolute top-4 right-4 text-lotus-400 opacity-50 group-focus-within:opacity-100 transition-opacity animate-pulse" />
                <textarea
                  value={association}
                  onChange={(e) => setAssociation(e.target.value)}
                  className="w-full h-full bg-transparent text-starlight-100 text-lg font-serif leading-relaxed outline-none resize-none placeholder:text-teal-500/40 placeholder:italic"
                  placeholder="我看到了……它让我想起了小时候……那种感觉像是……"
                />
              </div>
            </div>
          )}

          {/* STEP 3: REFLECTION (AI) */}
          {currentStep === 3 && (
            <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto animate-fade-in">
              
              {isGenerating ? (
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-teal-500/20 border-t-lotus-400 rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles size={20} className="text-lotus-400 animate-pulse" />
                    </div>
                  </div>
                  <p className="font-serif text-xl text-starlight-50 animate-pulse">
                    正在连接梦境的彼岸...
                  </p>
                  <p className="text-sm text-teal-300">倾听潜意识的声音</p>
                </div>
              ) : (
                <div className="w-full space-y-8">
                  <h3 className="text-3xl font-serif text-starlight-50 text-center drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">来自梦境的回响</h3>
                  <div className="bg-forest-800/40 p-8 rounded-2xl shadow-xl border border-teal-500/20 leading-loose text-starlight-100 font-serif whitespace-pre-line text-lg relative backdrop-blur-md">
                    <span className="absolute -top-3 -left-3 text-6xl text-teal-500/20 font-serif">“</span>
                    {aiReflection}
                    <span className="absolute -bottom-6 -right-3 text-6xl text-teal-500/20 font-serif leading-none">”</span>
                  </div>
                  <div className="text-center text-teal-400/60 text-sm font-serif italic">
                    <p>梦是未拆封的信。现在，你已经读到了它的一部分。</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 md:px-12 bg-forest-950/40 border-t border-teal-500/10 flex justify-between items-center backdrop-blur-md">
          {currentStep > 0 && currentStep < 3 && (
            <button 
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="text-teal-400 hover:text-white font-serif font-semibold px-4 py-2 hover:bg-forest-800/50 rounded-lg transition"
            >
              上一步
            </button>
          )}
          
          <div className="flex-1"></div>
          
          {currentStep < 3 ? (
            <button 
              onClick={handleNext}
              className="group bg-lotus-500 hover:bg-lotus-600 text-white px-8 py-3 rounded-full flex items-center gap-3 transition shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)]"
            >
              <span className="font-serif tracking-widest">{currentStep === 2 ? '完成并解读' : '下一步'}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            !isGenerating && (
              <button 
                onClick={handleFinalSave}
                className="bg-teal-500 hover:bg-teal-400 text-forest-950 px-10 py-3 rounded-full flex items-center gap-2 transition shadow-[0_0_20px_rgba(45,212,191,0.4)] font-serif font-bold tracking-wide"
              >
                <Save size={18} /> 珍藏这个梦
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DreamRecorder;