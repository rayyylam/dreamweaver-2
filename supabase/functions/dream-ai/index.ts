import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('Gemini API Error: ' + response.status);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function getSafe(obj: any, path: string[], fallback: string): string {
  let current = obj;
  for (const key of path) {
    if (current == null || typeof current !== 'object') return fallback;
    current = current[key];
  }
  if (current == null) return fallback;
  if (Array.isArray(current)) {
    return current.length > 0 ? current.join(', ') : fallback;
  }
  return String(current) || fallback;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    console.log('Action:', action);

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const bodyText = await req.text();
    console.log('Body length:', bodyText.length);
    const body = JSON.parse(bodyText);
    console.log('Body parsed, keys:', Object.keys(body));

    if (action === 'reflect') {
      const dream = body.dream;
      if (!dream) {
        return new Response(JSON.stringify({ error: 'Missing dream data' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const NL = String.fromCharCode(10);
      const parts: string[] = [];
      parts.push('# Role');
      parts.push('你是一位深谙荣格心理学（Jungian Psychology）的潜意识分析师。你不仅仅是在解读梦，更是在帮助用户通过梦境这面镜子，看见那些被忽略的自己。');
      parts.push('');
      parts.push('# Core Philosophy');
      parts.push('1. 情绪是内核: 梦境不直接复制现实，而是捕捉情感内核。请务必剥离剧情，直击情绪。');
      parts.push('2. 人物即自我: 梦里的人物都是用户心理结构的投射。请分析代表了用户性格中的哪个侧面。');
      parts.push('3. 物件即符号: 物件的含义取决于用户的自由联想。禁止套用通用词典。');
      parts.push('');
      parts.push('# Input Data');
      parts.push('用户的梦境记录：');
      parts.push('1. 梦的碎片');
      parts.push('   - 场景: ' + getSafe(dream, ['keywords', 'scenes'], '未提供'));
      parts.push('   - 人物: ' + getSafe(dream, ['keywords', 'characters'], '未提供'));
      parts.push('   - 情绪: ' + getSafe(dream, ['keywords', 'emotions'], '未提供'));
      parts.push('   - 特别物件: ' + getSafe(dream, ['keywords', 'objects'], '未提供'));
      parts.push('2. 情感解码');
      parts.push('   - 核心情绪: ' + getSafe(dream, ['decoding', 'strongestEmotion'], '未提供'));
      parts.push('   - 现实映射: ' + getSafe(dream, ['decoding', 'recentLifeLink'], '未提供'));
      parts.push('   - 电影主题: ' + getSafe(dream, ['decoding', 'movieTheme'], '未提供'));
      parts.push('3. 自由联想: ' + getSafe(dream, ['association'], '未提供'));
      parts.push('');
      parts.push('# Analysis Task');
      parts.push('请输出一段温暖、治愈且直击人心的分析（约 300 字）：');
      parts.push('1. 识别自我的侧面 - 指出梦里的人物其实是用户内心的哪个部分');
      parts.push('2. 解码情绪的真相 - 指出梦境场景背后隐藏的真实焦虑或渴望');
      parts.push('3. 整合与疗愈 - 告诉用户这个梦是潜意识送来的什么礼物');
      parts.push('');
      parts.push('# Output Tone');
      parts.push('像一位深夜长谈的智者，温柔、包容、不评判。');
      parts.push('');
      parts.push('# Output Structure');
      parts.push('请直接输出分析内容，包含以下三个段落：');
      parts.push('**🔍 镜中的自我 (The Projection)**');
      parts.push('**🗝️ 潜意识的密语 (The Symbol)**');
      parts.push('**💡 觉察与整合 (Integration)**');

      const prompt = parts.join(NL);
      const text = await callGemini(apiKey, prompt);

      return new Response(JSON.stringify({ reflection: text || '此刻由于信号波动，我无法连接到梦境的彼岸。' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'analyze') {
      console.log('=== ANALYZE START ===');
      const dreams = body.dreams;
      console.log('dreams type:', typeof dreams);
      console.log('dreams isArray:', Array.isArray(dreams));
      console.log('dreams length:', dreams ? dreams.length : 'null');

      if (!dreams || !Array.isArray(dreams) || dreams.length === 0) {
        console.log('No dreams to analyze, returning early');
        return new Response(JSON.stringify({ analysis: '还没有足够的梦境来分析模式。' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Building summaries for', dreams.length, 'dreams');
      var NL = String.fromCharCode(10);
      var summaryParts: string[] = [];
      for (var i = 0; i < dreams.length; i++) {
        try {
          console.log('Processing dream', i);
          var d = dreams[i];
          var dateStr = '未知日期';
          try {
            var dd = new Date(d.timestamp);
            if (!isNaN(dd.getTime())) dateStr = dd.toISOString().slice(0, 10);
          } catch (e2) {
            console.log('Date parse error for dream', i);
          }
          var theme = getSafe(d, ['decoding', 'movieTheme'], '未知');
          var emotion = getSafe(d, ['decoding', 'strongestEmotion'], '未知');
          var symbols = getSafe(d, ['keywords', 'objects'], '未知');
          summaryParts.push('- 日期: ' + dateStr + ', 电影主题: ' + theme + ', 核心情绪: ' + emotion + ', 关键象征: ' + symbols);
          console.log('Dream', i, 'processed OK');
        } catch (loopErr) {
          console.error('Error processing dream', i, ':', String(loopErr));
        }
      }

      console.log('Summaries built:', summaryParts.length);
      var dreamText = summaryParts.join(NL);
      console.log('Dream text length:', dreamText.length);

      var promptParts: string[] = [];
      promptParts.push('# Role');
      promptParts.push('你是一位专注于生命叙事与原型分析的心理咨询师。你的特长是从一系列零散的梦境中，识别出用户反复出现的生命课题。');
      promptParts.push('');
      promptParts.push('# Knowledge Base');
      promptParts.push('参考荣格流派的解读视角:');
      promptParts.push('- 掉牙/身体破碎: 象征力量感的丧失或言说困难');
      promptParts.push('- 回到旧房子/教室: 回到那个时期的自己，未解决的情感遗留');
      promptParts.push('- 迟到/赶车/迷路: 对机会的恐惧、社会时钟的压迫感');
      promptParts.push('- 被追逐: 追逐者是用户试图逃避的阴影(Shadow)');
      promptParts.push('');
      promptParts.push('# Input Data');
      promptParts.push('以下是用户最近的梦境记录:');
      promptParts.push(dreamText);
      promptParts.push('');
      promptParts.push('# Analysis Task');
      promptParts.push('请分析这些梦境的共同模式，并撰写一份心灵成长报告(200-300字):');
      promptParts.push('1. 识别母题: 指出反复出现的主题');
      promptParts.push('2. 深度解读: 解释母题背后的心理动力，指出这是一种未完成的心理任务');
      promptParts.push('3. 转化的契机: 观察梦境中微小的变化，或提示用户尝试新的回应方式');
      promptParts.push('');
      promptParts.push('# Output Tone');
      promptParts.push('具有洞察力且充满希望。让用户感到被深深地理解，并看到了改变的可能。');

      var analyzePrompt = promptParts.join(NL);
      console.log('Analyze prompt length:', analyzePrompt.length);

      var resultText = await callGemini(apiKey, analyzePrompt);
      console.log('Analysis result length:', resultText.length);

      return new Response(JSON.stringify({ analysis: resultText || '暂未发现明显的模式。' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('TOP LEVEL ERROR:', String(error));
    return new Response(JSON.stringify({ error: '抱歉，我现在无法进行解读。', details: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});