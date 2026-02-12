import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function callGemini(apiKey: string, prompt: string): Promise<string> {
    console.log('Calling Gemini API...');

    const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error:', response.status, errorText);
        throw new Error('Gemini API Error: ' + response.status + ' - ' + errorText);
    }

    const data = await response.json();
    console.log('Gemini response received');
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function buildReflectPrompt(dream: any): string {
    const scenes = (dream.keywords?.scenes || []).join(', ') || '未提供';
    const characters = (dream.keywords?.characters || []).join(', ') || '未提供';
    const emotions = (dream.keywords?.emotions || []).join(', ') || '未提供';
    const objects = (dream.keywords?.objects || []).join(', ') || '未提供';
    const strongestEmotion = dream.decoding?.strongestEmotion || '未提供';
    const recentLifeLink = dream.decoding?.recentLifeLink || '未提供';
    const movieTheme = dream.decoding?.movieTheme || '未提供';
    const association = dream.association || '未提供';

    return [
        '# Role',
        '你是一位深谙荣格心理学（Jungian Psychology）的潜意识分析师。你不仅仅是在解读梦，更是在帮助用户通过梦境这面镜子，看见那些被忽略的自己。',
        '',
        '# Core Philosophy (必须严格遵守的分析逻辑)',
        '1.  **情绪是内核 (Emotion as Core)**：梦境不直接复制现实，而是捕捉情感内核。例如：梦见"考试"通常不是关于学业，而是关于"被审视的恐惧"或"自我价值的焦虑"。请务必剥离剧情，直击情绪。',
        '2.  **人物即自我 (Characters as Projection)**：梦里的人物（无论是严厉的老师、无助的孩子、神秘的杀手）都是用户心理结构的投射。请分析这些人代表了用户性格中的哪个侧面（如：超我、内在小孩、阴影）。',
        '3.  **物件即符号 (Objects as Symbols)**：物件的含义完全取决于用户的【自由联想】。水对游泳者是自由，对溺水者是恐惧。必须结合用户的个人经历来解读，禁止套用通用词典。',
        '',
        '# Input Data',
        '用户的梦境记录：',
        '1. [梦的碎片]',
        '   - 场景: ' + scenes,
        '   - 人物: ' + characters,
        '   - 情绪: ' + emotions,
        '   - 特别物件: ' + objects,
        '2. [情感解码]',
        '   - 核心情绪: ' + strongestEmotion,
        '   - 现实映射: ' + recentLifeLink,
        '   - 电影主题: ' + movieTheme,
        '3. [自由联想] (解梦的唯一钥匙): ' + association,
        '',
        '# Analysis Task',
        '请按照以下步骤思考，然后输出一段温暖、治愈且直击人心的分析（约 300 字）：',
        '',
        '1.  **第一步：识别"自我"的侧面**',
        '    - 观察【人物】和【自由联想】。指出梦里的那个人物其实是用户内心的哪个部分？（例如："那个严厉的考官，或许就是你内心那个从不允许自己犯错的严苛自我。"）',
        '',
        '2.  **第二步：解码"情绪"的真相**',
        '    - 结合【场景】与【现实映射】。指出这个梦境场景背后隐藏的真实焦虑或渴望是什么？（例如："这不是关于迟到，而是关于你对自己可能错过人生重要机会的深层恐慌。"）',
        '',
        '3.  **第三步：整合与疗愈**',
        '    - 结合【特别物件】的个人意义。将这一切串联起来，告诉用户这个梦是潜意识送来的什么礼物？它在提醒用户接纳什么，或改变什么？',
        '',
        '# Output Tone',
        '像一位深夜长谈的智者，温柔、包容、不评判。使用"也许"、"这可能象征着"、"这让你联想到"等引导性语言，而不是绝对的断言。',
        '',
        '# Output Structure',
        '请直接输出分析内容，包含以下三个段落：',
        '**🔍 镜中的自我 (The Projection)**：侧重分析人物投射与情绪内核。',
        '**🗝️ 潜意识的密语 (The Symbol)**：侧重分析物件与联想的深层含义。',
        '**💡 觉察与整合 (Integration)**：给出一句温暖的结语，帮助用户接纳这个梦带来的启示。',
    ].join('\n');
}

