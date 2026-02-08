import React from 'react';
import { DreamEntry } from '../types';
import { BookOpen, Calendar, Film, Moon, Sparkles, Trash2 } from 'lucide-react';

interface DreamListProps {
  dreams: DreamEntry[];
  onSelectDream: (dream: DreamEntry) => void;
  onDeleteDream: (dreamId: string) => void;
}

const DreamList: React.FC<DreamListProps> = ({ dreams, onSelectDream, onDeleteDream }) => {
  if (dreams.length === 0) {
    return (
      <div className="text-center py-20 opacity-70 flex flex-col items-center animate-fade-in">
        <div className="bg-forest-800/50 border border-teal-500/20 p-6 rounded-full mb-6 shadow-[0_0_20px_rgba(45,212,191,0.1)]">
          <Moon size={48} className="text-teal-400" />
        </div>
        <p className="text-2xl font-serif text-starlight-50 mb-2">梦境博物馆还是空的</p>
        <p className="text-teal-200/60 font-serif">今晚睡个好觉，期待明早的碎片。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 animate-fade-in">
      {dreams.map((dream, idx) => (
        <div
          key={dream.id}
          onClick={() => onSelectDream(dream)}
          style={{ animationDelay: `${idx * 150}ms` }}
          className="group glass-panel-dark p-6 rounded-2xl hover:shadow-[0_10px_40px_-10px_rgba(45,212,191,0.3)] hover:-translate-y-1 hover:border-teal-400/30 transition-all duration-500 cursor-pointer flex flex-col h-full animate-fade-in relative overflow-hidden"
        >
          {/* Decorative element: Magical Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-lotus-400/20 blur-3xl rounded-full pointer-events-none group-hover:bg-lotus-400/30 transition duration-700"></div>

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center text-teal-300 text-sm font-semibold tracking-wider">
              <Calendar size={14} className="mr-1" />
              {new Date(dream.timestamp).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}
            </div>
            {dream.decoding.strongestEmotion && (
              <div className="bg-forest-900/50 text-lotus-200 text-xs px-3 py-1 rounded-full border border-lotus-500/30 shadow-sm">
                {dream.decoding.strongestEmotion}
              </div>
            )}
          </div>

          <h3 className="text-xl font-serif text-starlight-50 mb-3 flex items-center gap-2 relative z-10 group-hover:text-teal-200 transition-colors">
            <Film size={18} className="text-teal-500 group-hover:text-lotus-400 transition-colors" />
            "{dream.decoding.movieTheme || '无题'}"
          </h3>

          <div className="flex flex-wrap gap-2 mb-4 relative z-10">
            {dream.keywords.objects.slice(0, 3).map((obj, i) => (
              <span key={i} className="text-xs bg-teal-500/10 text-teal-100 px-2 py-1 rounded border border-teal-500/20">
                {obj}
              </span>
            ))}
            {dream.keywords.objects.length > 3 && (
              <span className="text-xs text-teal-500/50 px-2 py-1">+{dream.keywords.objects.length - 3}</span>
            )}
          </div>

          <p className="text-teal-100/70 text-sm line-clamp-3 font-serif leading-relaxed mb-4 flex-1">
            {dream.association}
          </p>

          <div className="mt-auto pt-4 border-t border-dashed border-teal-500/20 flex justify-between items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteDream(dream.id);
              }}
              className="text-teal-500/50 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/10"
              title="删除梦境"
            >
              <Trash2 size={16} />
            </button>
            <span className="text-lotus-300 text-sm font-semibold group-hover:translate-x-1 transition-transform flex items-center font-serif group-hover:text-lotus-200">
              查看解读 <span className="ml-1 text-lg">→</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DreamList;