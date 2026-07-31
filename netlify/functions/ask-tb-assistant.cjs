const { createClient } = require('@supabase/supabase-js');
const { getSupabaseConfig } = require('./supabase-config.cjs');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized.' }) };
    }
    const token = authHeader.split(' ')[1];

    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
    
    // Admin client for overriding RLS during text search if needed
    const supabaseAdmin = createClient(supabaseUrl, adminKey);

    // User client for saving messages under their exact identity (respects RLS)
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid session.' }) };
    }

    const { question } = JSON.parse(event.body || '{}');
    if (!question || typeof question !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'A valid question is required.' }) };
    }

    // 1. SAVE USER QUESTION TO DB
    await userSupabase.from('messages').insert({
      user_id: user.id,
      role: 'user',
      content: question
    });

    // 2. FETCH CHAT HISTORY FOR AI CONTEXT
    const { data: history } = await userSupabase
      .from('messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6);
    
    // Reverse to chronological
    const previousMessages = (history || []).reverse().map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    // 3. RAG RETRIEVAL
    const searchTerms = question.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(word => word.length > 3).join(' | ');
    let fetchedFacts = [];
    if (searchTerms) {
      const { data: searchResults } = await supabaseAdmin.from('tb_information')
        .select('title, content, category')
        .textSearch('content', searchTerms, { type: 'websearch', config: 'english' }).limit(4);
      if (searchResults) fetchedFacts = searchResults;
    }
    if (fetchedFacts.length === 0) {
      const { data: fallbackData } = await supabaseAdmin.from('tb_information').select('title, content, category').limit(3);
      fetchedFacts = fallbackData || [];
    }

    const contextString = fetchedFacts.map((item, idx) => `[Fact ${idx + 1}] Title: ${item.title}\nContent: ${item.content}`).join('\n\n');

    const systemInstruction = `You are "Moyo Assistant", an expert, empathetic AI medical care companion for Tuberculosis patients.
CRITICAL MANDATE:
1. You MUST answer the patient's question ONLY using the verified medical facts provided below.
2. If the answer cannot be found in the provided context, you MUST state word-for-word: "I'm sorry, but I don't have verified medical information in my clinic database to answer this specific question. Please consult your TB healthcare provider directly."
3. Do NOT invent or use outside external medical knowledge.

VERIFIED MEDICAL CONTEXT:
${contextString ? contextString : "No relevant records found in database."}`;

    // 4. GENERATE AI RESPONSE (Using OpenRouter / OpenAI format)
    const apiKey = process.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Fast OpenRouter model
        messages: [
          { role: "system", content: systemInstruction },
          ...previousMessages,
          { role: "user", content: question }
        ]
      })
    });

    const aiData = await aiRes.json();
    const answerText = aiData.choices?.[0]?.message?.content || "I was unable to generate an answer. Please consult your healthcare provider.";
    const sources = fetchedFacts.map(f => ({ title: f.title, category: f.category }));

    // 5. SAVE AI RESPONSE TO DB
    await userSupabase.from('messages').insert({
      user_id: user.id,
      role: 'bot',
      content: answerText,
      sources: sources
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ answer: answerText, sources })
    };

  } catch (error) {
    console.error('Error in ask-tb-assistant:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
