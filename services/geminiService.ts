import { DreamEntry } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * AI 服务 - 通过 Supabase Edge Function 调用 Gemini
 * API Key 安全存储在服务端，不会暴露给前端
 */
export const generateDreamReflection = async (
  dream: Omit<DreamEntry, 'id' | 'timestamp' | 'aiReflection'>
): Promise<string> => {
  try {
    console.log('Calling Edge Function with dream:', dream);

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/dream-ai?action=reflect`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ dream }),
      }
    );

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge Function Error:', response.status, errorText);
      return '抱歉，我现在无法进行解读。请先保存下这个梦，稍后静下心来，或许你自己会有新的发现。';
    }

    const data = await response.json();
    console.log('Response data:', data);

    return data?.reflection || '此刻由于信号波动，我无法连接到梦境的彼岸。但请相信，你的每一个感受都被宇宙温柔地接纳了。';
  } catch (error) {
    console.error('AI Reflection Error:', error);
    return '抱歉，我现在无法进行解读。请先保存下这个梦，稍后静下心来，或许你自己会有新的发现。';
  }
};

export const analyzePatterns = async (dreams: DreamEntry[]): Promise<string> => {
  if (dreams.length === 0) return '还没有足够的梦境来分析模式。';

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/dream-ai?action=analyze`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ dreams }),
      }
    );

    if (!response.ok) {
      console.error('Edge Function Error:', response.status);
      return '暂时无法分析梦境模式。';
    }

    const data = await response.json();
    return data?.analysis || '暂未发现明显的模式。';
  } catch (error) {
    console.error('Pattern Analysis Error:', error);
    return '暂时无法分析梦境模式。';
  }
};