function buildAnalyzePrompt(dreamSummaries: string): string {
    return [
        '# Role',
        '你是一位专注于"生命叙事"与"原型分析"的心理咨询师。你的特长是从一系列零散的梦境中，识别出用户反复出现的生命课题。',
        '',
        '# Knowledge Base (常见梦境原型的深度解读参考)',
        '在分析时，请参考（但不限于）以下荣格流派的解读视角：',
        '- **掉牙/身体破碎**：不仅是健康焦虑，更往往象征"力量感的丧失"、"言说困难（无法表达真实自我）"或"无法咀嚼/消化当下的生活变故"。',
        '- **回到旧房子/教室**：通常不是怀念地点，而是回到了"那个时期的自己"。象征着某种未解决的情感遗留，或潜意识渴望找回那个阶段丢失的某种特质。',
        '- **迟到/赶车/迷路**：现代人的集体焦虑。象征着对"机会"的恐惧、对"社会时钟"的压迫感，或自我期待带来的沉重负担。',
        '- **被追逐**：追逐者往往是用户试图逃避的"阴影"（Shadow）。',
        '',
        '# Input Data',
        dreamSummaries,
        '',
        '# Analysis Task',
        '请分析这些梦境的共同模式，并撰写一份"心灵成长报告"（200-300字）：',
        '',
        '1.  **识别母题 (Identify the Motif)**：',
        '    - 指出反复出现的主题是什么？（例如："我注意到你频繁梦见回到以前的学校，或者在考试中迟到。"）',
        '',
        '2.  **深度解读 (Deep Interpretation)**：',
        '    - 结合【Knowledge Base】与用户的具体情况，解释这个母题背后的心理动力。告诉用户，潜意识为什么要反复播放这部电影？它在强迫用户面对什么？',
        '    - *关键点*：必须指出这是一种"未完成的心理任务"。',
        '',
        '3.  **转化的契机 (The Turning Point)**：',
        '    - 观察梦境中微小的变化（例如：从单纯的逃跑变成回头看了一眼）。如果没有变化，就温柔地提示用户：在现实中尝试一种新的回应方式（例如：接纳那个无助的自己），看看梦境是否会随之改变。',
        '',
        '# Output Tone',
        '具有洞察力且充满希望。让用户感到被深深地理解，并看到了改变的可能。',
    ].join('\n');
}

Deno.serve(async (req: Request) => {
    console.log('Request received:', req.method, req.url);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const action = url.searchParams.get('action');
        console.log('Action:', action);

        const apiKey = Deno.env.get('GEMINI_API_KEY');
        if (!apiKey) {
            console.error('GEMINI_API_KEY not found in environment');
            return new Response(JSON.stringify({ error: 'API Key not configured' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const body = await req.json();

        if (action === 'reflect') {
            const { dream } = body;

            if (!dream) {
                return new Response(JSON.stringify({ error: 'Missing dream data' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            const prompt = buildReflectPrompt(dream);
            console.log('Prompt length:', prompt.length);
            const text = await callGemini(apiKey, prompt);
            console.log('Reflection generated, length:', text.length);

            return new Response(JSON.stringify({ reflection: text || '此刻由于信号波动，我无法连接到梦境的彼岸。但请相信，你的每一个感受都被宇宙温柔地接纳了。' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });

        } else if (action === 'analyze') {
            const { dreams } = body;

            if (!dreams || dreams.length === 0) {
                return new Response(JSON.stringify({ analysis: '还没有足够的梦境来分析模式。' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            const lines: string[] = [];
            for (const d of dreams) {
                const date = new Date(d.timestamp).toLocaleDateString();
                const theme = d.decoding?.movieTheme || '未知';
                const emotion = d.decoding?.strongestEmotion || '未知';
                const symbols = (d.keywords?.objects || []).join(', ') || '未知';
                lines.push('- 日期: ' + date + ', 电影主题: ' + theme + ', 核心情绪: ' + emotion + ', 关键象征: ' + symbols);
            }
            const dreamSummaries = lines.join('\n');

            const prompt = buildAnalyzePrompt(dreamSummaries);
            const text = await callGemini(apiKey, prompt);

            return new Response(JSON.stringify({ analysis: text || '暂未发现明显的模式。' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });

        } else {
            return new Response(JSON.stringify({ error: 'Invalid action. Use ?action=reflect or ?action=analyze' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

    } catch (error) {
        console.error('Edge Function Error:', error);
        return new Response(JSON.stringify({ error: '抱歉，我现在无法进行解读。请稍后再试。', details: String(error) }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
