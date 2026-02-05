import React, { useEffect, useState } from 'react';
import { DreamEntry, ChartDataPoint } from '../types';
import { analyzePatterns } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';

interface DreamInsightsProps {
  dreams: DreamEntry[];
}

// Enchanted Garden Palette for Charts
const COLORS = ['#2dd4bf', '#ec4899', '#f472b6', '#5eead4', '#fbcfe8'];

const DreamInsights: React.FC<DreamInsightsProps> = ({ dreams }) => {
  const [patternAnalysis, setPatternAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dreams.length > 0 && !patternAnalysis) {
      handleAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dreams.length]);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzePatterns(dreams);
      setPatternAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const emotionCounts: Record<string, number> = {};
  dreams.forEach(d => {
    const emotion = d.decoding.strongestEmotion.toLowerCase().trim();
    if (emotion) {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    }
  });

  const chartData: ChartDataPoint[] = Object.entries(emotionCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); 

  if (dreams.length < 2) {
      return (
          <div className="p-12 text-center text-teal-200/60 glass-panel-dark rounded-3xl mx-auto max-w-lg mt-10">
              <Sparkles className="mx-auto mb-4 text-lotus-400" size={32} />
              <h3 className="text-xl font-serif mb-2 text-starlight-50">积攒智慧</h3>
              <p>请多记录几个梦，我们将为您揭示其中的模式。</p>
          </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fade-in">
      
      {/* Pattern Analysis Card */}
      <div className="bg-gradient-to-r from-forest-800 to-teal-900/40 p-8 rounded-3xl border border-teal-500/20 shadow-lg relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
             <Sparkles size={100} className="text-white" />
        </div>
        <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-serif text-starlight-50 flex items-center gap-2">
                <Sparkles size={20} className="text-lotus-400" /> 
                梦境模式
            </h3>
            <button onClick={handleAnalyze} disabled={loading} className="text-teal-400 hover:text-white transition">
                {loading ? <Loader2 className="animate-spin"/> : <RefreshCw size={20} />}
            </button>
        </div>
        
        {loading ? (
            <div className="h-24 flex items-center justify-center text-teal-300 font-serif">
                <p className="animate-pulse">正在向潜意识提问...</p>
            </div>
        ) : (
            <p className="text-starlight-100 font-serif leading-loose whitespace-pre-line text-lg">
                {patternAnalysis}
            </p>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="glass-panel-dark p-6 rounded-3xl shadow-sm border border-teal-500/10">
            <h4 className="text-lg font-bold text-teal-100 mb-6 text-center font-serif">情绪光谱</h4>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({name}) => name}
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#0a2625', 
                                borderRadius: '12px', 
                                border: '1px solid #134e4a', 
                                color: '#f0fdfa',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)', 
                                fontFamily: '"Noto Serif SC", serif' 
                            }} 
                            formatter={(value: number) => [`${value} 次`, '出现次数']}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <p className="text-center text-sm text-teal-400/60 mt-4 font-serif">
                最近梦中反复出现的情绪
            </p>
        </div>
      </div>
    </div>
  );
};

export default DreamInsights;