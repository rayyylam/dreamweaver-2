import { GoogleGenAI } from "@google/genai";
import { DreamEntry } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDreamReflection = async (dream: Omit<DreamEntry, 'id' | 'timestamp' | 'aiReflection'>): Promise<string> => {
  const ai = getClient();
  
  const prompt = `
    你是一位温柔、充满智慧且富有同理心的心理咨询师和梦境向导。你的目标是帮助用户通过记录下来的梦境碎片，更深入地了解自己潜意识中的情绪和渴望。
    
    以下是用户的梦境记录：
    
    1. **梦的碎片 (关键词)**: 
       - 场景: ${dream.keywords.scenes.join(', ')}
       - 人物: ${dream.keywords.characters.join(', ')}
       - 情绪: ${dream.keywords.emotions.join(', ')}
       - 特别物件: ${dream.keywords.objects.join(', ')}
       
    2. **情感解码**:
       - 梦中最强烈的情绪: ${dream.decoding.strongestEmotion}
       - 最近现实生活中的相似情绪: ${dream.decoding.recentLifeLink}
       - 如果这个梦是一部电影，主题是: ${dream.decoding.movieTheme}
       
    3. **自由联想**:
       "${dream.association}"

    **你的任务**:
    请用**中文**为用户提供一段温暖、不带评判的反馈（约 200 字左右）。
    - **共情**: 首先肯定并接纳他们在梦中感受到的情绪。
    - **连接**: 尝试将他们记录的“特别物件”或“场景”与他们提到的“自由联想”或“现实生活”建立温柔的连接。
    - **启发**: 提供一个柔和的视角，帮助他们理解这个梦可能在试图告诉他们什么（关于被压抑的情绪、渴望或成长的机会）。
    - **结语**: 用一句温暖、给人安全感和力量的话作为结束。
    
    语气要求：像一个深夜围炉夜话的老朋友，声音轻柔，充满安全感，治愈系。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, 
      }
    });

    return response.text || "此刻由于信号波动，我无法连接到梦境的彼岸。但请相信，你的每一个感受都被宇宙温柔地接纳了。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "抱歉，我现在无法进行解读。请先保存下这个梦，稍后静下心来，或许你自己会有新的发现。";
  }
};

export const analyzePatterns = async (dreams: DreamEntry[]): Promise<string> => {
    if (dreams.length === 0) return "还没有足够的梦境来分析模式。";

    const ai = getClient();
    const dreamSummaries = dreams.map(d => 
        `- 日期: ${new Date(d.timestamp).toLocaleDateString()}
         - 电影主题: ${d.decoding.movieTheme}
         - 核心情绪: ${d.decoding.strongestEmotion}
         - 关键象征: ${d.keywords.objects.join(', ')}`
    ).join('\n');

    const prompt = `
        你是一位潜意识分析师。请查看以下最近的梦境记录：
        
        ${dreamSummaries}

        请用中文识别其中重复出现的主题、持续存在的情绪或反复出现的象征。
        这些模式是否暗示了某种未解决的冲突、渴望或正在发生的个人成长？
        请保持温暖、建设性的语气。简要总结（不超过 3 句话）。
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "暂未发现明显的模式。";
    } catch (e) {
        return "暂时无法分析梦境模式。";
    }
}
